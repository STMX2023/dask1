import { Platform, Dimensions } from 'react-native';
import { withSpring, withTiming } from 'react-native-reanimated';

// Device performance detection
const getDevicePerformanceLevel = () => {
  const { width, height } = Dimensions.get('window');
  const pixelCount = width * height;
  
  // Simple heuristic based on screen resolution and platform
  if (Platform.OS === 'ios') {
    return pixelCount > 2000000 ? 'high' : 'medium';
  }
  
  // Android performance detection
  if (pixelCount > 2000000) return 'high';
  if (pixelCount > 1000000) return 'medium';
  return 'low';
};

export const PERFORMANCE_LEVEL = getDevicePerformanceLevel();

// Animation settings based on performance
export const AnimationSettings = {
  high: {
    particleCount: 20,
    particleSize: { min: 10, max: 30 },
    animationDuration: 10000,
    springDamping: 15,
    springStiffness: 150,
    enableShadows: true,
    enableBlur: true,
    maxConcurrentAnimations: 10,
    frameRate: 60,
  },
  medium: {
    particleCount: 12,
    particleSize: { min: 8, max: 20 },
    animationDuration: 12000,
    springDamping: 20,
    springStiffness: 100,
    enableShadows: true,
    enableBlur: false,
    maxConcurrentAnimations: 6,
    frameRate: 30,
  },
  low: {
    particleCount: 6,
    particleSize: { min: 6, max: 15 },
    animationDuration: 15000,
    springDamping: 25,
    springStiffness: 80,
    enableShadows: false,
    enableBlur: false,
    maxConcurrentAnimations: 3,
    frameRate: 30,
  },
};

export const currentSettings = AnimationSettings[PERFORMANCE_LEVEL];

// Optimized spring animation
export const optimizedSpring = (value: number, config?: any) => {
  'worklet';
  return withSpring(value, {
    damping: currentSettings.springDamping,
    stiffness: currentSettings.springStiffness,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    ...config,
  });
};

// Optimized timing animation
export const optimizedTiming = (value: number, config?: any) => {
  'worklet';
  return withTiming(value, {
    duration: 300,
    easing: (t: number) => {
      'worklet';
      // Fast ease-out curve
      return 1 - Math.pow(1 - t, 3);
    },
    ...config,
  });
};

// Frame rate limiter for animations
export class FrameRateLimiter {
  private lastFrameTime = 0;
  private targetFrameTime: number;

  constructor(targetFPS: number = currentSettings.frameRate) {
    this.targetFrameTime = 1000 / targetFPS;
  }

  shouldRender(): boolean {
    const now = Date.now();
    if (now - this.lastFrameTime >= this.targetFrameTime) {
      this.lastFrameTime = now;
      return true;
    }
    return false;
  }
}

// Animation queue to prevent too many concurrent animations
export class AnimationQueue {
  private queue: Array<() => void> = [];
  private running = 0;
  private maxConcurrent = currentSettings.maxConcurrentAnimations;

  add(animation: () => void) {
    this.queue.push(animation);
    this.processQueue();
  }

  private processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const animation = this.queue.shift();
      if (animation) {
        this.running++;
        animation();
        // Simulate animation completion
        setTimeout(() => {
          this.running--;
          this.processQueue();
        }, 16); // One frame
      }
    }
  }
}

// Batch DOM updates
export const batchedUpdates = (() => {
  let pending: Array<() => void> = [];
  let rafId: number | null = null;

  const flush = () => {
    const updates = pending;
    pending = [];
    rafId = null;
    updates.forEach(update => update());
  };

  return (update: () => void) => {
    pending.push(update);
    if (!rafId) {
      rafId = requestAnimationFrame(flush);
    }
  };
})();