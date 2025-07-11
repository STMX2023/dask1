import React, { memo, useMemo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import tw from '../utils/tw';

// Pre-compute ALL styles at module level
const styles = {
  container: tw`absolute bottom-0 left-0 right-0`,
  tabBar: tw`bg-black rounded-full mx-6 mb-6`,
  tabsContainer: tw`flex-row px-8 py-4`,
  tabItem: tw`flex-1 items-center justify-center`,
  indicator: tw`bg-white rounded-full h-0.5 absolute bottom-2`,
  iconGroup: tw`flex-row items-center gap-2.5`,
  arrowButton: tw`absolute right-4 items-center justify-center w-8 h-8`,
};

// Constants
const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#777777';
const INDICATOR_WIDTH = 25;
const ICON_SIZES = {
  add: 30,
  group: 20,
  default: 24,
};
const ANIMATION_CONFIG = {
  duration: 150,
  easing: Easing.out(Easing.quad),
};

// Create animated component once
const AnimatedIndicator = Animated.View;

// Tab icon component - optimized with no inline styles
const TabIcon = memo<{
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLayout?: (event: any) => void;
}>(({ routeName, isFocused, onPress, onLayout }) => {
  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
  
  if (routeName === 'index') {
    return (
      <Pressable
        onPressIn={onPress}
        onLayout={onLayout}
        style={styles.tabItem}
        android_disableSound={true}
      >
        <Ionicons 
          name="add" 
          size={ICON_SIZES.add} 
          color={color}
        />
      </Pressable>
    );
  }
  
  if (routeName === 'two') {
    return (
      <Pressable
        onPressIn={onPress}
        onLayout={onLayout}
        style={styles.tabItem}
        android_disableSound={true}
      >
        <View style={styles.iconGroup}>
          <Ionicons name="options" size={ICON_SIZES.group} color={color} />
          <Ionicons name="mic" size={ICON_SIZES.group} color={color} />
          <Ionicons name="stats-chart" size={ICON_SIZES.group} color={color} />
        </View>
      </Pressable>
    );
  }
  
  return (
    <Pressable
      onPressIn={onPress}
      onLayout={onLayout}
      style={styles.tabItem}
      android_disableSound={true}
    >
      <Ionicons 
        name="ellipse-outline" 
        size={ICON_SIZES.default} 
        color={color}
      />
    </Pressable>
  );
}, (prev, next) => 
  prev.isFocused === next.isFocused && 
  prev.routeName === next.routeName
);

TabIcon.displayName = 'TabIcon';

export const CustomTabBar = memo<BottomTabBarProps>(({ 
  state, 
  descriptors, 
  navigation 
}) => {
  // Shared values
  const translateX = useSharedValue(0);
  const tabPositions = useSharedValue<number[]>([]);
  const indicatorWidth = useSharedValue(INDICATOR_WIDTH);
  
  const activeIndex = state.index;
  
  // Arrow state
  const [isArrowUp, setIsArrowUp] = React.useState(true);
  
  // Layout handler for indicator
  const handleIndicatorLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    runOnUI(() => {
      'worklet';
      indicatorWidth.value = width;
      // Recalculate all tab positions with new indicator width
      tabPositions.value.forEach((_, index) => {
        if (tabPositions.value[index] !== undefined) {
          // This will be updated when tabs re-layout
        }
      });
    })();
  }, []);
  
  // Layout handler for individual tabs
  const handleTabLayout = useCallback((index: number) => (event: any) => {
    const { x, width } = event.nativeEvent.layout;
    
    runOnUI(() => {
      'worklet';
      const centerX = x + width / 2 - indicatorWidth.value / 2;
      tabPositions.value[index] = centerX;
      if (index === activeIndex) {
        translateX.value = centerX;
      }
    })();
  }, [activeIndex]);
  
  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth.value,
  }));
  
  // Update position when tab changes
  React.useEffect(() => {
    runOnUI(() => {
      'worklet';
      if (tabPositions.value[activeIndex] !== undefined) {
        translateX.value = withTiming(tabPositions.value[activeIndex], ANIMATION_CONFIG);
      }
    })();
  }, [activeIndex]);
  
  // Memoize tab press handlers
  const tabHandlers = useMemo(() => {
    return state.routes.map((route, index) => () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      
      if (state.index !== index && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    });
  }, [state.routes, state.index, navigation]);
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            
            return (
              <TabIcon
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={tabHandlers[index]}
                onLayout={handleTabLayout(index)}
              />
            );
          })}
        </View>
        
        {/* Indicator */}
        <AnimatedIndicator 
          style={[styles.indicator, animatedIndicatorStyle]} 
          onLayout={handleIndicatorLayout}
          pointerEvents="none"
        />
        
        {/* Arrow Button */}
        <Pressable
          style={[styles.arrowButton, { top: '50%', marginTop: -16 }]}
          onPress={() => setIsArrowUp(!isArrowUp)}
        >
          <Ionicons 
            name={isArrowUp ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={ACTIVE_COLOR}
          />
        </Pressable>
      </View>
    </View>
  );
}, (prev, next) => 
  prev.state.index === next.state.index &&
  prev.state.routes.length === next.state.routes.length
);

CustomTabBar.displayName = 'CustomTabBar';