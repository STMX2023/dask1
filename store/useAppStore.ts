import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        setCurrentUser: (user) => set({ currentUser: user }),
        
        setTeamMembers: (members) => set({ teamMembers: members }),
        
        addActivity: (activity) => 
          set((state) => ({ 
            activities: [...state.activities, activity] 
          })),
        
        updateActivity: (id, updates) =>
          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id ? { ...activity, ...updates } : activity
            ),
          })),
        
        deleteActivity: (id) =>
          set((state) => ({
            activities: state.activities.filter((activity) => activity.id !== id),
          })),
        
        // Timer actions
        startTimer: () =>
          set((state) => ({
            currentTimer: {
              ...state.currentTimer,
              isRunning: true,
              startTime: new Date().toISOString(),
            },
          })),
        
        stopTimer: () => {
          const state = get();
          const { currentTimer } = state;
          
          if (currentTimer.isRunning && currentTimer.startTime) {
            const endTime = new Date().toISOString();
            const startTime = new Date(currentTimer.startTime).getTime();
            const endTimeMs = new Date(endTime).getTime();
            const duration = Math.floor((endTimeMs - startTime) / 1000);
            const date = new Date().toISOString().split('T')[0];
            
            const session: TimerSession = {
              id: `timer_${Date.now()}`,
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
          set((state) => ({
            timerSessions: [...state.timerSessions, session],
          })),
        
        toggleDarkMode: () =>
          set((state) => ({ isDarkMode: !state.isDarkMode })),
        
        toggleAnimations: () =>
          set((state) => ({ animationsEnabled: !state.animationsEnabled })),
        
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
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('Store rehydrated successfully');
          } else {
            console.warn('Store rehydration failed');
          }
        },
      }
    ),
    {
      name: 'app-store',
    }
  )
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