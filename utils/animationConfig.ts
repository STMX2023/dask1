import { Platform } from 'react-native';

// Animation configuration based on device capabilities
export const animationConfig = {
  // Reduce animation complexity on Android for better performance
  shouldReduceMotion: Platform.OS === 'android',

  // Animation durations
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },

  // Spring configurations
  springs: {
    tight: {
      damping: 20,
      stiffness: 200,
    },
    loose: {
      damping: 15,
      stiffness: 100,
    },
    bouncy: {
      damping: 12,
      stiffness: 200,
    },
  },

  // Performance optimizations
  performance: {
    maxParticles: Platform.OS === 'ios' ? 15 : 8,
    enableComplexAnimations: Platform.OS === 'ios',
    enableBackdropBlur: Platform.OS === 'ios',
    staggerDelay: Platform.OS === 'ios' ? 150 : 200,
  },
};

// Helper to get optimized animation config
export const getOptimizedAnimation = (
  type: 'spring' | 'timing',
  customConfig?: Record<string, unknown>,
) => {
  const baseConfig =
    type === 'spring'
      ? animationConfig.springs.tight
      : { duration: animationConfig.durations.normal };

  return {
    type,
    ...baseConfig,
    ...customConfig,
    // Add performance optimizations
    useNativeDriver: true,
  };
};
