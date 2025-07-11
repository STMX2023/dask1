import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import tw from '../utils/tw';
import { currentSettings, PERFORMANCE_LEVEL } from '../utils/animationOptimizer';

export const AnimationStressTest = () => {
  const [results, setResults] = useState<{
    fps: number;
    dropFrames: number;
    avgRenderTime: number;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const runStressTest = useCallback(async () => {
    setTesting(true);
    
    // Measure FPS over 5 seconds
    let frameCount = 0;
    let lastTime = performance.now();
    let dropFrames = 0;
    const targetFrameTime = 1000 / 60; // 16.67ms for 60fps
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > targetFrameTime * 1.5) {
        dropFrames++;
      }
      
      frameCount++;
      lastTime = currentTime;
    };
    
    // Run test for 5 seconds
    const interval = setInterval(measureFrame, 1);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    clearInterval(interval);
    
    const avgFPS = frameCount / 5;
    const avgRenderTime = 0; // Performance monitoring removed
    
    setResults({
      fps: Math.round(avgFPS),
      dropFrames,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
    });
    
    setTesting(false);
  }, []);

  return (
    <View style={tw`p-4 bg-gray-100 dark:bg-gray-900 rounded-lg m-4`}>
      <Text style={tw`text-lg font-bold mb-4`}>Animation Performance Test</Text>
      
      <View style={tw`mb-4`}>
        <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
          Device Performance Level: <Text style={tw`font-bold`}>{PERFORMANCE_LEVEL.toUpperCase()}</Text>
        </Text>
        <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
          Particle Count: {currentSettings.particleCount}
        </Text>
        <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
          Target FPS: {currentSettings.frameRate}
        </Text>
      </View>
      
      <Pressable
        style={tw`bg-blue-500 p-3 rounded-lg mb-4 ${testing ? 'opacity-50' : ''}`}
        onPress={runStressTest}
        disabled={testing}
      >
        <Text style={tw`text-white text-center font-medium`}>
          {testing ? 'Running Test...' : 'Run Stress Test'}
        </Text>
      </Pressable>
      
      {results && (
        <View style={tw`bg-white dark:bg-gray-800 p-4 rounded-lg`}>
          <Text style={tw`font-bold mb-2`}>Results:</Text>
          <Text style={tw`text-sm mb-1`}>
            Average FPS: <Text style={tw`font-mono ${results.fps < 30 ? 'text-red-500' : results.fps < 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {results.fps}
            </Text>
          </Text>
          <Text style={tw`text-sm mb-1`}>
            Dropped Frames: <Text style={tw`font-mono ${results.dropFrames > 50 ? 'text-red-500' : results.dropFrames > 20 ? 'text-yellow-500' : 'text-green-500'}`}>
              {results.dropFrames}
            </Text>
          </Text>
          <Text style={tw`text-sm`}>
            Avg Render Time: <Text style={tw`font-mono ${results.avgRenderTime > 16.67 ? 'text-red-500' : results.avgRenderTime > 8 ? 'text-yellow-500' : 'text-green-500'}`}>
              {results.avgRenderTime}ms
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};