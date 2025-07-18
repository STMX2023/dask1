import React, { memo, useMemo, useCallback } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';

interface Tab {
  id: string;
  label: string;
}

interface SwippableTabBarExtremeProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Styled tab item component
const TabItem = memo<{
  label: string;
  isActive: boolean;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
}>(({ label, isActive, onPress, theme }) => {
  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
        height: TAB_HEIGHT,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      text: {
        fontSize: 14,
        fontWeight: isActive ? ('500' as const) : ('500' as const),
        color: isActive ? theme.textPrimary : theme.textInverse, // White text on blue background
        paddingHorizontal: 8,
        textAlign: 'center' as const,
      },
    }),
    [isActive, theme],
  );

  return (
    <Pressable onPressIn={onPress} style={styles.container} android_disableSound>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
});

// Constants
const TAB_HEIGHT = 40; // Height of the selector pill (primary measurement)
const PILL_PADDING_VERTICAL = 4; // Top and bottom padding
const PILL_PADDING_HORIZONTAL = 4; // Left and right padding
const CONTAINER_HEIGHT = TAB_HEIGHT + PILL_PADDING_VERTICAL * 2; // Auto-calculated container height

// Shadow/Elevation settings for the selector pill
const PILL_SHADOW_LIGHT = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.2,
  shadowRadius: 7,
  elevation: 7, // Android elevation
};

const PILL_SHADOW_DARK = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
  elevation: 6, // Higher elevation for dark mode
};

const TIMING_CONFIG = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

TabItem.displayName = 'TabItem';

// Create animated component once
const AnimatedIndicator = Animated.View;

interface SwippableTabBarExtremePropsWithStyle extends SwippableTabBarExtremeProps {
  style?: ViewStyle;
}

export const SwippableTabBarExtreme = memo<SwippableTabBarExtremePropsWithStyle>(
  ({ tabs, activeTab, onTabChange, style }) => {
    // Get theme
    const isDark = useIsDarkMode();
    const theme = getTheme(isDark);

    // Minimal shared values
    const translateX = useSharedValue(0);
    const indicatorWidth = useSharedValue(100);

    const tabCount = tabs.length;
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

    // Dynamic styles based on theme
    const styles = useMemo(
      () => ({
        container: {
          height: CONTAINER_HEIGHT,
          borderRadius: CONTAINER_HEIGHT / 2, // Fully rounded
          paddingVertical: PILL_PADDING_VERTICAL,
          paddingHorizontal: PILL_PADDING_HORIZONTAL,
          backgroundColor: theme.blue, // Using solid blue instead of gradient
          position: 'relative' as const,
        },
        tabContainer: {
          flexDirection: 'row' as const,
          height: TAB_HEIGHT,
          alignItems: 'center' as const,
        },
        indicator: {
          position: 'absolute' as const,
          top: PILL_PADDING_VERTICAL,
          left: PILL_PADDING_HORIZONTAL,
          backgroundColor: theme.surface,
          borderRadius: TAB_HEIGHT / 2, // Fully rounded pill
          // Apply theme-specific shadow
          ...(isDark ? PILL_SHADOW_DARK : PILL_SHADOW_LIGHT),
        },
      }),
      [theme, isDark],
    );

    // Direct animation function
    // const _animateToIndex = useCallback((index: number, width: number) => {
    //   'worklet';
    //   const position = index * (width / tabCount);
    //   translateX.value = withTiming(position, TIMING_CONFIG);
    // }, [tabCount]);

    // Pre-create all handlers
    const handlers = useMemo(
      () =>
        tabs.map((tab, index) => () => {
          // Light haptic feedback for tab selection
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            // Ignore haptic errors
          });
          onTabChange(tab.id);
          // Animate on UI thread directly
          runOnUI(() => {
            'worklet';
            const width = indicatorWidth.value;
            if (width > 0) {
              const tabWidth = width / tabCount;
              const position = index * tabWidth;
              translateX.value = withTiming(position, TIMING_CONFIG);
            }
          })();
        }),
      [tabs, onTabChange, tabCount, indicatorWidth, translateX],
    );

    // Single layout handler
    const handleLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const containerWidth = e.nativeEvent.layout.width;
        const availableWidth = containerWidth - PILL_PADDING_HORIZONTAL * 2; // Account for horizontal padding

        runOnUI(() => {
          'worklet';
          indicatorWidth.value = availableWidth;

          // Set initial position without animation
          if (activeIndex >= 0) {
            const position = activeIndex * (availableWidth / tabCount);
            translateX.value = position;
          }
        })();
      },
      [activeIndex, tabCount, indicatorWidth, translateX],
    );

    // Single animated style
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      width: indicatorWidth.value / tabCount,
      height: TAB_HEIGHT,
    }));

    // Update on external change
    React.useEffect(() => {
      if (activeIndex >= 0) {
        runOnUI(() => {
          'worklet';
          const width = indicatorWidth.value;
          if (width > 0) {
            const position = activeIndex * (width / tabCount);
            translateX.value = withTiming(position, TIMING_CONFIG);
          }
        })();
      }
    }, [activeIndex, tabCount, indicatorWidth, translateX]);

    return (
      <View style={[styles.container, style]} onLayout={handleLayout}>
        <AnimatedIndicator style={[styles.indicator, animatedStyle]} />
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TabItem
              key={tab.id}
              label={tab.label}
              isActive={tab.id === activeTab}
              onPress={handlers[index] ?? (() => {
                // Fallback handler
              })}
              theme={theme}
            />
          ))}
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.activeTab === next.activeTab &&
    prev.tabs === next.tabs &&
    prev.onTabChange === next.onTabChange &&
    prev.style === next.style,
);

SwippableTabBarExtreme.displayName = 'SwippableTabBarExtreme';
