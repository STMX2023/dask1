import React, { memo, useMemo, useCallback } from 'react';
import { View, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import tw from '../utils/tw';
import { useIsDarkMode } from '../store/useAppStore';
import { getTheme } from '../constants/Colors';

// Constants
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

// Nav bar configuration per route
const NAV_CONFIG = {
  'index': { 
    lockExpanded: true,
    showArrow: false,
    icons: ['house', 'gear'] // Custom icons for home page
  },
  'settings': { 
    lockExpanded: false, 
    showArrow: false, // No arrow on settings page
    icons: ['house', 'gear'] // Standard icons for settings
  },
} as const;

const DEFAULT_CONFIG = {
  lockExpanded: false,
  showArrow: true,
  icons: ['house', 'gear']
} as const;

// Base styles (theme-independent)
const baseStyles = {
  container: tw`absolute bottom-0 left-0 right-0`,
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
  iconName: string;
}>(({ isFocused, onPress, onLayout, activeColor, inactiveColor, iconName }) => {
  const color = isFocused ? activeColor : inactiveColor;
  
  return (
    <Pressable
      onPressIn={onPress}
      onLayout={onLayout}
      style={baseStyles.tabItem}
      android_disableSound={true}
    >
      <FontAwesome6 
        name={iconName as keyof typeof FontAwesome6.glyphMap} 
        size={ICON_SIZES.default} 
        color={color}
      />
    </Pressable>
  );
}, (prev, next) => 
  prev.isFocused === next.isFocused && 
  prev.activeColor === next.activeColor &&
  prev.inactiveColor === next.inactiveColor &&
  prev.iconName === next.iconName
);

TabIcon.displayName = 'TabIcon';

export const CustomTabBar = memo<BottomTabBarProps>(({ 
  state, 
  navigation 
}) => {
  const isDark = useIsDarkMode();
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  const currentRoute = state.routes[activeIndex]?.name;
  
  // Get configuration for current route
  const config = NAV_CONFIG[currentRoute as keyof typeof NAV_CONFIG] || DEFAULT_CONFIG;
  
  // Theme-aware styles and colors
  const { styles, activeColor, inactiveColor } = useMemo(() => {
    const theme = getTheme(isDark);
    const activeIconColor = isDark ? theme.textPrimary : theme.textPrimary;
    const inactiveIconColor = isDark ? theme.tabIconDefault : theme.tabIconDefault;
    
    return {
      styles: {
        tabBar: tw.style('overflow-hidden', { 
          backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
        }),
        indicator: tw.style('rounded-full h-0.5 absolute', { 
          backgroundColor: activeIconColor
        }),
      },
      activeColor: activeIconColor,
      inactiveColor: inactiveIconColor,
    };
  }, [isDark]);
  
  // Shared animated values - initialize with stable references
  const translateX = useSharedValue(0);
  const tabPositions = useSharedValue<number[]>([0, 0]); // Pre-allocate for 2 tabs
  const tabBarHeight = useSharedValue(config.lockExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  const borderRadius = useSharedValue(36);
  
  // Arrow expansion state - only relevant for non-locked routes
  const [isExpanded, setIsExpanded] = React.useState(config.lockExpanded);
  
  
  // Layout handler for individual tabs
  const handleTabLayout = useCallback((index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const isActive = index === activeIndex;
    
    runOnUI(() => {
      'worklet';
      const centerX = x + width / 2;
      tabPositions.value[index] = centerX;
      if (isActive) {
        translateX.value = centerX;
      }
    })();
  }, [activeIndex, tabPositions, translateX]);
  
  
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
  
  // Toggle expansion - only works if not locked
  const toggleExpansion = useCallback(() => {
    if (config.lockExpanded) return;
    
    setIsExpanded(prev => {
      const next = !prev;
      const targetHeight = next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
      
      runOnUI(() => {
        'worklet';
        tabBarHeight.value = withTiming(targetHeight, ANIMATION_CONFIG);
      })();
      
      return next;
    });
  }, [tabBarHeight, config.lockExpanded]);
  
  // Update height when route changes
  React.useEffect(() => {
    const targetHeight = config.lockExpanded ? EXPANDED_HEIGHT : 
                        (isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
    
    runOnUI(() => {
      'worklet';
      tabBarHeight.value = withTiming(targetHeight, ANIMATION_CONFIG);
    })();
    
    // Update expansion state for locked routes
    if (config.lockExpanded && !isExpanded) {
      setIsExpanded(true);
    } else if (!config.lockExpanded && config.lockExpanded !== undefined && isExpanded && currentRoute !== 'index') {
      setIsExpanded(false);
    }
  }, [config.lockExpanded, currentRoute, isExpanded, tabBarHeight]);
  
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
  
  const tabBarWrapperStyle = useMemo(() => ({
    marginHorizontal: 24,
    marginBottom: insets.bottom,
  }), [insets.bottom]);

  return (
    <View style={baseStyles.container}>
      <View style={tabBarWrapperStyle}>
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
                const iconName = config.icons[index] || 'circle';
                
                return (
                  <TabIcon
                    key={route.key}
                    routeName={route.name}
                    isFocused={isFocused}
                    onPress={tabHandlers[index]}
                    onLayout={handleTabLayout(index)}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    iconName={iconName}
                  />
                );
              })}
            </View>
          </View>

          {/* Active tab indicator - Removed as color system handles active state */}
          
          {/* Expansion arrow button - only show if config allows */}
          {config.showArrow && (
            <Pressable
              style={[baseStyles.arrowButton, { 
                position: 'absolute',
                bottom: (COLLAPSED_HEIGHT - 32) / 2,
                right: 32,
              }]}
              onPress={toggleExpansion}
            >
              <FontAwesome6 
                name={isExpanded ? "chevron-down" : "chevron-up"} 
                size={20} 
                color={inactiveColor}
              />
            </Pressable>
          )}
        </Animated.View>
      </View>
    </View>
  );
}, (prev, next) => 
  prev.state.index === next.state.index &&
  prev.state.routes.length === next.state.routes.length
);

CustomTabBar.displayName = 'CustomTabBar';