import { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';

export const useDelayedMount = (delay = 0): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (delay === 0) {
      const handle = InteractionManager.runAfterInteractions(() => {
        setIsMounted(true);
      });
      return () => { handle.cancel(); };
    } else {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, delay);
      return () => { clearTimeout(timer); };
    }
  }, [delay]);

  return isMounted;
};
