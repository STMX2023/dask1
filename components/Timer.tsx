import React, { useEffect, useState, useCallback, memo } from 'react';
import { Text, View } from 'react-native';
import { useCurrentTimer } from '../store/useAppStore';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';
import tw from '../utils/tw';

// Format seconds to MM:SS format
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface TimerProps {
  isCompact?: boolean;
}

export const Timer = memo<TimerProps>(({ isCompact = false }) => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const currentTimer = useCurrentTimer();
  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Calculate elapsed time locally to avoid store updates
  const calculateElapsedTime = useCallback(() => {
    if (currentTimer.isRunning && currentTimer.startTime) {
      const startTime = new Date(currentTimer.startTime).getTime();
      const now = Date.now();
      return Math.floor((now - startTime) / 1000);
    }
    return 0;
  }, [currentTimer.isRunning, currentTimer.startTime]);

  // Update display every second when running
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (currentTimer.isRunning && currentTimer.startTime) {
      // Set initial time immediately
      setDisplaySeconds(calculateElapsedTime());
      
      interval = setInterval(() => {
        setDisplaySeconds(calculateElapsedTime());
      }, 1000);
    } else {
      // Reset to 0 when not running
      setDisplaySeconds(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentTimer.isRunning, currentTimer.startTime, calculateElapsedTime]);

  const textSize = isCompact ? 'text-2xl' : 'text-4xl';
  const fontFamily = isCompact ? 'font-bold' : 'font-mono font-bold';
  
  return (
    <View style={tw`items-center justify-center`}>
      <Text
        style={tw.style(`${textSize} ${fontFamily} tracking-wider`, {
          color: theme.textPrimary,
        })}
      >
        {formatTime(displaySeconds)}
      </Text>
    </View>
  );
});

Timer.displayName = 'Timer';