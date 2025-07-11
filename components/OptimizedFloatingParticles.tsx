import React, { useMemo, memo } from 'react';
import { View, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import tw from '../utils/tw';
import { currentSettings, FrameRateLimiter } from '../utils/animationOptimizer';

interface Particle {
  id: string;
  startX: number;
  startY: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  pathRadius: number;
}

interface OptimizedFloatingParticlesProps {
  count?: number;
  colors?: string[];
}

// Individual particle component - heavily optimized
const Particle = memo(({ particle }: { particle: Particle }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    // Start opacity animation
    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withRepeat(
          withSequence(
            withTiming(0.3, { duration: particle.duration / 2 }),
            withTiming(0.6, { duration: particle.duration / 2 })
          ),
          -1,
          true
        )
      )
    );

    // Start movement animation
    progress.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(1, {
          duration: particle.duration,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(opacity);
    };
  }, [particle.delay, particle.duration, progress, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2;
    const x = particle.startX + Math.cos(angle) * particle.pathRadius;
    const y = particle.startY + Math.sin(angle) * particle.pathRadius * 0.6; // Elliptical path
    
    const scale = interpolate(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [0.8, 1.2, 0.8, 1.2, 0.8]
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        tw`absolute rounded-full`,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          // Only add shadows on iOS or high-performance Android
          ...(currentSettings.enableShadows && {
            shadowColor: particle.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: particle.size / 4,
            elevation: Platform.OS === 'android' ? 2 : 0,
          }),
        },
        animatedStyle,
      ]}
    />
  );
});

Particle.displayName = 'Particle';

export const OptimizedFloatingParticles = memo(({ 
  count = currentSettings.particleCount, 
  colors = ['#60A5FA', '#A78BFA', '#F87171', '#34D399', '#FBBF24'] 
}: OptimizedFloatingParticlesProps) => {
  const { width, height } = useWindowDimensions();

  const particles = useMemo(() => {
    const newParticles: Particle[] = [];
    const { min, max } = currentSettings.particleSize;
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (max - min) + min;
      newParticles.push({
        id: `particle-${i}`,
        startX: Math.random() * (width - size),
        startY: Math.random() * (height - size),
        size,
        color: colors[i % colors.length], // Distribute colors evenly
        duration: currentSettings.animationDuration + (Math.random() * 5000),
        delay: (i * 200) % 2000, // Stagger delays
        pathRadius: 50 + Math.random() * 100,
      });
    }
    return newParticles;
  }, [width, height, count, colors]);

  return (
    <View style={tw`absolute inset-0`} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
});

OptimizedFloatingParticles.displayName = 'OptimizedFloatingParticles';