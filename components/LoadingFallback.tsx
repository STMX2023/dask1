import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw from '../utils/tw';

interface LoadingFallbackProps {
  height?: number;
  color?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  height = 200,
  color = '#3B82F6',
}) => {
  return (
    <View style={[tw`items-center justify-center`, { height }]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};
