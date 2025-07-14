import React, { memo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import tw from '../utils/tw';

interface Tab {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  selectedIcon?: keyof typeof Ionicons.glyphMap;
}

interface BottomTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Pre-computed styles
const containerStyle = tw`flex-row bg-black rounded-full mx-6 mb-6 px-4 py-2`;
const tabItemStyle = tw`flex-1 items-center justify-center py-2`;
const indicatorContainerStyle = tw`absolute bottom-0 left-0 right-0 h-1 items-center`;
const indicatorStyle = tw`bg-white rounded-full h-1`;

// Constants
const ICON_SIZE = 28;
const ACTIVE_COLOR = '#FFFFFF';
const INACTIVE_COLOR = '#666666';
const INDICATOR_WIDTH = 60;
const ANIMATION_CONFIG = {
  duration: 200,
  easing: Easing.out(Easing.quad),
};

// Tab icon component
const TabIcon = memo<{
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}>(({ icon, isActive, onPress }) => (
  <Pressable
    onPressIn={onPress}
    style={tabItemStyle}
    android_disableSound={true}
  >
    <Ionicons 
      name={icon} 
      size={ICON_SIZE} 
      color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
    />
  </Pressable>
));

TabIcon.displayName = 'TabIcon';

export const BottomTabBar = memo<BottomTabBarProps>(({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const translateX = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const tabCount = tabs.length;
  
  // Layout handler
  const handleLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    const width = event.nativeEvent.layout.width;
    containerWidth.value = width;
    
    // Set initial position
    const tabWidth = width / tabCount;
    const position = activeIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    translateX.value = position;
  }, [activeIndex, tabCount, containerWidth, translateX]);
  
  // Tab press handlers
  const handleTabPress = useCallback((index: number, tabId: string) => {
    onTabChange(tabId);
    
    // Animate indicator
    const tabWidth = containerWidth.value / tabCount;
    const position = index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    translateX.value = withTiming(position, ANIMATION_CONFIG);
  }, [onTabChange, containerWidth, tabCount, translateX]);
  
  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: INDICATOR_WIDTH,
  }));
  
  // Update position on external tab change
  React.useEffect(() => {
    if (containerWidth.value > 0) {
      const tabWidth = containerWidth.value / tabCount;
      const position = activeIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
      translateX.value = withTiming(position, ANIMATION_CONFIG);
    }
  }, [activeIndex, tabCount, containerWidth, translateX]);
  
  return (
    <View style={containerStyle} onLayout={handleLayout}>
      {/* Tab icons */}
      {tabs.map((tab, index) => (
        <TabIcon
          key={tab.id}
          icon={tab.selectedIcon && tab.id === activeTab ? tab.selectedIcon : tab.icon}
          isActive={tab.id === activeTab}
          onPress={() => handleTabPress(index, tab.id)}
        />
      ))}
      
      {/* Bottom indicator */}
      <View style={indicatorContainerStyle}>
        <Animated.View style={[indicatorStyle, animatedIndicatorStyle]} />
      </View>
    </View>
  );
}, (prev, next) => 
  prev.activeTab === next.activeTab && 
  prev.tabs === next.tabs
);

BottomTabBar.displayName = 'BottomTabBar';