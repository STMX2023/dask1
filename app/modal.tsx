import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, Pressable } from 'react-native';
import tw from '../utils/tw';

export default function ModalScreen() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white dark:bg-black`}>
      <Text style={tw`text-black dark:text-white text-xl font-bold`}>Modal</Text>
      <View style={tw`my-8 h-px w-4/5 bg-gray-200 dark:bg-gray-700`} />
      <Text style={tw`text-black dark:text-white text-lg`}>This is a modal screen</Text>
      <Pressable style={tw`mt-4 bg-purple-500 p-3 rounded`}>
        <Text style={tw`text-white`}>Modal Action</Text>
      </Pressable>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
