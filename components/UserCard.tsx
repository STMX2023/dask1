import React, { useMemo } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { MotiView, MotiText } from 'moti';
import tw from '../utils/tw';

interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  variant?: 'default' | 'compact';
  onPress?: () => void;
}

export function UserCard({ 
  name, 
  email, 
  avatar, 
  status = 'offline',
  variant = 'default',
  onPress
}: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Pre-compute styles
  const styles = useMemo(() => {
    const isCompact = variant === 'compact';
    return {
      card: isCompact 
        ? tw`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg m-2 flex-row items-center`
        : tw`p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl m-4 items-center`,
      avatar: isCompact ? tw`w-12 h-12` : tw`w-20 h-20`,
      avatarContainer: tw`relative`,
      avatarPlaceholder: tw`rounded-full bg-purple-500 dark:bg-purple-600 items-center justify-center`,
      avatarText: tw`text-white text-lg font-bold`,
      statusDot: tw`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-lg`,
      contentContainer: isCompact ? tw`ml-4 flex-1` : tw`mt-4 items-center`,
      nameText: tw`text-gray-900 dark:text-white font-bold text-lg`,
      emailText: tw`text-gray-600 dark:text-gray-400 text-sm mt-1`,
      statusBadge: tw`mt-2 px-3 py-1 rounded-full`,
      statusText: tw`text-xs font-medium capitalize`,
    };
  }, [variant]);

  const statusBgColor = status === 'online' 
    ? 'bg-green-100 dark:bg-green-900' 
    : status === 'away' 
    ? 'bg-yellow-100 dark:bg-yellow-900' 
    : 'bg-gray-100 dark:bg-gray-700';

  const statusTextColor = status === 'online' 
    ? 'text-green-700 dark:text-green-300' 
    : status === 'away' 
    ? 'text-yellow-700 dark:text-yellow-300' 
    : 'text-gray-600 dark:text-gray-400';

  const CardContent = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 200,
      }}
      style={styles.card}
    >
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image 
            source={{ uri: avatar }} 
            style={[styles.avatar, tw`rounded-full bg-gray-200`]}
          />
        ) : (
          <View
            style={[styles.avatar, styles.avatarPlaceholder]}
          >
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'timing',
            duration: 150,
            delay: 100
          }}
          style={[styles.statusDot, tw`${getStatusColor(status)}`]}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.nameText}>
          {name}
        </Text>
        <Text style={styles.emailText}>
          {email}
        </Text>
        <View style={[styles.statusBadge, tw`${statusBgColor}`]}>
          <Text style={[styles.statusText, tw`${statusTextColor}`]}>
            {status}
          </Text>
        </View>
      </View>
    </MotiView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && tw`opacity-80 scale-98`
        ]}
      >
        <CardContent />
      </Pressable>
    );
  }

  return <CardContent />;
}