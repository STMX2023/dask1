import React, { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';

interface DelayedRenderProps {
  delay?: number;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}

export const DelayedRender: React.FC<DelayedRenderProps> = ({ 
  delay = 0, 
  children, 
  placeholder = null 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (delay === 0) {
      InteractionManager.runAfterInteractions(() => {
        setShouldRender(true);
      });
    } else {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return shouldRender ? <>{children}</> : <>{placeholder}</>;
};