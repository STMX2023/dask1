import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

export const useInteractionManager = () => {
  const [interactionsComplete, setInteractionsComplete] = useState(false);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setInteractionsComplete(true);
    });

    return () => { handle.cancel(); };
  }, []);

  return interactionsComplete;
};
