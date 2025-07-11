import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { MotiView, MotiText } from 'moti';
import tw from '../utils/tw';

interface StatCardProps {
  stat: {
    label: string;
    value: string;
    trend: string;
    color: string;
  };
  index: number;
  isDark: boolean;
}

export const StatCard = memo(({ stat, index, isDark }: StatCardProps) => {
  // Pre-compute styles
  const styles = useMemo(() => ({
    container: tw`flex-1 ${index !== 2 ? 'mr-3' : ''}`,
    card: tw`p-6 rounded-3xl shadow-2xl border border-white/20`,
    value: tw`text-3xl font-bold mb-2`,
    label: tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`,
    trendContainer: tw`flex-row items-center`,
    trendDot: tw`w-2 h-2 rounded-full mr-2`,
    trendText: tw`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`,
  }), [index, isDark]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay: index * 50 // Much shorter delays
      }}
      style={styles.container}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? '#1F2937E0' : '#FFFFFFE0' }
        ]}
      >
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            type: 'timing',
            duration: 200,
            delay: 50 + (index * 50)
          }}
          style={[
            styles.value,
            { color: stat.color }
          ]}
        >
          {stat.value}
        </MotiText>
        <Text style={styles.label}>
          {stat.label}
        </Text>
        <View style={styles.trendContainer}>
          <View style={[styles.trendDot, { backgroundColor: stat.color }]} />
          <Text style={styles.trendText}>
            {stat.trend}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}, (prevProps, nextProps) => {
  // Only re-render if stat data or theme changes
  return prevProps.stat === nextProps.stat && 
         prevProps.isDark === nextProps.isDark &&
         prevProps.index === nextProps.index;
});

StatCard.displayName = 'StatCard';