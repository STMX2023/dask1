import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const useStoreIntegration = () => {
  const colorScheme = useColorScheme();
  const { isDarkMode, setCurrentUser, setTeamMembers } = useAppStore();

  // Sync system dark mode with store
  useEffect(() => {
    if (colorScheme && isDarkMode !== (colorScheme === 'dark')) {
      useAppStore.getState().toggleDarkMode();
    }
  }, [colorScheme, isDarkMode]);

  // Initialize default data
  useEffect(() => {
    // Set current user if not set
    if (!useAppStore.getState().currentUser) {
      setCurrentUser({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        status: 'online',
      });
    }

    // Set team members if empty
    if (useAppStore.getState().teamMembers.length === 0) {
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
  }, [setCurrentUser, setTeamMembers]);
};