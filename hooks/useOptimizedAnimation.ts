import { useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  useSharedValue, 
  withSpring, 
  withTiming,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { currentSettings, FrameRateLimiter } from '../utils/animationOptimizer';

interface UseOptimizedAnimationOptions {
  autoStart?: boolean;
  loop?: boolean;
  onComplete?: () => void;
}

export const useOptimizedAnimation = (
  from: number,
  to: number,
  duration: number,
  options: UseOptimizedAnimationOptions = {}
) => {
  const { autoStart = true, loop = false, onComplete } = options;
  const value = useSharedValue(from);
  const frameRateLimiter = useRef(new FrameRateLimiter()).current;
  const isRunning = useRef(false);

  // Monitor performance and adapt
  useAnimatedReaction(
    () => value.value,
    (current, previous) => {
      'worklet';
      // Skip updates if frame rate limiter says no
      if (!frameRateLimiter.shouldRender()) {
        return;
      }
      
      // Check if animation completed
      if (!loop && Math.abs(current - to) < 0.01 && onComplete) {
        runOnJS(onComplete)();
      }
    }
  );

  const start = useCallback(() => {
    'worklet';
    if (isRunning.current && !loop) return;
    
    isRunning.current = true;
    
    if (Platform.OS === 'ios' || currentSettings.frameRate >= 60) {
      // Use spring for smooth iOS animations
      value.value = withSpring(to, {
        damping: currentSettings.springDamping,
        stiffness: currentSettings.springStiffness,
      });
    } else {
      // Use timing for predictable Android animations
      value.value = withTiming(to, {
        duration,
        easing: (t: number) => {
          'worklet';
          // Ease-out quad
          return t * (2 - t);
        },
      });
    }
    
    if (loop) {
      value.value = withTiming(to, { duration }, () => {
        'worklet';
        value.value = from;
        runOnJS(() => {
          isRunning.current = false;
          start();
        })();
      });
    }
  }, [from, to, duration, loop, value]);

  const stop = useCallback(() => {
    cancelAnimation(value);
    isRunning.current = false;
  }, [value]);

  const reset = useCallback(() => {
    cancelAnimation(value);
    value.value = from;
    isRunning.current = false;
  }, [from, value]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    
    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    value,
    start,
    stop,
    reset,
    isRunning: () => isRunning.current,
  };
};