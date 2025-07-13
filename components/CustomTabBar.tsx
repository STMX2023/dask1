import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
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
import { useIsDarkMode, useCurrentTimer, useStartTimer, useStopTimer } from '../store/useAppStore';
import { getTheme } from '../constants/Colors';
import { gridTemplates, iconContainers } from '../constants/Layouts';
import { Timer } from './Timer';

// Constants
const ICON_SIZES = {
  add: 30,
  group: 22, // Increased proportionally 
  default: 28, // Increased from 24 to 28 for all navigation icons
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
    showStartStopButton: true,
    layout: 'home',
    icons: ['house', 'gear'] // Custom icons for home page
  },
  'schedule': { 
    lockExpanded: false, 
    showArrow: false, // No arrow on schedule page
    showStartStopButton: false,
    layout: 'standard',
    icons: ['house', 'calendar', 'gear'] // Standard icons for schedule
  },
  'settings': { 
    lockExpanded: false, 
    showArrow: false, // No arrow on settings page
    showStartStopButton: false,
    layout: 'standard',
    icons: ['house', 'calendar', 'gear'] // Standard icons for settings: home, schedule, settings
  },
} as const;

const DEFAULT_CONFIG = {
  lockExpanded: false,
  showArrow: true,
  showStartStopButton: false,
  layout: 'standard',
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
  isHomeLayout?: boolean;
}>(({ isFocused, onPress, onLayout, activeColor, inactiveColor, iconName, isHomeLayout = false }) => {
  const color = isFocused ? activeColor : inactiveColor;
  
  return (
    <Pressable
      onPressIn={onPress}
      onLayout={onLayout}
      style={isHomeLayout ? {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
      } : baseStyles.tabItem}
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
  prev.iconName === next.iconName &&
  prev.isHomeLayout === next.isHomeLayout
);

TabIcon.displayName = 'TabIcon';

// Start/Stop button component for home page
const StartStopButton = memo<{
  isRunning: boolean;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
}>(({ isRunning, onPress, theme }) => {
  const borderColor = isRunning ? theme.error : theme.success;
  const textColor = isRunning ? theme.error : theme.success;
  
  return (
    <Pressable
      onPressIn={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // Pill shape
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
      }}
      android_disableSound={true}
    >
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: textColor,
      }}>
        {isRunning ? 'Stop' : 'Start'}
      </Text>
    </Pressable>
  );
}, (prev, next) => 
  prev.isRunning === next.isRunning
);

StartStopButton.displayName = 'StartStopButton';

export const CustomTabBar = memo<BottomTabBarProps>(({ 
  state, 
  navigation 
}) => {
  const isDark = useIsDarkMode();
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  const currentRoute = state.routes[activeIndex]?.name;
  
  // Live clock state (removed unused variable)
  
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
  
  // Get timer state from store
  const currentTimer = useCurrentTimer();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  
  
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
  
  // Start/stop button handler
  const handleStartStop = useCallback(() => {
    if (currentTimer.isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [currentTimer.isRunning, startTimer, stopTimer]);
  
  // Clock functionality removed since currentTime is no longer used
  
  // Schedule navigation handler
  const handleSchedulePress = useCallback(() => {
    navigation.navigate('schedule');
  }, [navigation]);
  
  // Settings navigation handler
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('settings');
  }, [navigation]);
  
  const tabBarWrapperStyle = useMemo(() => ({
    marginHorizontal: 24,
    marginBottom: insets.bottom,
  }), [insets.bottom]);

  return (
    <View style={baseStyles.container}>
      <View style={tabBarWrapperStyle}>
        <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
          {/* Grid layout for home page - 2x3 structure */}
          {config.layout === 'home' && (() => {
            const gridLayout = gridTemplates.navigationGrid2x3;
            const squareIconStyle = iconContainers.squareIcon(48);
            
            return (
              <View style={gridLayout.container}>
                {/* Left column */}
                <View style={gridLayout.leftColumn}>
                  {/* Empty space at top */}
                  <View style={gridLayout.spacer} />
                  
                  {/* Stacked icon pairs - Camera above Home, Mic above Schedule */}
                  <View style={{
                    ...gridLayout.bottomRow,
                    paddingBottom: 16, // Add extra bottom padding
                  }}>
                    {/* Camera + Home stack */}
                    <View style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8, // Small gap between camera and home
                    }}>
                      <View style={squareIconStyle}>
                        <FontAwesome6 
                          name="camera" 
                          size={ICON_SIZES.default} 
                          color={inactiveColor}
                        />
                      </View>
                      <TabIcon
                        key={state.routes[0]?.key}
                        routeName={state.routes[0]?.name || 'index'}
                        isFocused={state.index === 0}
                        onPress={tabHandlers[0]}
                        onLayout={handleTabLayout(0)}
                        activeColor={activeColor}
                        inactiveColor={inactiveColor}
                        iconName={config.icons[0] || 'house'}
                        isHomeLayout={true}
                      />
                    </View>
                    
                    {/* Mic + Schedule stack */}
                    <View style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8, // Small gap between mic and schedule
                    }}>
                      <View style={squareIconStyle}>
                        <FontAwesome6 
                          name="microphone" 
                          size={ICON_SIZES.default} 
                          color={inactiveColor}
                        />
                      </View>
                      <Pressable
                        onPressIn={handleSchedulePress}
                        style={squareIconStyle}
                        android_disableSound={true}
                      >
                        <FontAwesome6 
                          name="calendar" 
                          size={ICON_SIZES.default} 
                          color={inactiveColor}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
                
                {/* Right column */}
                <View style={gridLayout.rightColumn}>
                  {/* Top - Timer */}
                  <View style={gridLayout.singleItem}>
                    <Timer isCompact={true} />
                  </View>
                  
                  {/* Middle - Empty space */}
                  <View style={gridLayout.spacer} />
                  
                  {/* Bottom - Settings and Start/Stop */}
                  <View style={{
                    ...gridLayout.bottomRow,
                    paddingBottom: 16, // Add extra bottom padding
                  }}>
                    <TabIcon
                      key={state.routes[1]?.key}
                      routeName={state.routes[1]?.name || 'settings'}
                      isFocused={state.index === 1}
                      onPress={handleSettingsPress}
                      onLayout={handleTabLayout(1)}
                      activeColor={activeColor}
                      inactiveColor={inactiveColor}
                      iconName={config.icons[1] || 'gear'}
                      isHomeLayout={true}
                    />
                    
                    {config.showStartStopButton && (
                      <StartStopButton
                        isRunning={currentTimer.isRunning}
                        onPress={handleStartStop}
                        theme={getTheme(isDark)}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })()}
          
          {/* Tab icons container */}
          <View style={{ 
            position: 'absolute',
            bottom: (COLLAPSED_HEIGHT - 48) / 2,
            left: 0,
            right: 0,
            height: 48,
          }}>
            {config.layout !== 'home' && (
              // Standard layout: equally distributed icons
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
            )}
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