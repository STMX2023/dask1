import React, { ReactNode, memo } from 'react';
import { ScrollView, ScrollViewProps, Platform } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { currentSettings } from '../utils/animationOptimizer';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface OptimizedParallaxScrollProps extends ScrollViewProps {
  children: ReactNode;
  headerHeight?: number;
  parallaxStrength?: number;
}

export const OptimizedParallaxScroll = memo(({
  children,
  headerHeight = 200,
  parallaxStrength = 0.5,
  ...props
}: OptimizedParallaxScrollProps) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Only update if performance allows
      if (Platform.OS === 'ios' || currentSettings.frameRate >= 60) {
        scrollY.value = event.contentOffset.y;
      } else {
        // Throttle updates on lower-end devices
        const rounded = Math.round(event.contentOffset.y / 10) * 10;
        if (Math.abs(scrollY.value - rounded) > 10) {
          scrollY.value = rounded;
        }
      }
    },
  });

  // Note: headerHeight and parallaxStrength are available for future parallax implementation
  // Currently using standard scroll for maximum performance

  return (
    <AnimatedScrollView
      {...props}
      onScroll={scrollHandler}
      scrollEventThrottle={Platform.OS === 'ios' ? 1 : 16}
      // Performance optimizations
      removeClippedSubviews={Platform.OS === 'android'}
    >
      {children}
    </AnimatedScrollView>
  );
});

OptimizedParallaxScroll.displayName = 'OptimizedParallaxScroll';