import React, { memo, useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useFocusEffect } from '@react-navigation/native';
import { getTheme } from '../../constants/Colors';
import { useIsDarkMode } from '../../store/useAppStore';
import tw from '../../utils/tw';
import { SwippableTabBarExtreme } from '../../components/SwippableTabBarExtreme';
import { Calendar } from '../../components/Calendar';

const ScheduleScreen = () => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const [activeTab, setActiveTab] = useState('today');
  const [animationKey, setAnimationKey] = useState(0);
  const [rangeEnabled, setRangeEnabled] = useState(false);

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'calendar', label: 'Calendar' },
  ];

  // Reset animation when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, []),
  );

  return (
    <View style={tw.style('flex-1', { backgroundColor: theme.background })}>
      {/* Transparent Safe Area */}
      <View style={tw`absolute top-0 left-0 right-0 h-15 z-50`} />

      {/* Content Below Safe Area */}
      <MotiView
        key={`content-${String(animationKey)}`}
        from={{ opacity: 0, translateY: -50, scale: 0.9 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 400,
        }}
        style={tw`px-6 pt-20`}
      >
        <View style={tw`relative z-10`}>
          <MotiText
            key={`title-${String(animationKey)}`}
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 }}
            style={tw.style('text-4xl font-bold mb-4', { color: theme.textPrimary })}
          >
            <Text>Schedule</Text>
          </MotiText>
        </View>
      </MotiView>

      {/* Content based on active tab */}
      <ScrollView
        style={tw`flex-1 px-6`}
        contentContainerStyle={tw`pb-64`}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'today' ? (
          <MotiView
            key={`today-content-${String(animationKey)}`}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 200 }}
          >
            <Text style={tw.style('text-lg mt-6', { color: theme.textSecondary })}>
              Today&apos;s Schedule
            </Text>
            {/* Today's schedule content would go here */}
          </MotiView>
        ) : (
          <Calendar animationKey={animationKey} />
        )}
      </ScrollView>

      {/* Range switch above swippable tab bar - only visible in calendar tab */}
      {activeTab === 'calendar' && (
        <MotiView
          key={`range-${String(animationKey)}`}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 200,
            delay: 100,
          }}
          style={tw`absolute bottom-48 left-0 right-0 items-center`}
        >
          <View style={tw`items-center`}>
            <Text style={tw.style('text-sm mb-2', { color: theme.textSecondary })}>Range</Text>
            <Switch
              value={rangeEnabled}
              onValueChange={setRangeEnabled}
              trackColor={{
                false: isDark ? theme.surface : theme.surfaceSecondary,
                true: isDark ? theme.surfaceSecondary : theme.textPrimary,
              }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDark ? theme.surface : theme.surfaceSecondary}
            />
          </View>
        </MotiView>
      )}

      {/* Swippable Tab Bar at bottom, above navigation */}
      <MotiView
        key={`tabbar-${String(animationKey)}`}
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 250,
          delay: 150,
        }}
        style={tw`absolute bottom-30 left-0 right-0 px-16`}
      >
        <SwippableTabBarExtreme tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </MotiView>
    </View>
  );
};

export default memo(ScheduleScreen);
