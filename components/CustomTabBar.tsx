import React, { memo, useMemo, useCallback } from 'react';
import { View, Pressable, LayoutChangeEvent } from 'react-native';
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
import { useIsDarkMode } from '../store/useAppStore';

// Constants
const INDICATOR_WIDTH = 25;
const ICON_SIZES = {
  add: 26,
  group: 18, // Reduced for better alignment
  default: 24,
} as const;

const ANIMATION_CONFIG = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};

const COLLAPSED_HEIGHT = 72;
const EXPANDED_HEIGHT = 180;

// Base styles (theme-independent)
const baseStyles = {
  container: tw`absolute bottom-0 left-0 right-0`,
  tabBarWrapper: tw`mx-6 mb-6`,
  tabsContainer: tw`flex-row px-8`,
  tabItem: tw`flex-1 items-center justify-center`,
  iconGroup: tw`flex-row items-center justify-center`,
  arrowButton: tw`absolute right-4 items-center justify-center w-8 h-8`,
};

// Tab icon component
const TabIcon = memo<{
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  activeColor: string;
  inactiveColor: string;
}>(({ routeName, isFocused, onPress, onLayout, activeColor, inactiveColor }) => {
  const color = isFocused ? activeColor : inactiveColor;
  
  if (routeName === 'index') {
    return (
      <Pressable
        onPressIn={onPress}
        onLayout={onLayout}
        style={baseStyles.tabItem}
        android_disableSound={true}
      >
        <Ionicons 
          name="home" 
          size={ICON_SIZES.default} 
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
        style={baseStyles.tabItem}
        android_disableSound={true}
      >
        <Ionicons 
          name="settings" 
          size={ICON_SIZES.default} 
          color={color}
        />
      </Pressable>
    );
  }
  
  return (
    <Pressable
      onPressIn={onPress}
      onLayout={onLayout}
      style={baseStyles.tabItem}
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
  prev.routeName === next.routeName &&
  prev.activeColor === next.activeColor &&
  prev.inactiveColor === next.inactiveColor
);

TabIcon.displayName = 'TabIcon';

export const CustomTabBar = memo<BottomTabBarProps>(({ 
  state, 
  navigation 
}) => {
  const isDark = useIsDarkMode();
  
  // Theme-aware styles and colors
  const { styles, activeColor, inactiveColor } = useMemo(() => {
    const iconColor = isDark ? '#FFFFFF' : '#1C1C1E';
    return {
      styles: {
        tabBar: tw.style('overflow-hidden', { 
          backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
        }),
        indicator: tw.style('rounded-full h-0.5 absolute', { 
          backgroundColor: iconColor
        }),
      },
      activeColor: iconColor,
      inactiveColor: iconColor,
    };
  }, [isDark]);
  
  // Shared animated values - initialize with stable references
  const translateX = useSharedValue(0);
  const tabPositions = useSharedValue<number[]>([0, 0]); // Pre-allocate for 2 tabs
  const indicatorWidth = useSharedValue(INDICATOR_WIDTH);
  const tabBarHeight = useSharedValue(COLLAPSED_HEIGHT);
  const borderRadius = useSharedValue(36);
  
  const activeIndex = state.index;
  
  // Arrow expansion state
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Layout handler for indicator
  const handleIndicatorLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Defer to avoid render-time access
    setTimeout(() => {
      runOnUI(() => {
        'worklet';
        indicatorWidth.value = width;
      })();
    }, 0);
  }, [indicatorWidth]);
  
  // Layout handler for individual tabs
  const handleTabLayout = useCallback((index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const isActive = index === activeIndex;
    
    runOnUI(() => {
      'worklet';
      const centerX = x + width / 2 - indicatorWidth.value / 2;
      tabPositions.value[index] = centerX;
      if (isActive) {
        translateX.value = centerX;
      }
    })();
  }, [activeIndex, indicatorWidth, tabPositions, translateX]);
  
  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth.value,
  }));
  
  // Animated tab bar style
  const animatedTabBarStyle = useAnimatedStyle(() => ({
    height: tabBarHeight.value,
    borderTopLeftRadius: borderRadius.value,
    borderTopRightRadius: borderRadius.value,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  }));
  
  // Update position when tab changes
  React.useEffect(() => {
    // Ensure we don't access shared values during render
    const updatePosition = () => {
      runOnUI(() => {
        'worklet';
        if (tabPositions.value[activeIndex] !== undefined) {
          translateX.value = withTiming(tabPositions.value[activeIndex], ANIMATION_CONFIG);
        }
      })();
    };
    
    // Defer execution to avoid render-time access
    const timer = setTimeout(updatePosition, 0);
    return () => clearTimeout(timer);
  }, [activeIndex, tabPositions, translateX]);
  
  // Toggle expansion
  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      const targetHeight = next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
      
      runOnUI(() => {
        'worklet';
        tabBarHeight.value = withTiming(targetHeight, ANIMATION_CONFIG);
      })();
      
      return next;
    });
  }, [tabBarHeight]);
  
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
    <View style={baseStyles.container}>
      <View style={baseStyles.tabBarWrapper}>
        <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
          {/* Tab icons container */}
          <View style={{ 
            position: 'absolute',
            bottom: (COLLAPSED_HEIGHT - 48) / 2,
            left: 0,
            right: 0,
            height: 48,
          }}>
            <View style={[baseStyles.tabsContainer, { 
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 0,
              paddingBottom: 0,
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
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                  />
                );
              })}
            </View>
          </View>

          {/* Active tab indicator */}
          <Animated.View 
            style={[styles.indicator, animatedIndicatorStyle, {
              position: 'absolute',
              bottom: 8,
            }]} 
            onLayout={handleIndicatorLayout}
            pointerEvents="none"
          />
          
          {/* Expansion arrow button */}
          <Pressable
            style={[baseStyles.arrowButton, { 
              position: 'absolute',
              bottom: (COLLAPSED_HEIGHT - 32) / 2,
              right: 32,
            }]}
            onPress={toggleExpansion}
          >
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-up"} 
              size={20} 
              color={activeColor}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}, (prev, next) => 
  prev.state.index === next.state.index &&
  prev.state.routes.length === next.state.routes.length
);

CustomTabBar.displayName = 'CustomTabBar';