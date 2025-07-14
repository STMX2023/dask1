import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
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
  theme: any;
}>(({ label, isActive, onPress, theme }) => {
  const styles = useMemo(() => ({
    container: {
      flex: 1,
      height: TAB_HEIGHT,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      fontSize: 14,
      fontWeight: isActive ? '600' as const : '400' as const,
      color: isActive ? theme.textPrimary : theme.textTertiary,
    }
  }), [isActive, theme]);

  return (
    <Pressable
      onPressIn={onPress}
      style={styles.container}
      android_disableSound={true}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
});

// Constants
const TAB_HEIGHT = 40;
const TIMING_CONFIG = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

TabItem.displayName = 'TabItem';

// Create animated component once
const AnimatedIndicator = Animated.View;

export const SwippableTabBarExtreme = memo<SwippableTabBarExtremeProps>(({
  tabs,
  activeTab,
  onTabChange,
}) => {
  // Get theme
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  
  // Minimal shared values
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(100);
  
  const tabCount = tabs.length;
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Dynamic styles based on theme
  const styles = useMemo(() => ({
    container: {
      backgroundColor: theme.surfaceSecondary,
      borderRadius: 24,
      padding: 6,
    },
    tabContainer: {
      flexDirection: 'row' as const,
    },
    indicator: {
      position: 'absolute' as const,
      top: 6,
      left: 6,
      backgroundColor: theme.surface,
      borderRadius: 18,
      // Shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    }
  }), [theme, isDark]);
  
  // Direct animation function
  // const _animateToIndex = useCallback((index: number, width: number) => {
  //   'worklet';
  //   const position = index * (width / tabCount);
  //   translateX.value = withTiming(position, TIMING_CONFIG);
  // }, [tabCount]);
  
  // Pre-create all handlers
  const handlers = useMemo(() => 
    tabs.map((tab, index) => () => {
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
    [tabs, onTabChange, tabCount, indicatorWidth, translateX]
  );

  // Single layout handler
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;
    const width = containerWidth - 12; // Account for padding
    
    runOnUI(() => {
      'worklet';
      indicatorWidth.value = width;
      
      // Set initial position without animation
      if (activeIndex >= 0) {
        const position = activeIndex * (width / tabCount);
        translateX.value = position;
      }
    })();
  }, [activeIndex, tabCount, indicatorWidth, translateX]);

  // Single animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: (indicatorWidth.value / tabCount) - 4,
    height: TAB_HEIGHT,
  }));

  // Update on external change
  React.useEffect(() => {
    if (activeIndex >= 0) {
      const width = indicatorWidth.value;
      if (width > 0) {
        runOnUI(() => {
          'worklet';
          const position = activeIndex * (width / tabCount);
          translateX.value = withTiming(position, TIMING_CONFIG);
        })();
      }
    }
  }, [activeIndex, tabCount]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <AnimatedIndicator style={[styles.indicator, animatedStyle]} />
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.id}
            label={tab.label}
            isActive={tab.id === activeTab}
            onPress={handlers[index]}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}, (prev, next) => 
  prev.activeTab === next.activeTab && 
  prev.tabs === next.tabs &&
  prev.onTabChange === next.onTabChange
);

SwippableTabBarExtreme.displayName = 'SwippableTabBarExtreme';