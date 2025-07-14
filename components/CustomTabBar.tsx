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
import { iconContainers } from '../constants/Layouts';
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

// Row-based system constants
const ROW_HEIGHT = 48;
const CONTAINER_PADDING = { top: 12, bottom: 12, horizontal: 24 };

// Row types for different content
type RowType = 'navigation' | 'timer' | 'controls' | 'custom' | 'top-controls';

interface RowConfig {
  id: string;
  type: RowType;
  height: number;
  collapsible: boolean;
  alwaysVisible?: boolean;
}

// Nav bar configuration per route
const NAV_CONFIG = {
  'index': { 
    lockExpanded: true,
    showArrow: false,
    showStartStopButton: true,
    layout: 'home',
    icons: ['house', 'gear'], // Custom icons for home page
    rows: [
      { id: 'top-row', type: 'top-controls', height: ROW_HEIGHT, collapsible: false },
      { id: 'navigation', type: 'navigation', height: ROW_HEIGHT, collapsible: false, alwaysVisible: true }
    ] as RowConfig[]
  },
  'schedule': { 
    lockExpanded: false, 
    showArrow: false, // No arrow on schedule page
    showStartStopButton: false,
    layout: 'standard',
    icons: ['house', 'calendar', 'gear'], // Standard icons for schedule
    rows: [
      { id: 'navigation', type: 'navigation', height: ROW_HEIGHT, collapsible: false, alwaysVisible: true }
    ] as RowConfig[]
  },
  'settings': { 
    lockExpanded: false, 
    showArrow: false, // No arrow on settings page
    showStartStopButton: false,
    layout: 'standard',
    icons: ['house', 'calendar', 'gear'], // Standard icons for settings: home, schedule, settings
    rows: [
      { id: 'navigation', type: 'navigation', height: ROW_HEIGHT, collapsible: false, alwaysVisible: true }
    ] as RowConfig[]
  },
} as const;

const DEFAULT_CONFIG = {
  lockExpanded: false,
  showArrow: true,
  showStartStopButton: false,
  layout: 'standard',
  icons: ['house', 'gear'],
  rows: [
    { id: 'navigation', type: 'navigation', height: ROW_HEIGHT, collapsible: false, alwaysVisible: true }
  ] as RowConfig[]
} as const;

// Calculate tab bar height based on visible rows
const calculateTabBarHeight = (rows: RowConfig[], isExpanded: boolean) => {
  const visibleRows = isExpanded 
    ? rows 
    : rows.filter(row => row.alwaysVisible || !row.collapsible);
  
  const contentHeight = visibleRows.reduce((sum, row) => sum + row.height, 0);
  return contentHeight + CONTAINER_PADDING.top + CONTAINER_PADDING.bottom;
};

// Base styles (theme-independent)
const baseStyles = {
  container: tw`absolute bottom-0 left-0 right-0`,
  tabsContainer: tw`flex-row px-7`,
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
          backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7'
        }),
        indicator: tw.style('rounded-full h-0.5 absolute', { 
          backgroundColor: activeIconColor
        }),
      },
      activeColor: activeIconColor,
      inactiveColor: inactiveIconColor,
    };
  }, [isDark]);
  
  // Calculate initial height based on config
  const getInitialHeight = () => {
    const initialExpanded = config.lockExpanded || false;
    return calculateTabBarHeight(config.rows || [], initialExpanded);
  };
  
  // Shared animated values - initialize with stable references
  const translateX = useSharedValue(0);
  const tabPositions = useSharedValue<number[]>([0, 0]); // Pre-allocate for 2 tabs
  const tabBarHeight = useSharedValue(getInitialHeight());
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
      const targetHeight = calculateTabBarHeight(config.rows || [], next);
      
      runOnUI(() => {
        'worklet';
        tabBarHeight.value = withTiming(targetHeight, ANIMATION_CONFIG);
      })();
      
      return next;
    });
  }, [tabBarHeight, config.lockExpanded, config.rows]);
  
  // Update height when route changes
  React.useEffect(() => {
    const shouldExpand = config.lockExpanded || (isExpanded && currentRoute === 'index');
    const targetHeight = calculateTabBarHeight(config.rows || [], shouldExpand);
    
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
  }, [config.lockExpanded, currentRoute, isExpanded, tabBarHeight, config.rows]);
  
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
  
  // Camera navigation handler
  const handleCameraPress = useCallback(() => {
    navigation.navigate('camera-modal');
  }, [navigation]);
  
  const tabBarWrapperStyle = useMemo(() => ({
    marginHorizontal: CONTAINER_PADDING.horizontal,
    marginBottom: insets.bottom,
  }), [insets.bottom]);
  
  // Determine which rows to show
  const visibleRows = useMemo(() => {
    if (!config.rows) return [];
    return isExpanded 
      ? config.rows 
      : config.rows.filter(row => row.alwaysVisible || !row.collapsible);
  }, [config.rows, isExpanded]);
  
  // Render navigation row content
  const renderNavigationRow = useCallback(() => {
    if (config.layout !== 'home') {
      // Standard layout: equally distributed icons
      return (
        <View style={[baseStyles.tabsContainer, { 
          height: ROW_HEIGHT,
          alignItems: 'center',
          justifyContent: 'space-evenly',
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
      );
    }
    
    // Home layout with all icons in bottom row
    return (
      <View style={[baseStyles.tabsContainer, {
        height: ROW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-between',
      }]}>
        <TabIcon
          key={state.routes[0]?.key}
          routeName={state.routes[0]?.name || 'index'}
          isFocused={state.index === 0}
          onPress={tabHandlers[0]}
          onLayout={handleTabLayout(0)}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          iconName="house"
          isHomeLayout={true}
        />
        
        <Pressable
          onPressIn={handleCameraPress}
          style={iconContainers.squareIcon(40)}
          android_disableSound={true}
        >
          <FontAwesome6 
            name="camera" 
            size={ICON_SIZES.default} 
            color={inactiveColor}
          />
        </Pressable>
        
        <Pressable
          onPressIn={handleSchedulePress}
          style={iconContainers.squareIcon(40)}
          android_disableSound={true}
        >
          <FontAwesome6 
            name="calendar" 
            size={ICON_SIZES.default} 
            color={inactiveColor}
          />
        </Pressable>
        
        <View style={iconContainers.squareIcon(40)}>
          <FontAwesome6 
            name="microphone" 
            size={ICON_SIZES.default} 
            color={inactiveColor}
          />
        </View>
        
        <TabIcon
          key={state.routes[2]?.key}
          routeName={state.routes[2]?.name || 'settings'}
          isFocused={state.index === 2}
          onPress={handleSettingsPress}
          onLayout={handleTabLayout(1)}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          iconName="gear"
          isHomeLayout={true}
        />
      </View>
    );
  }, [config.layout, config.icons, state, tabHandlers, handleTabLayout, activeColor, inactiveColor, handleSettingsPress, handleCameraPress, handleSchedulePress]);
  
  // Render timer row
  const renderTimerRow = useCallback(() => {
    return (
      <View style={{ height: ROW_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
        <Timer isCompact={true} />
      </View>
    );
  }, []);
  
  // Render top controls row (home page - start button left, timer right)
  const renderTopControlsRow = useCallback(() => {
    return (
      <View style={[baseStyles.tabsContainer, {
        height: ROW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-between',
      }]}>
        {config.showStartStopButton && (
          <StartStopButton
            isRunning={currentTimer.isRunning}
            onPress={handleStartStop}
            theme={getTheme(isDark)}
          />
        )}
        
        <Timer isCompact={true} />
      </View>
    );
  }, [config.showStartStopButton, currentTimer.isRunning, handleStartStop, isDark]);
  
  // Render a single row based on its type
  const renderRow = useCallback((row: RowConfig) => {
    switch (row.type) {
      case 'navigation':
        return renderNavigationRow();
      case 'timer':
        return renderTimerRow();
      case 'top-controls':
        return renderTopControlsRow();
      default:
        return null;
    }
  }, [renderNavigationRow, renderTimerRow, renderTopControlsRow]);

  return (
    <View style={baseStyles.container}>
      <View style={tabBarWrapperStyle}>
        <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
          <View style={{ paddingTop: CONTAINER_PADDING.top, paddingBottom: CONTAINER_PADDING.bottom }}>
            {/* Render visible rows */}
            {visibleRows.map((row) => (
              <View key={row.id}>
                {renderRow(row)}
              </View>
            ))}
          </View>
          
          {/* Expansion arrow button - only show if config allows */}
          {config.showArrow && (
            <Pressable
              style={[baseStyles.arrowButton, { 
                position: 'absolute',
                bottom: CONTAINER_PADDING.bottom + 8,
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