import React, { useState, useEffect, memo } from 'react';
import { MotiText } from 'moti';
import tw from '../utils/tw';

interface ClockProps {
  isDark: boolean;
}

// Isolated clock component that only re-renders itself
export const Clock = memo(({ isDark }: ClockProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <MotiText
        from={{ opacity: 0, translateX: -50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 400 }}
        style={tw`text-5xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}
      >
        {formatTime(currentTime)}
      </MotiText>
      
      <MotiText
        from={{ opacity: 0, translateX: -50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 800 }}
        style={tw`text-lg ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
      >
        {formatDate(currentTime)}
      </MotiText>
    </>
  );
});

Clock.displayName = 'Clock';