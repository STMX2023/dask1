import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import Colors from '@/constants/Colors';
import { CustomTabBar } from '@/components/CustomTabBar';
import { useIsDarkMode } from '@/store/useAppStore';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  const styles = { marginBottom: -3 };
  return <FontAwesome size={28} style={styles} {...props} />;
}

function TabCodeIcon({ color }: { color: string }) {
  return <TabBarIcon name="code" color={color} />;
}

function TabCalendarIcon({ color }: { color: string }) {
  return <TabBarIcon name="calendar" color={color} />;
}

function TabCogIcon({ color }: { color: string }) {
  return <TabBarIcon name="cog" color={color} />;
}

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export default function TabLayout() {
  const isDarkMode = useIsDarkMode();
  const themeKey = isDarkMode ? 'dark' : 'light';

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        tabBarActiveTintColor: Colors[themeKey].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: TabCodeIcon,
          headerShown: false, // Hide header on home screen since it has its own header
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: TabCalendarIcon,
          headerShown: false, // Hide header on schedule screen since it has its own header
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: TabCogIcon,
          headerShown: false, // Hide header on settings screen since it has its own header
        }}
      />
    </Tabs>
  );
}
