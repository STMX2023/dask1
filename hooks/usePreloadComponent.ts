import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

export const usePreloadComponent = (
  importFn: () => Promise<any>,
  delay: number = 1000
) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        // Preload the component by calling the import function
        importFn().catch(error => {
          console.warn('Failed to preload component:', error);
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [importFn, delay]);
};