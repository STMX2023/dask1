import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const useStoreIntegration = () => {
  const colorScheme = useColorScheme();
  const { setCurrentUser, setTeamMembers } = useAppStore();

  // Sync system dark mode with store only on initial mount
  useEffect(() => {
    try {
      // Only sync on initial mount when store hasn't been initialized yet
      const state = useAppStore.getState();
      if (colorScheme && !state.currentUser) {
        // This is likely the first load, sync with system preference
        if (state.isDarkMode !== (colorScheme === 'dark')) {
          state.toggleDarkMode();
        }
      }
    } catch (error) {
      console.warn('Error syncing dark mode:', error);
    }
  }, []); // Empty dependency array - only run once on mount

  // Initialize default data
  useEffect(() => {
    try {
      const state = useAppStore.getState();
      
      // Set current user if not set
      if (!state.currentUser) {
        setCurrentUser({
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com',
          status: 'online',
        });
      }

      // Set team members if empty
      if (state.teamMembers.length === 0) {
        setTeamMembers([
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            status: 'online',
          },
          {
            id: '3',
            name: 'Marcus Chen',
            email: 'marcus.chen@company.com',
            status: 'away',
          },
        ]);
      }
    } catch (error) {
      console.warn('Error initializing store data:', error);
    }
  }, [setCurrentUser, setTeamMembers]);
};