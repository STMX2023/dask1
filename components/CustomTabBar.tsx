import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { 
  HomeIcon,
  CameraIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CogIcon
} from 'react-native-heroicons/outline';
import { 
  StopCircleIcon as StopCircleIconSolid,
  BoltIcon as BoltIconSolid,
  MapPinIcon as MapPinIconSolid,
  MicrophoneIcon as MicrophoneIconSolid,
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  CogIcon as CogIconSolid
} from 'react-native-heroicons/solid';
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
  default: 34, // Increased from 32 to 36 for all navigation icons
} as const;

// Memoized icon wrapper to prevent re-renders
const MemoizedIcon = memo<{
  Icon: React.FC<{ width: number; height: number; color: string }>;
  width: number;
  height: number;
  color: string;
}>(({ Icon, width, height, color }) => (
  <Icon width={width} height={height} color={color} />
));

const ANIMATION_CONFIG = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};

// Row-based system constants
const ROW_HEIGHT = 48;
const CONTAINER_PADDING = { top: 12, bottom: 12, horizontal: 24 };
const ROW_GAP = 20; // Gap between rows

// Row types for different content
type RowType = 'navigation' | 'timer' | 'controls' | 'custom' | 'top-controls' | 'middle-controls';

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
  const gaps = visibleRows.length > 1 ? (visibleRows.length - 1) * ROW_GAP : 0;
  return contentHeight + gaps + CONTAINER_PADDING.top + CONTAINER_PADDING.bottom;
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
  const iconSize = isFocused ? ICON_SIZES.default + 4 : ICON_SIZES.default;
  
  // Map FontAwesome icon names to Heroicon components
  const getIcon = () => {
    switch (iconName) {
      case 'house':
        return isFocused 
          ? <HomeIconSolid width={iconSize} height={iconSize} color={color} />
          : <HomeIcon width={iconSize} height={iconSize} color={color} />;
      case 'calendar':
        return isFocused
          ? <CalendarIconSolid width={iconSize} height={iconSize} color={color} />
          : <CalendarIcon width={iconSize} height={iconSize} color={color} />;
      case 'gear':
        return isFocused
          ? <CogIconSolid width={iconSize} height={iconSize} color={color} />
          : <CogIcon width={iconSize} height={iconSize} color={color} />;
      default:
        return isFocused
          ? <HomeIconSolid width={iconSize} height={iconSize} color={color} />
          : <HomeIcon width={iconSize} height={iconSize} color={color} />;
    }
  };
  
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
      <MotiView
        animate={{
          scale: isFocused ? 1.1 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 300,
        }}
      >
        {getIcon()}
      </MotiView>
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
  isDark: boolean;
}>(({ isRunning, onPress, theme, isDark }) => {
  const backgroundColor = isRunning ? theme.error : theme.success;
  const textColor = isDark 
    ? (isRunning ? theme.textPrimary : theme.background)  // Dark mode: white for stop, black for start
    : theme.textInverse;  // Light mode: white for both
  
  return (
    <Pressable
      onPressIn={onPress}
      style={{
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderRadius: 24, // Pill shape
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        // Shadow for elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.6 : 0.25,
        shadowRadius: 10,
        elevation: 6,
      }}
      android_disableSound={true}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: textColor,
        }}>
          {isRunning ? 'Stop' : 'Start'}
        </Text>
        {isRunning ? (
          <StopCircleIconSolid 
            width={12} 
            height={12} 
            color={textColor}
          />
        ) : (
          <BoltIconSolid 
            width={16} 
            height={16} 
            color={textColor}
          />
        )}
      </View>
    </Pressable>
  );
}, (prev, next) => 
  prev.isRunning === next.isRunning &&
  prev.isDark === next.isDark
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
  
  // Get theme
  const theme = getTheme(isDark);
  
  // Theme-aware styles and colors
  const { styles, activeColor, inactiveColor } = useMemo(() => {
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
  }, [isDark, theme.textPrimary, theme.tabIconDefault]);
  
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
  
  // Button toggle states
  const [isLocationActive, setIsLocationActive] = React.useState(false);
  const [isAssistantActive, setIsAssistantActive] = React.useState(false);
  
  
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
        const position = tabPositions.value[activeIndex];
        if (position !== undefined) {
          translateX.value = withTiming(position, ANIMATION_CONFIG);
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
      // Light haptic feedback for navigation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
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
    // Medium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (currentTimer.isRunning) {
      stopTimer();
      // Turn off Location and Assistant when stopping
      setIsLocationActive(false);
      setIsAssistantActive(false);
    } else {
      startTimer();
    }
  }, [currentTimer.isRunning, startTimer, stopTimer]);
  
  // Clock functionality removed since currentTime is no longer used
  
  // Schedule navigation handler
  const handleSchedulePress = useCallback(() => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('schedule');
  }, [navigation]);
  
  // Settings navigation handler
  const handleSettingsPress = useCallback(() => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('settings');
  }, [navigation]);
  
  // Camera navigation handler
  const handleCameraPress = useCallback(() => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('camera-modal');
  }, [navigation]);
  
  // Location button handler
  const handleLocationPress = useCallback(() => {
    // Medium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLocationActive(prev => !prev);
  }, []);
  
  // Assistant button handler  
  const handleAssistantPress = useCallback(() => {
    // Medium haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAssistantActive(prev => !prev);
  }, []);
  
  
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
                onPress={tabHandlers[index] || (() => {})}
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
        <Pressable
          key={state.routes[0]?.key}
          onPressIn={tabHandlers[0] || (() => {})}
          onLayout={handleTabLayout(0)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}
          android_disableSound={true}
        >
          <MotiView
            animate={{
              scale: state.index === 0 ? 1.1 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
            }}
          >
            {state.index === 0 ? (
              <HomeIconSolid
                width={ICON_SIZES.default + 4}
                height={ICON_SIZES.default + 4}
                color={activeColor}
              />
            ) : (
              <HomeIcon
                width={ICON_SIZES.default}
                height={ICON_SIZES.default}
                color={inactiveColor}
              />
            )}
          </MotiView>
        </Pressable>
        
        <Pressable
          onPressIn={handleCameraPress}
          style={iconContainers.squareIcon(40)}
          android_disableSound={true}
        >
          <CameraIcon 
            width={ICON_SIZES.default} 
            height={ICON_SIZES.default} 
            color={inactiveColor}
          />
        </Pressable>
        
        <Pressable
          onPressIn={handleSchedulePress}
          style={iconContainers.squareIcon(40)}
          android_disableSound={true}
        >
          <MotiView
            animate={{
              scale: state.index === 1 ? 1.1 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
            }}
          >
            {state.index === 1 ? (
              <CalendarIconSolid
                width={ICON_SIZES.default + 4}
                height={ICON_SIZES.default + 4}
                color={activeColor}
              />
            ) : (
              <CalendarIcon 
                width={ICON_SIZES.default} 
                height={ICON_SIZES.default} 
                color={inactiveColor}
              />
            )}
          </MotiView>
        </Pressable>
        
        <Pressable
          key={state.routes[2]?.key}
          onPressIn={handleSettingsPress}
          onLayout={handleTabLayout(1)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}
          android_disableSound={true}
        >
          <MotiView
            animate={{
              scale: state.index === 2 ? 1.1 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
            }}
          >
            {state.index === 2 ? (
              <CogIconSolid
                width={ICON_SIZES.default + 4}
                height={ICON_SIZES.default + 4}
                color={activeColor}
              />
            ) : (
              <CogIcon
                width={ICON_SIZES.default}
                height={ICON_SIZES.default}
                color={inactiveColor}
              />
            )}
          </MotiView>
        </Pressable>
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
            isDark={isDark}
          />
        )}
        
        <Timer isCompact={true} />
      </View>
    );
  }, [config.showStartStopButton, currentTimer.isRunning, handleStartStop, isDark]);
  
  // Render middle controls row (home page - empty for now)
  const renderMiddleControlsRow = useCallback(() => {
    return (
      <View style={[baseStyles.tabsContainer, {
        height: ROW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
      }]}>
        {/* Empty middle row for now */}
      </View>
    );
  }, []);
  
  // Render a single row based on its type
  const renderRow = useCallback((row: RowConfig) => {
    switch (row.type) {
      case 'navigation':
        return renderNavigationRow();
      case 'timer':
        return renderTimerRow();
      case 'top-controls':
        return renderTopControlsRow();
      case 'middle-controls':
        return renderMiddleControlsRow();
      default:
        return null;
    }
  }, [renderNavigationRow, renderTimerRow, renderTopControlsRow, renderMiddleControlsRow]);

  // Base button style - only theme-dependent properties
  const buttonBaseStyle = useMemo(() => ({
    height: ROW_HEIGHT - 4,
    backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB',
    borderRadius: (ROW_HEIGHT - 4) / 2,
    // Static shadow - not animated
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.15 : 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden' as const,
  }), [isDark]);

  // Pressable style - static, no dependencies
  const pressableStyle = useMemo(() => ({
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), []);

  // Text style - only theme-dependent
  const buttonTextStyle = useMemo(() => ({
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: '600' as const,
    marginLeft: 8,
  }), [theme.textPrimary]);

  return (
    <View style={baseStyles.container}>
      {/* New container above nav bar - only show on home page */}
      {currentRoute === 'index' && (
        <View style={{ marginHorizontal: CONTAINER_PADDING.horizontal + 30 }}>
          <View style={{
            backgroundColor: 'transparent',
            borderRadius: 45,
            padding: 4,
          }}>
            <View style={{
              flexDirection: 'row',
              height: ROW_HEIGHT,
              alignItems: 'center',
              gap: 16,
            }}>
              {/* Location tracking pill button */}
              <MotiView
                animate={{
                  width: isLocationActive ? '24%' : '47%',
                  borderWidth: isLocationActive ? 1 : (isDark ? 1 : 1),
                  borderColor: isLocationActive ? theme.blue : theme.borderSubtle,
                }}
                transition={{
                  type: 'timing',
                  duration: 250,
                  easing: Easing.inOut(Easing.cubic),
                }}
                style={buttonBaseStyle}
              >
                <Pressable
                  onPress={handleLocationPress}
                  style={pressableStyle}
                  android_disableSound={true}
                  accessibilityRole="button"
                  accessibilityLabel={isLocationActive ? "Location tracking active" : "Enable location tracking"}
                  accessibilityState={{ selected: isLocationActive }}
                >
                  <MotiView
                    animate={{
                      scale: isLocationActive ? 1.1 : 1,
                      translateX: isLocationActive ? 0 : -4,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      stiffness: 300,
                      delay: isLocationActive ? 150 : 150,
                    }}
                  >
                    <MemoizedIcon
                      Icon={MapPinIconSolid}
                      width={24} 
                      height={24} 
                      color={isLocationActive ? theme.blue : theme.textPrimary}
                    />
                  </MotiView>
                  <MotiView
                    animate={{
                      opacity: isLocationActive ? 0 : 1,
                      scale: isLocationActive ? 0.8 : 1,
                    }}
                    transition={{
                      type: 'timing',
                      duration: isLocationActive ? 50 : 250,
                    }}
                    style={{
                      overflow: 'hidden',
                      position: isLocationActive ? 'absolute' : 'relative',
                    }}
                  >
                    <Text style={buttonTextStyle}>
                      Location
                    </Text>
                  </MotiView>
                </Pressable>
              </MotiView>
              
              {/* Assistant pill button */}
              <MotiView
                animate={{
                  width: isAssistantActive ? '24%' : '47%',
                  borderWidth: isAssistantActive ? 1 : (isDark ? 1 : 1),
                  borderColor: isAssistantActive ? theme.blue : theme.borderSubtle,
                }}
                transition={{
                  type: 'timing',
                  duration: 250,
                  easing: Easing.inOut(Easing.cubic),
                }}
                style={buttonBaseStyle}
              >
                <Pressable
                  onPress={handleAssistantPress}
                  style={pressableStyle}
                  android_disableSound={true}
                  accessibilityRole="button"
                  accessibilityLabel={isAssistantActive ? "Assistant active" : "Enable assistant"}
                  accessibilityState={{ selected: isAssistantActive }}
                >
                  <MotiView
                    animate={{
                      scale: isAssistantActive ? 1.1 : 1,
                      translateX: isAssistantActive ? 0 : -4,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      stiffness: 300,
                      delay: isAssistantActive ? 150 : 150,
                    }}
                  >
                    <MemoizedIcon
                      Icon={MicrophoneIconSolid}
                      width={24} 
                      height={24} 
                      color={isAssistantActive ? theme.blue : theme.textPrimary}
                    />
                  </MotiView>
                  <MotiView
                    animate={{
                      opacity: isAssistantActive ? 0 : 1,
                      scale: isAssistantActive ? 0.8 : 1,
                    }}
                    transition={{
                      type: 'timing',
                      duration: isAssistantActive ? 50 : 250,
                    }}
                    style={{
                      overflow: 'hidden',
                      position: isAssistantActive ? 'absolute' : 'relative',
                    }}
                  >
                    <Text style={buttonTextStyle}>
                      Assistant
                    </Text>
                  </MotiView>
                </Pressable>
              </MotiView>
            </View>
          </View>
        </View>
      )}
      
      {/* Original nav bar */}
      <View style={{ marginHorizontal: CONTAINER_PADDING.horizontal, marginBottom: insets.bottom, marginTop: 8 }}>
        <Animated.View style={[styles.tabBar, animatedTabBarStyle, {
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        }]}>
          <View style={{ paddingTop: CONTAINER_PADDING.top, paddingBottom: CONTAINER_PADDING.bottom }}>
            {/* Render visible rows */}
            {visibleRows.map((row, index) => (
              <View key={row.id} style={{ marginTop: index > 0 ? ROW_GAP : 0 }}>
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
              {isExpanded ? (
                <ChevronDownIcon 
                  width={20} 
                  height={20} 
                  color={inactiveColor}
                />
              ) : (
                <ChevronUpIcon 
                  width={20} 
                  height={20} 
                  color={inactiveColor}
                />
              )}
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