# Supabase Sync Implementation Guide

This guide explains how to implement cloud sync using Supabase with op-sqlite for the Dask1 app.

## Overview

Our sync architecture provides:

- Offline-first functionality with op-sqlite
- Real-time sync with Supabase
- Conflict resolution (Last Write Wins)
- Queue-based sync for reliability
- Integration with existing Zustand store

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   UI Layer  │ ←→  │ Zustand Store│ ←→  │  Sync Layer │
└─────────────┘     └──────────────┘     └─────────────┘
                            ↓                      ↓
                    ┌──────────────┐     ┌─────────────┐
                    │  op-sqlite   │     │  Supabase   │
                    │   (Local)    │     │   (Cloud)   │
                    └──────────────┘     └─────────────┘
```

## Prerequisites

1. **Supabase Account**: Create a project at https://supabase.com
2. **Database Schema**: Set up tables in Supabase
3. **API Keys**: Get your project URL and anon key

## Step 1: Install Dependencies

```bash
yarn add @supabase/supabase-js
```

## Step 2: Supabase Schema

Create these tables in your Supabase dashboard:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('meeting', 'task', 'event')),
  completed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth needs)
CREATE POLICY "Users can view all users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view all activities" ON activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create activities" ON activities
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

## Step 3: Environment Configuration

Create `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Database Service Implementation

The sync service is located at `services/database/DatabaseSync.ts`. Key features:

### Initialize Database

```typescript
const dbSync = new DatabaseSync(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Sync Operations

1. **Track Local Changes**

```typescript
// When creating an activity locally
await dbSync.trackChange('activities', 'insert', activityId, activityData);
```

2. **Sync to Cloud**

```typescript
// Sync all pending changes
await dbSync.syncToCloud();
```

3. **Pull from Cloud**

```typescript
// Get latest changes from Supabase
await dbSync.syncFromCloud();
```

4. **Real-time Updates**

```typescript
// Subscribe to changes
const subscription = dbSync.subscribeToChanges('activities', (payload) => {
  console.log('Activity changed:', payload);
});
```

## Step 5: Integration with Zustand

Update the Zustand store to use the sync layer:

```typescript
// In store/useAppStore.ts
import { dbSync } from '../services/database';

const useAppStore = create((set, get) => ({
  // ... existing state ...

  addActivity: async (activity) => {
    // Add to local database
    await dbSync.addActivity(activity);

    // Update store
    set((state) => ({
      activities: [...state.activities, activity],
    }));

    // Queue for sync
    await dbSync.trackChange('activities', 'insert', activity.id, activity);
  },

  syncActivities: async () => {
    await dbSync.syncToCloud();
    await dbSync.syncFromCloud();

    // Refresh local state from database
    const activities = await dbSync.getAllActivities();
    set({ activities });
  },
}));
```

## Step 6: Auto Sync Implementation

Create a sync manager that runs periodically:

```typescript
// hooks/useAutoSync.ts
export const useAutoSync = () => {
  const { syncActivities } = useAppStore();

  useEffect(() => {
    // Initial sync
    syncActivities();

    // Sync every 30 seconds
    const interval = setInterval(syncActivities, 30000);

    // Sync on app foreground
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncActivities();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [syncActivities]);
};
```

## Step 7: Conflict Resolution

The default implementation uses Last Write Wins (LWW):

```typescript
async resolveConflict(local: any, remote: any) {
  // Compare timestamps
  if (local.updated_at > remote.updated_at) {
    return local; // Keep local version
  } else {
    return remote; // Use remote version
  }
}
```

For more complex scenarios, implement:

- Version vectors
- Three-way merge
- User-prompted resolution

## Step 8: Error Handling

Implement retry logic for failed syncs:

```typescript
async syncWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await this.syncToCloud();
      break;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

## Testing Sync

1. **Test Offline Mode**
   - Turn off network
   - Create/update activities
   - Turn network back on
   - Verify sync completes

2. **Test Conflict Resolution**
   - Update same record on two devices
   - Verify last update wins

3. **Test Real-time Sync**
   - Open app on two devices
   - Create activity on one
   - Verify it appears on other

## Performance Considerations

1. **Batch Operations**: Sync multiple changes in one request
2. **Incremental Sync**: Only sync changes since last sync
3. **Compression**: Compress large payloads
4. **Pagination**: Handle large datasets in chunks

## Security Best Practices

1. **Row Level Security**: Always enable RLS in Supabase
2. **Authentication**: Implement proper user authentication
3. **Data Validation**: Validate all data before syncing
4. **Encryption**: Consider encrypting sensitive data

## Monitoring

Track sync metrics:

- Sync success/failure rate
- Average sync duration
- Conflict frequency
- Queue size

## Troubleshooting

### Sync Not Working

1. Check network connectivity
2. Verify Supabase credentials
3. Check sync queue for errors
4. Review Supabase logs

### Data Inconsistencies

1. Check conflict resolution logic
2. Verify timestamp accuracy
3. Review sync order

### Performance Issues

1. Reduce sync frequency
2. Implement incremental sync
3. Optimize database queries

## Next Steps

1. Implement authentication
2. Add end-to-end encryption
3. Create sync status UI
4. Add offline indicators
5. Implement advanced conflict resolution
