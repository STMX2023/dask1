import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { getOrCreateEncryptionKey, getKeyInfo } from '../utils/keyManager';
import '../utils/keyManagerDebug'; // Import debug utilities

// Define types for our store
interface User {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'away' | 'offline';
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'meeting' | 'task' | 'event';
  completed: boolean;
}

interface TimerSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  date: string; // YYYY-MM-DD format
}

interface AppState {
  // User state
  currentUser: User | null;
  teamMembers: User[];

  // Activities state
  activities: Activity[];

  // Timer state
  timerSessions: TimerSession[];
  currentTimer: {
    isRunning: boolean;
    startTime: string | null;
  };

  // UI state
  isDarkMode: boolean;
  animationsEnabled: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setTeamMembers: (members: User[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  // Timer actions
  startTimer: () => void;
  stopTimer: () => void;
  saveTimerSession: (session: TimerSession) => void;

  toggleDarkMode: () => void;
  toggleAnimations: () => void;

  // Computed values
  getCompletedActivitiesCount: () => number;
  getActiveProjectsCount: () => number;
}

// Initialize MMKV with secure key management
let storage: MMKV;
let isStorageInitialized = false;

// Initialize storage with secure key
const initializeStorage = async () => {
  try {
    const encryptionKey = await getOrCreateEncryptionKey();
    storage = new MMKV({
      id: 'dask-driver-storage',
      encryptionKey,
    });
    isStorageInitialized = true;
    // MMKV initialized with secure encryption key
  } catch (error) {
    console.error('[Store] Failed to initialize MMKV with secure key:', error);
    // Fallback to unencrypted storage if key management fails
    storage = new MMKV({
      id: 'dask-driver-storage-fallback',
    });
    isStorageInitialized = true;
    console.warn('[Store] Using fallback unencrypted storage');
  }
};

// Initialize storage immediately
initializeStorage().catch((error: unknown) => {
  console.error('[Store] Failed to initialize storage:', error);
});

// Set up periodic key rotation check (every 24 hours)
const KEY_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const checkKeyRotation = async () => {
  try {
    const keyInfo = await getKeyInfo();
    if (keyInfo.needsRotation) {
      // Key rotation needed, reinitializing storage...
      initializeStorage().catch((error: unknown) => {
        console.error('[Store] Failed to reinitialize storage:', error);
      });
    }
  } catch (error) {
    console.error('[Store] Key rotation check failed:', error);
  }
};

// Start periodic key rotation check
setInterval(() => {
  checkKeyRotation().catch((error: unknown) => {
    console.error('[Store] Scheduled key rotation check failed:', error);
  });
}, KEY_CHECK_INTERVAL);

// Create MMKV storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    if (!isStorageInitialized) {
      // Storage not initialized yet, returning null
      return null;
    }
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    if (!isStorageInitialized) {
      // Storage not initialized yet, cannot set item
      return;
    }
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    if (!isStorageInitialized) {
      // Storage not initialized yet, cannot remove item
      return;
    }
    storage.delete(name);
  },
};

// Create the store with persistence and error handling
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentUser: null,
        teamMembers: [],
        activities: [],
        timerSessions: [],
        currentTimer: {
          isRunning: false,
          startTime: null,
        },
        isDarkMode: false,
        animationsEnabled: true,

        // Actions
        setCurrentUser: (user) => { set({ currentUser: user }); },

        setTeamMembers: (members) => { set({ teamMembers: members }); },

        addActivity: (activity) =>
          { set((state) => ({
            activities: [...state.activities, activity],
          })); },

        updateActivity: (id, updates) =>
          { set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id ? { ...activity, ...updates } : activity,
            ),
          })); },

        deleteActivity: (id) =>
          { set((state) => ({
            activities: state.activities.filter((activity) => activity.id !== id),
          })); },

        // Timer actions
        startTimer: () =>
          { set((state) => ({
            currentTimer: {
              ...state.currentTimer,
              isRunning: true,
              startTime: new Date().toISOString(),
            },
          })); },

        stopTimer: () => {
          const state = get();
          const { currentTimer } = state;

          if (currentTimer.isRunning && currentTimer.startTime) {
            const endTime = new Date().toISOString();
            const startTime = new Date(currentTimer.startTime).getTime();
            const endTimeMs = new Date(endTime).getTime();
            const duration = Math.floor((endTimeMs - startTime) / 1000);
            const dateParts = new Date().toISOString().split('T');
            const date = dateParts[0] ?? '';

            const session: TimerSession = {
              id: `timer_${String(Date.now())}`,
              startTime: currentTimer.startTime,
              endTime,
              duration,
              date,
            };

            // Save session and reset timer
            set((state) => ({
              timerSessions: [...state.timerSessions, session],
              currentTimer: {
                isRunning: false,
                startTime: null,
              },
            }));
          }
        },

        saveTimerSession: (session) =>
          { set((state) => ({
            timerSessions: [...state.timerSessions, session],
          })); },

        toggleDarkMode: () => { set((state) => ({ isDarkMode: !state.isDarkMode })); },

        toggleAnimations: () => { set((state) => ({ animationsEnabled: !state.animationsEnabled })); },

        // Computed values
        getCompletedActivitiesCount: () => {
          const { activities } = get();
          return activities.filter((a) => a.completed).length;
        },

        getActiveProjectsCount: () => {
          const { activities } = get();
          return activities.filter((a) => !a.completed && a.type === 'task').length;
        },
      }),
      {
        name: 'app-storage',
        storage: createJSONStorage(() => mmkvStorage),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Store rehydrated successfully with MMKV
          } else {
            // Store rehydration failed
          }
        },
      },
    ),
    {
      name: 'app-store',
    },
  ),
);

// Selectors for performance optimization
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useTeamMembers = () => useAppStore((state) => state.teamMembers);
export const useActivities = () => useAppStore((state) => state.activities);
export const useIsDarkMode = () => useAppStore((state) => state.isDarkMode);
export const useAnimationsEnabled = () => useAppStore((state) => state.animationsEnabled);

// Timer selectors
export const useTimerSessions = () => useAppStore((state) => state.timerSessions);
export const useCurrentTimer = () => useAppStore((state) => state.currentTimer);
export const useStartTimer = () => useAppStore((state) => state.startTimer);
export const useStopTimer = () => useAppStore((state) => state.stopTimer);
