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

interface AppState {
  // User state
  currentUser: User | null;
  teamMembers: User[];
  
  // Activities state
  activities: Activity[];
  
  // UI state
  isDarkMode: boolean;
  animationsEnabled: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setTeamMembers: (members: User[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
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