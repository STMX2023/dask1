import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../../utils/tw';

export default function TabTwoScreen() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white dark:bg-black`}>
      <Text style={tw`text-black dark:text-white text-xl font-bold`}>Tab Two</Text>
      <View style={tw`my-8 h-px w-4/5 bg-gray-200 dark:bg-gray-700`} />
      <Text style={tw`text-black dark:text-white text-lg`}>Welcome to Tab Two</Text>
      <Pressable style={tw`mt-4 bg-green-500 p-3 rounded`}>
        <Text style={tw`text-white`}>Tab Two Button</Text>
      </Pressable>
    </View>
  );
}
