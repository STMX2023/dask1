import React, { useState, useMemo, memo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { SwippableTabBarExtreme } from '../../components/SwippableTabBarExtreme';
import { getTheme } from '../../constants/Colors';
import { useIsDarkMode, useAppStore } from '../../store/useAppStore';
import tw from '../../utils/tw';

// Settings menu item component
const SettingsItem = memo<{
  icon: string;
  iconColor: string;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
}>(({ icon, iconColor, title, onPress, showChevron = true }) => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  
  const styles = useMemo(() => ({
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 2,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: iconColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: 12,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '400' as const,
      color: theme.textPrimary,
    },
    chevron: {
      color: theme.textTertiary,
    }
  }), [theme, iconColor]);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.6 : 1 }
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={18} color="white" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} style={styles.chevron} />
      )}
    </Pressable>
  );
});

// Settings group component
const SettingsGroup = memo<{
  children: React.ReactNode;
  marginBottom?: number;
}>(({ children, marginBottom = 24 }) => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  
  const groupStyle = useMemo(() => ({
    backgroundColor: theme.surfaceSecondary,
    borderRadius: 16,
    padding: 4,
    marginBottom,
  }), [theme, marginBottom]);

  return (
    <View style={groupStyle}>
      {children}
    </View>
  );
});

export default function TabTwoScreen() {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const { toggleDarkMode } = useAppStore();
  
  // Theme selector state - sync with actual theme
  const [selectedTheme, setSelectedTheme] = useState<string>(isDark ? 'dark' : 'light');
  
  // Sync selectedTheme with actual theme state
  React.useEffect(() => {
    setSelectedTheme(isDark ? 'dark' : 'light');
  }, [isDark]);
  
  const themeOptions = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    
    // Apply theme changes
    if (themeId === 'light' && isDark) {
      toggleDarkMode();
    } else if (themeId === 'dark' && !isDark) {
      toggleDarkMode();
    } else if (themeId === 'system') {
      // For now, just use system preference (you can detect actual system theme later)
      const prefersDark = true; // This would come from system detection
      if (prefersDark !== isDark) {
        toggleDarkMode();
      }
    }
  };

  const styles = useMemo(() => ({
    container: tw.style('flex-1', { backgroundColor: theme.background }),
    header: tw`pt-20 pb-5 items-center`,
    title: tw.style('text-[22px] font-semibold', { color: theme.textPrimary, letterSpacing: -0.5 }),
    content: tw`flex-1 px-4`,
    scrollContent: tw`pt-4`,
    themeSection: tw`mb-8`,
    sectionTitle: tw.style('text-[15px] font-semibold mb-3 ml-1', { color: theme.textSecondary }),
  }), [theme]);

  return (
    <View style={styles.container}>
      {/* Transparent Safe Area */}
      <View style={tw`absolute top-0 left-0 right-0 h-15 z-50`} />
      
      {/* Header Below Safe Area */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Theme Selector */}
        <View style={styles.themeSection}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
          >
            <SwippableTabBarExtreme
              tabs={themeOptions}
              activeTab={selectedTheme}
              onTabChange={handleThemeChange}
            />
          </MotiView>
        </View>

        {/* Settings Groups */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <SettingsGroup>
            <SettingsItem
              icon="image"
              iconColor="#007AFF"
              title="Wallpaper"
              onPress={() => console.log('Wallpaper pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="notifications"
              iconColor="#FF3B30"
              title="Notifications"
              onPress={() => console.log('Notifications pressed')}
            />
            <SettingsItem
              icon="volume-high"
              iconColor="#FF2D92"
              title="Sounds & Haptics"
              onPress={() => console.log('Sounds pressed')}
            />
            <SettingsItem
              icon="moon"
              iconColor="#5856D6"
              title="Focus"
              onPress={() => console.log('Focus pressed')}
            />
            <SettingsItem
              icon="hourglass"
              iconColor="#5856D6"
              title="Screen Time"
              onPress={() => console.log('Screen Time pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="finger-print"
              iconColor="#34C759"
              title="Face ID & Passcode"
              onPress={() => console.log('Face ID pressed')}
            />
            <SettingsItem
              icon="medical"
              iconColor="#FF3B30"
              title="Emergency SOS"
              onPress={() => console.log('Emergency SOS pressed')}
            />
            <SettingsItem
              icon="hand-left"
              iconColor="#007AFF"
              title="Privacy & Security"
              onPress={() => console.log('Privacy pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="game-controller"
              iconColor="#32D74B"
              title="Game Center"
              onPress={() => console.log('Game Center pressed')}
            />
            <SettingsItem
              icon="cloud"
              iconColor="#007AFF"
              title="iCloud"
              onPress={() => console.log('iCloud pressed')}
            />
            <SettingsItem
              icon="card"
              iconColor="#FF9500"
              title="Wallet & Apple Pay"
              onPress={() => console.log('Wallet pressed')}
            />
          </SettingsGroup>

          <SettingsGroup marginBottom={100}>
            <SettingsItem
              icon="apps"
              iconColor="#5856D6"
              title="Apps"
              onPress={() => console.log('Apps pressed')}
            />
            <SettingsItem
              icon="code-slash"
              iconColor="#8E8E93"
              title="Developer"
              onPress={() => console.log('Developer pressed')}
            />
          </SettingsGroup>
        </MotiView>
      </ScrollView>
    </View>
  );
}