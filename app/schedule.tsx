import React, { memo } from 'react';
import { View } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';
import tw from '../utils/tw';

const ScheduleScreen = () => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);

  return (
    <View style={tw.style('flex-1', { backgroundColor: theme.background })}>
      {/* Transparent Safe Area */}
      <View style={tw`absolute top-0 left-0 right-0 h-15 z-50`} />
      
      {/* Content Below Safe Area */}
      <MotiView
        from={{ opacity: 0, translateY: -50, scale: 0.9 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 300,
        }}
        style={tw`px-6 pt-20`}
      >
        <View style={tw`relative z-10`}>
          <MotiText
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 200 }}
            style={tw.style('text-4xl font-bold mb-4', { color: theme.textPrimary })}
          >
            Schedule
          </MotiText>
          
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300 }}
            style={tw.style('text-xl font-semibold', { color: theme.textSecondary })}
          >
            Your schedule will be displayed here
          </MotiText>
        </View>
      </MotiView>
    </View>
  );
};

export default memo(ScheduleScreen);