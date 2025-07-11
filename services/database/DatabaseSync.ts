import { createClient } from '@supabase/supabase-js';
import { open } from '@op-engineering/op-sqlite';

// Example sync layer architecture
export class DatabaseSync {
  private db;
  private supabase;
  private syncInProgress = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.db = open({ name: 'dask.db' });
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeTables();
  }

  private async initializeTables() {
    // Local tables mirror Supabase schema
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        completed BOOLEAN,
        created_at INTEGER,
        updated_at INTEGER,
        sync_status TEXT DEFAULT 'pending',
        version INTEGER DEFAULT 1
      );
      
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        operation TEXT,
        record_id TEXT,
        data TEXT,
        created_at INTEGER
      );
    `);
  }

  // Track local changes
  async trackChange(table: string, operation: string, recordId: string, data: any) {
    await this.db.execute(
      'INSERT INTO sync_queue (table_name, operation, record_id, data, created_at) VALUES (?, ?, ?, ?, ?)',
      [table, operation, recordId, JSON.stringify(data), Date.now()]
    );
  }

  // Sync to Supabase
  async syncToCloud() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const changes = await this.db.execute('SELECT * FROM sync_queue ORDER BY created_at');
      
      for (const change of changes.rows) {
        const data = JSON.parse(change.data as string);
        
        switch (change.operation) {
          case 'insert':
            await this.supabase.from(change.table_name as string).insert(data);
            break;
          case 'update':
            await this.supabase.from(change.table_name as string).update(data).eq('id', change.record_id);
            break;
          case 'delete':
            await this.supabase.from(change.table_name as string).delete().eq('id', change.record_id);
            break;
        }
        
        // Remove from queue after successful sync
        await this.db.execute('DELETE FROM sync_queue WHERE id = ?', [change.id]);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Pull from Supabase
  async syncFromCloud() {
    const lastSync = await this.getLastSyncTime();
    
    const { data: activities } = await this.supabase
      .from('activities')
      .select('*')
      .gt('updated_at', lastSync);
    
    for (const activity of activities || []) {
      await this.db.execute(
        `INSERT OR REPLACE INTO activities 
         (id, title, description, completed, created_at, updated_at, sync_status) 
         VALUES (?, ?, ?, ?, ?, ?, 'synced')`,
        [activity.id, activity.title, activity.description, 
         activity.completed, activity.created_at, activity.updated_at]
      );
    }
    
    await this.setLastSyncTime(Date.now());
  }

  // Real-time subscription
  subscribeToChanges(table: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  // Conflict resolution (Last Write Wins)
  async resolveConflict(local: any, remote: any) {
    return local.updated_at > remote.updated_at ? local : remote;
  }

  // Helper methods
  private async getLastSyncTime(): Promise<string> {
    const result = await this.db.execute('SELECT value FROM sync_metadata WHERE key = ?', ['last_sync_time']);
    return result.rows.length > 0 ? (result.rows[0].value as string) : '1970-01-01T00:00:00Z';
  }

  private async setLastSyncTime(timestamp: number): Promise<void> {
    const isoTime = new Date(timestamp).toISOString();
    await this.db.execute(
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)',
      ['last_sync_time', isoTime]
    );
  }
}