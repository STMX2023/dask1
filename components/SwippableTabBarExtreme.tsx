import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import tw from '../utils/tw';

interface Tab {
  id: string;
  label: string;
}

interface SwippableTabBarExtremeProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// ALL styles pre-computed - zero runtime overhead
const containerStyle = tw`bg-gray-100 dark:bg-gray-800 rounded-3xl p-1.5`;
const tabContainerStyle = tw`flex-row`;
const indicatorStyle = tw`absolute top-1.5 left-1.5 bg-white dark:bg-gray-700 rounded-2xl`;
const tabItemStyle = tw`items-center justify-center`;
const activeTextStyle = tw`text-sm font-semibold text-black dark:text-white`;
const inactiveTextStyle = tw`text-sm font-normal text-gray-500 dark:text-gray-400`;

// Constants
const TAB_HEIGHT = 40;
const TIMING_CONFIG = {
  duration: 100,
  easing: Easing.out(Easing.quad),
};

// Static tab - no animations, no props functions
const TabItem = memo<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}>(({ label, isActive, onPress }) => (
  <Pressable
    onPressIn={onPress} // Instant response
    style={[tabItemStyle, { flex: 1, height: TAB_HEIGHT }]}
    android_disableSound={true}
  >
    <Text style={isActive ? activeTextStyle : inactiveTextStyle}>
      {label}
    </Text>
  </Pressable>
));

TabItem.displayName = 'TabItem';

// Create animated component once
const AnimatedIndicator = Animated.View;

export const SwippableTabBarExtreme = memo<SwippableTabBarExtremeProps>(({
  tabs,
  activeTab,
  onTabChange,
}) => {
  // Minimal shared values
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(100);
  
  const tabCount = tabs.length;
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  // Direct animation function
  const animateToIndex = useCallback((index: number, width: number) => {
    'worklet';
    const position = index * (width / tabCount);
    translateX.value = withTiming(position, TIMING_CONFIG);
  }, [tabCount]);
  
  // Pre-create all handlers
  const handlers = useMemo(() => 
    tabs.map((tab, index) => () => {
      onTabChange(tab.id);
      // Animate on UI thread directly
      runOnUI(() => {
        'worklet';
        const width = indicatorWidth.value;
        const position = index * (width / tabCount);
        translateX.value = withTiming(position, TIMING_CONFIG);
      })();
    }), 
    [tabs, onTabChange, tabCount, indicatorWidth]
  );

  // Single layout handler
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width - 12;
    indicatorWidth.value = width;
    
    // Set initial position without animation
    translateX.value = activeIndex * (width / tabCount);
  }, [activeIndex, tabCount]);

  // Single animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: (indicatorWidth.value / tabCount) - 4,
    height: TAB_HEIGHT,
  }));

  // Update on external change
  React.useEffect(() => {
    const width = indicatorWidth.value;
    if (width > 0) {
      runOnUI(animateToIndex)(activeIndex, width);
    }
  }, [activeIndex, animateToIndex]);

  return (
    <View style={containerStyle} onLayout={handleLayout}>
      <AnimatedIndicator style={[indicatorStyle, animatedStyle]} />
      <View style={tabContainerStyle}>
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.id}
            label={tab.label}
            isActive={tab.id === activeTab}
            onPress={handlers[index]}
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