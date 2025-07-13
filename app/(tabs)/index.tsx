import React, { useEffect, useState, memo } from 'react';
import { View } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Clock } from '../../components/Clock';
import { getTheme } from '../../constants/Colors';
import { useIsDarkMode } from '../../store/useAppStore';
import tw from '../../utils/tw';

const TabOneScreen = () => {
  const [timeOfDay, setTimeOfDay] = useState('');
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // No need for styles object when using tw

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
          <Clock isDark={isDark} />
          
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 100 }}
            style={tw.style('text-xl font-semibold mt-2', { color: theme.textSecondary })}
          >
            Good {timeOfDay}
          </MotiText>
        </View>
      </MotiView>
    </View>
  );
};

export default memo(TabOneScreen);