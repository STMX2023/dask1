import React from 'react';
import { View } from 'react-native';
import { CameraScreen } from '../components/CameraScreen';
import tw from '../utils/tw';

export default function CameraModal() {
  return (
    <View style={tw`flex-1 bg-black`}>
      <CameraScreen />
    </View>
  );
}