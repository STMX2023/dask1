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
  tabBarWrapper: tw`mx-6 mb-6`,
  tabBar: tw`bg-black overflow-hidden`, // Remove rounded-full, we'll animate this
  tabsContainer: tw`flex-row px-8`,
  tabItem: tw`flex-1 items-center justify-center`,
  indicator: tw`bg-white rounded-full h-0.5 absolute`,
  iconGroup: tw`flex-row items-center gap-2.5`,
  arrowButton: tw`absolute right-4 items-center justify-center w-8 h-8`,
};

// Constants
const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#777777';
const INDICATOR_WIDTH = 25;
const ICON_SIZES = {
  add: 26,
  group: 20,
  default: 24,
};
const ANIMATION_CONFIG = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};
const COLLAPSED_HEIGHT = 72;
const EXPANDED_HEIGHT = 180;
const ICON_AREA_HEIGHT = 72; // Height of the bottom icon area that never changes

// Create animated components once
const AnimatedIndicator = Animated.View;
const AnimatedTabBar = Animated.View;

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
        <View style={{ aspectRatio: 1 }}>
          <Ionicons 
            name="add" 
            size={ICON_SIZES.add} 
            color={color}
          />
        </View>
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
  const tabBarHeight = useSharedValue(COLLAPSED_HEIGHT);
  const expandedContentHeight = useSharedValue(0);
  const borderRadius = useSharedValue(36); // Start as pill-shaped (36px radius)
  
  const activeIndex = state.index;
  
  // Arrow state
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Layout handler for indicator
  const handleIndicatorLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    runOnUI(() => {
      'worklet';
      indicatorWidth.value = width;
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
  
  // Animated tab bar style for expansion with custom border radius
  const animatedTabBarStyle = useAnimatedStyle(() => ({
    height: tabBarHeight.value,
    borderTopLeftRadius: borderRadius.value,
    borderTopRightRadius: borderRadius.value,
    borderBottomLeftRadius: 36, // Keep bottom rounded (half of collapsed height)
    borderBottomRightRadius: 36, // Keep bottom rounded (half of collapsed height)
  }));
  
  // Animated expanded content style
  const animatedExpandedContentStyle = useAnimatedStyle(() => ({
    height: expandedContentHeight.value,
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
  
  // Toggle expansion function
  const toggleExpansion = useCallback(() => {
    setIsExpanded(!isExpanded);
    const targetHeight = !isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    const targetExpandedHeight = !isExpanded ? EXPANDED_HEIGHT - ICON_AREA_HEIGHT : 0;
    const targetBorderRadius = !isExpanded ? 24 : 36; // 24px radius when expanded, 36px when collapsed (keeps pill shape)
    
    tabBarHeight.value = withTiming(targetHeight, ANIMATION_CONFIG);
    expandedContentHeight.value = withTiming(targetExpandedHeight, ANIMATION_CONFIG);
    borderRadius.value = withTiming(targetBorderRadius, ANIMATION_CONFIG);
  }, [isExpanded]);
  
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
      <View style={styles.tabBarWrapper}>
        <AnimatedTabBar style={[styles.tabBar, animatedTabBarStyle]}>
          {/* Expanded content area - at the top */}
          <Animated.View style={[animatedExpandedContentStyle, { 
            paddingHorizontal: 32,
            paddingTop: 16,
            justifyContent: 'center',
          }]}>
            {/* Add your expanded content here */}
            {isExpanded && (
              <View>
                {/* Additional controls, settings, etc. */}
              </View>
            )}
          </Animated.View>
          
          {/* Fixed bottom area with icons - always 72px high */}
          <View style={{ 
            height: ICON_AREA_HEIGHT,
            position: 'relative',
          }}>
            {/* Icons container - absolutely positioned to stay centered */}
            <View style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: ICON_AREA_HEIGHT,
              justifyContent: 'center', // Center content vertically
            }}>
              <View style={[styles.tabsContainer, { 
                paddingTop: 0,
                paddingBottom: 0,
                height: 48, // Fixed height for icon container
                alignItems: 'center',
              }]}>
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
            </View>
            
            {/* Indicator - positioned at bottom of icon area */}
            <AnimatedIndicator 
              style={[styles.indicator, animatedIndicatorStyle, {
                bottom: 8,
              }]} 
              onLayout={handleIndicatorLayout}
              pointerEvents="none"
            />
            
            {/* Arrow Button - absolutely positioned */}
            <Pressable
              style={[styles.arrowButton, { 
                position: 'absolute',
                top: (ICON_AREA_HEIGHT - 32) / 2, // Center in the 72px area
                right: 32,
              }]}
              onPress={toggleExpansion}
            >
              <Ionicons 
                name={isExpanded ? "chevron-down" : "chevron-up"} 
                size={20} 
                color={ACTIVE_COLOR}
              />
            </Pressable>
          </View>
        </AnimatedTabBar>
      </View>
    </View>
  );
}, (prev, next) => 
  prev.state.index === next.state.index &&
  prev.state.routes.length === next.state.routes.length
);

CustomTabBar.displayName = 'CustomTabBar';