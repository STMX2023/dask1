import React, { useEffect, useState, useCallback, useMemo, memo, Suspense } from 'react';
import { View, Text, Pressable, useColorScheme, ScrollView } from 'react-native';
import { MotiView, MotiText } from 'moti';
import tw, { commonStyles, getThemedStyles } from '../../utils/tw';
import { UserCard } from '../../components/UserCard';
import { Clock } from '../../components/Clock';
import { StatCard } from '../../components/StatCard';
import { LoadingFallback } from '../../components/LoadingFallback';
import { LazyActivityList } from '../../components/LazyComponents';
import { OptimizedFloatingParticles } from '../../components/OptimizedFloatingParticles';
import { OptimizedMorphingGradient } from '../../components/OptimizedMorphingGradient';
import { useInteractionManager } from '../../hooks/useInteractionManager';
import { animationConfig, getOptimizedAnimation } from '../../utils/animationConfig';
import { useDelayedMount } from '../../hooks/useDelayedMount';
import { usePreloadComponent } from '../../hooks/usePreloadComponent';

// Memoized non-lazy components
const MemoizedUserCard = memo(UserCard);

const TabOneScreen = () => {
  
  const [timeOfDay, setTimeOfDay] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Delayed mount states for progressive rendering
  const showGradient = useDelayedMount(100);
  const showParticles = useDelayedMount(200);
  const showStats = useDelayedMount(50);
  const showTeam = useDelayedMount(150);
  const showActivities = useDelayedMount(250);
  
  // Preload ActivityList after initial mount
  usePreloadComponent(() => import('../../components/ActivityList'), 500);
  
  // Get themed styles once per render
  const themedStyles = useMemo(() => getThemedStyles(isDark), [isDark]);
  
  // Pre-compute static styles
  const staticStyles = useMemo(() => ({
    header: tw`px-6 pt-20 pb-8 relative`,
    headerBackdrop: tw`absolute inset-0 rounded-3xl`,
    headerContent: tw`relative z-10`,
    fab: tw`absolute bottom-8 right-6 z-50`,
    fabButton: tw`w-16 h-16 rounded-2xl shadow-2xl items-center justify-center`,
    fabText: tw`text-white text-3xl font-bold`,
    activitySection: commonStyles.mb8,
  }), []);

  useEffect(() => {
    
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  const stats = useMemo(() => [
    { label: 'Completed Today', value: '12', trend: '+8', color: '#10B981' },
    { label: 'Active Projects', value: '5', trend: '+2', color: '#3B82F6' },
    { label: 'Team Score', value: '94%', trend: '+5%', color: '#8B5CF6' },
  ], []);


  const sampleActivities = useMemo(() => [
    {
      id: '1',
      title: 'UI/UX Design Review',
      description: 'Review and approve the new dashboard mockups',
      timestamp: '2 hours ago',
      type: 'meeting' as const,
      completed: true
    },
    {
      id: '2',
      title: 'Production Deployment',
      description: 'Deploy v3.2.0 to production environment',
      timestamp: '4 hours ago',
      type: 'task' as const,
      completed: false
    },
    {
      id: '3',
      title: 'Quarterly Review',
      description: 'Present Q4 results to stakeholders',
      timestamp: '1 day ago',
      type: 'event' as const,
      completed: true
    },
  ], []);

  const handleActivityPress = useCallback((activity: any) => {
    console.log('Activity pressed:', activity.title);
  }, []);

  return (
    <View style={themedStyles.container}>
      
      {/* Morphing Gradient Background */}
      {showGradient && (
        <OptimizedMorphingGradient 
          colors={['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']}
          duration={10000}
        />
      )}
      
      {/* Floating Particles */}
      {showParticles && (
        <OptimizedFloatingParticles 
          colors={['#60A5FA', '#A78BFA', '#F87171', '#34D399', '#FBBF24', '#F472B6']}
        />
      )}

      <ScrollView
        style={commonStyles.flexOne}
        contentContainerStyle={commonStyles.pb8}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header with Time - Always show immediately */}
        <MotiView
          from={{ opacity: 0, translateY: -50, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
          }}
          style={staticStyles.header}
        >
          <MotiView
            animate={{ 
              backgroundColor: isDark ? '#00000080' : '#FFFFFF80',
            }}
            style={staticStyles.headerBackdrop}
          />
          
          <View style={staticStyles.headerContent}>
            <Clock isDark={isDark} />
            
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 100 }}
              style={[themedStyles.subheading, tw`mb-1 mt-2`]}
            >
              Good {timeOfDay}
            </MotiText>
          </View>
        </MotiView>


        {/* Stats Overview */}
        {showStats && (
          <View style={[commonStyles.px6, commonStyles.mb8]}>
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={themedStyles.heading}
            >
              Today's Overview
            </MotiText>
            
            <View style={[commonStyles.flexRow, commonStyles.justifyBetween]}>
              {stats.map((stat, index) => (
                <StatCard 
                  key={stat.label} 
                  stat={stat} 
                  index={index} 
                  isDark={isDark} 
                />
              ))}
            </View>
          </View>
        )}

        {/* Team Section */}
        {showTeam && (
          <View style={[commonStyles.px6, commonStyles.mb8]}>
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={themedStyles.heading}
            >
              Team Status
            </MotiText>
            
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 50 }}
              style={tw`mb-4`}
            >
              <MemoizedUserCard
                name="Sarah Johnson"
                email="sarah.johnson@company.com"
                status="online"
                variant="compact"
                onPress={() => console.log('User card pressed')}
              />
            </MotiView>
            
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 100 }}
            >
              <MemoizedUserCard
                name="Marcus Chen"
                email="marcus.chen@company.com"
                status="away"
                variant="compact"
                onPress={() => console.log('User card pressed')}
              />
            </MotiView>
          </View>
        )}

        {/* Activities Section */}
        {showActivities && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={staticStyles.activitySection}
          >
            <Suspense fallback={<LoadingFallback />}>
              <LazyActivityList
                activities={sampleActivities}
                onActivityPress={handleActivityPress}
                variant="default"
              />
            </Suspense>
          </MotiView>
        )}


        {/* Floating Action Button - Always visible */}
        <MotiView
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 300,
            delay: 200
          }}
          style={staticStyles.fab}
        >
          <Pressable
            style={({ pressed }) => [
              staticStyles.fabButton,
              {
                backgroundColor: pressed ? '#2563EB' : '#3B82F6',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              }
            ]}
            onPress={() => console.log('FAB pressed')}
          >
            <Text style={staticStyles.fabText}>+</Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </View>
  );
};

export default memo(TabOneScreen);