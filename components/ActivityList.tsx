import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MotiView, MotiText } from 'moti';
import tw from '../utils/tw';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'task' | 'meeting' | 'reminder' | 'event';
  completed?: boolean;
}

interface ActivityListProps {
  activities: Activity[];
  onActivityPress?: (activity: Activity) => void;
  variant?: 'default' | 'compact';
}

export function ActivityList({ 
  activities, 
  onActivityPress,
  variant = 'default' 
}: ActivityListProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'meeting':
        return '📅';
      case 'reminder':
        return '⏰';
      case 'event':
        return '🎉';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'reminder':
        return 'bg-orange-500';
      case 'event':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'meeting':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'reminder':
        return 'bg-orange-50 dark:bg-orange-900/20';
      case 'event':
        return 'bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const itemStyle = variant === 'compact'
    ? tw`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-3`
    : tw`p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-4`;

  return (
    <View style={tw`flex-1`}>
      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        style={tw`text-2xl font-bold text-gray-900 dark:text-white mb-6 px-6`}
      >
        Recent Activities
      </MotiText>
      
      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {activities.map((activity, index) => (
          <MotiView
            key={activity.id}
            from={{ opacity: 0, translateY: 50, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 200,
              delay: index * 100
            }}
          >
            <Pressable
              style={({ pressed }) => [
                itemStyle,
                pressed && tw`opacity-80 scale-98`,
                tw`overflow-hidden`
              ]}
              onPress={() => onActivityPress?.(activity)}
            >
              <MotiView
                from={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  type: 'timing',
                  duration: 800,
                  delay: (index * 100) + 200
                }}
                style={tw`absolute top-0 left-0 h-1 ${getActivityColor(activity.type)}`}
              />
              
              <View style={tw`flex-row items-center`}>
                <MotiView
                  from={{ scale: 0, rotate: '180deg' }}
                  animate={{ scale: 1, rotate: '0deg' }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 200,
                    delay: (index * 100) + 300
                  }}
                  style={tw`w-12 h-12 rounded-xl ${getActivityBgColor(activity.type)} items-center justify-center mr-4 shadow-lg`}
                >
                  <MotiText
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      delay: (index * 100) + 400
                    }}
                    style={tw`text-xl`}
                  >
                    {getActivityIcon(activity.type)}
                  </MotiText>
                </MotiView>
                
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 200,
                    delay: (index * 100) + 350
                  }}
                  style={tw`flex-1`}
                >
                  <MotiText
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: (index * 100) + 450 }}
                    style={tw`text-gray-900 dark:text-white font-bold text-lg mb-1`}
                  >
                    {activity.title}
                  </MotiText>
                  <MotiText
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: (index * 100) + 500 }}
                    style={tw`text-gray-600 dark:text-gray-400 text-sm leading-5 mb-2`}
                  >
                    {activity.description}
                  </MotiText>
                  <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      delay: (index * 100) + 550
                    }}
                    style={tw`flex-row items-center justify-between`}
                  >
                    <Text style={tw`text-gray-500 dark:text-gray-500 text-xs font-medium`}>
                      {activity.timestamp}
                    </Text>
                    <MotiView
                      from={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 200,
                        delay: (index * 100) + 600
                      }}
                      style={tw`px-2 py-1 rounded-full ${getActivityBgColor(activity.type)}`}
                    >
                      <Text style={tw`text-xs font-medium capitalize ${getActivityColor(activity.type).replace('bg-', 'text-')}`}>
                        {activity.type}
                      </Text>
                    </MotiView>
                  </MotiView>
                </MotiView>
                
                {activity.completed && (
                  <MotiView
                    from={{ opacity: 0, scale: 0, rotate: '180deg' }}
                    animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 200,
                      delay: (index * 100) + 700
                    }}
                    style={tw`w-8 h-8 bg-green-500 rounded-full items-center justify-center shadow-lg ml-3`}
                  >
                    <MotiText
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        type: 'timing',
                        duration: 1500,
                        delay: (index * 100) + 800,
                        loop: true,
                        repeatReverse: false
                      }}
                      style={tw`text-white text-sm font-bold`}
                    >
                      ✓
                    </MotiText>
                  </MotiView>
                )}
              </View>
            </Pressable>
          </MotiView>
        ))}
        
        {activities.length === 0 && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 200,
              delay: 200
            }}
            style={tw`items-center justify-center py-16`}
          >
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 400 }}
              style={tw`text-6xl mb-4`}
            >
              📋
            </MotiText>
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500 }}
              style={tw`text-gray-500 dark:text-gray-400 text-lg font-medium`}
            >
              No activities yet
            </MotiText>
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600 }}
              style={tw`text-gray-400 dark:text-gray-500 text-sm mt-2`}
            >
              Start by creating your first task
            </MotiText>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
} 