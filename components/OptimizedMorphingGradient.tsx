import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { currentSettings } from '../utils/animationOptimizer';

interface OptimizedMorphingGradientProps {
  colors?: string[];
  duration?: number;
}

export const OptimizedMorphingGradient = memo(({
  colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  duration = currentSettings.animationDuration,
}: OptimizedMorphingGradientProps) => {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // Simple color transition
    progress.value = withRepeat(
      withTiming(1, {
        duration: duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Subtle rotation for movement effect
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: duration }),
        withTiming(-5, { duration: duration }),
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(rotation);
    };
  }, [duration, progress, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    // Use opacity and transform for performance instead of color interpolation
    return {
      opacity: 0.3 + progress.value * 0.2, // Subtle opacity animation
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: 1 + progress.value * 0.05 }, // Subtle scale animation
      ],
    };
  });

  // Use multiple overlapping views with different colors for gradient effect
  return (
    <View style={styles.container}>
      {colors.slice(0, 3).map((color, index) => (
        <Animated.View
          key={`gradient-${index}`}
          style={[
            styles.gradientLayer,
            animatedStyle,
            {
              backgroundColor: color,
              opacity: 0.2,
              transform: [
                { translateX: index * 20 },
                { translateY: index * 20 },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
});

OptimizedMorphingGradient.displayName = 'OptimizedMorphingGradient';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientLayer: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
});