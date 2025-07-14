import React, { useState, useMemo, memo } from 'react';
import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SwippableTabBarExtreme } from '../../components/SwippableTabBarExtreme';
import { getTheme, baseColors } from '../../constants/Colors';
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
      borderRadius: 16,
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
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color="white" />
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
    backgroundColor: isDark ? baseColors.black : theme.surfaceSecondary,
    borderRadius: 20,
    padding: 4,
    marginBottom,
  }), [theme, marginBottom, isDark]);

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
  const insets = useSafeAreaInsets();
  const [animationKey, setAnimationKey] = useState(0);
  const systemColorScheme = useColorScheme();
  
  // Theme selector state - default to 'system'
  const [selectedTheme, setSelectedTheme] = useState<string>('system');

  // Reset animation when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  // Handle system theme changes when "system" is selected
  React.useEffect(() => {
    if (selectedTheme === 'system' && systemColorScheme) {
      const systemPrefersDark = systemColorScheme === 'dark';
      if (systemPrefersDark !== isDark) {
        toggleDarkMode();
      }
    }
  }, [systemColorScheme, selectedTheme, isDark, toggleDarkMode]);
  
  const themeOptions = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    
    // Apply theme changes immediately for better UX
    if (themeId === 'light' && isDark) {
      toggleDarkMode();
    } else if (themeId === 'dark' && !isDark) {
      toggleDarkMode();
    } else if (themeId === 'system') {
      // Use actual system preference
      const systemPrefersDark = systemColorScheme === 'dark';
      if (systemPrefersDark !== isDark) {
        toggleDarkMode();
      }
    }
  };

  const styles = useMemo(() => ({
    container: tw.style('flex-1', { backgroundColor: theme.background }),
    header: tw`pt-16 pb-3 items-center`,
    title: tw.style('text-[22px] font-semibold', { color: theme.textPrimary, letterSpacing: -0.5 }),
    scrollContainer: tw.style('flex-1 mx-4 mt-2 rounded-3xl overflow-hidden', { 
      backgroundColor: theme.background,
      marginBottom: 72 + insets.bottom + 16
    }),
    scrollContent: tw`py-4`,
    themeSection: tw`mb-8 px-4`,
    sectionTitle: tw.style('text-[15px] font-semibold mb-3 ml-1', { color: theme.textSecondary }),
  }), [theme, insets.bottom]);

  return (
    <View style={styles.container}>
      {/* Transparent Safe Area */}
      <View style={tw`absolute top-0 left-0 right-0 h-15 z-50`} />
      
      {/* Header Below Safe Area */}
      <View style={styles.header}>
        <MotiText
          key={`title-${animationKey}`}
          from={{ opacity: 0, translateX: -50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 50 }}
          style={styles.title}
        >
          Settings
        </MotiText>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
        {/* Theme Selector */}
        <View style={styles.themeSection}>
          <MotiText
            key={`appearance-${animationKey}`}
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 }}
            style={styles.sectionTitle}
          >
            APPEARANCE
          </MotiText>
          <MotiView
            key={`theme-${animationKey}`}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ 
              delay: 120,
              type: 'timing',
              duration: 200
            }}
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
          key={`settings-${animationKey}`}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            delay: 150,
            type: 'timing',
            duration: 250
          }}
          style={tw`px-0`}
        >
          <SettingsGroup>
            <SettingsItem
              icon="image"
              iconColor="#007AFF"
              title="Wallpaper"
              onPress={() => console.warn('Wallpaper pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="notifications"
              iconColor="#FF3B30"
              title="Notifications"
              onPress={() => console.warn('Notifications pressed')}
            />
            <SettingsItem
              icon="volume-high"
              iconColor="#FF2D92"
              title="Sounds & Haptics"
              onPress={() => console.warn('Sounds pressed')}
            />
            <SettingsItem
              icon="moon"
              iconColor="#5856D6"
              title="Focus"
              onPress={() => console.warn('Focus pressed')}
            />
            <SettingsItem
              icon="hourglass"
              iconColor="#5856D6"
              title="Screen Time"
              onPress={() => console.warn('Screen Time pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="finger-print"
              iconColor="#34C759"
              title="Face ID & Passcode"
              onPress={() => console.warn('Face ID pressed')}
            />
            <SettingsItem
              icon="medical"
              iconColor="#FF3B30"
              title="Emergency SOS"
              onPress={() => console.warn('Emergency SOS pressed')}
            />
            <SettingsItem
              icon="hand-left"
              iconColor="#007AFF"
              title="Privacy & Security"
              onPress={() => console.warn('Privacy pressed')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsItem
              icon="game-controller"
              iconColor="#32D74B"
              title="Game Center"
              onPress={() => console.warn('Game Center pressed')}
            />
            <SettingsItem
              icon="cloud"
              iconColor="#007AFF"
              title="iCloud"
              onPress={() => console.warn('iCloud pressed')}
            />
            <SettingsItem
              icon="card"
              iconColor="#FF9500"
              title="Wallet & Apple Pay"
              onPress={() => console.warn('Wallet pressed')}
            />
          </SettingsGroup>

          <SettingsGroup marginBottom={24}>
            <SettingsItem
              icon="apps"
              iconColor="#5856D6"
              title="Apps"
              onPress={() => console.warn('Apps pressed')}
            />
            <SettingsItem
              icon="code-slash"
              iconColor="#8E8E93"
              title="Developer"
              onPress={() => console.warn('Developer pressed')}
            />
          </SettingsGroup>
        </MotiView>
        </ScrollView>
      </View>
    </View>
  );
}