import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Alert, Platform, StyleSheet } from 'react-native';
import type { CameraType } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome6 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';
import tw from '../utils/tw';

// Pre-warm camera on module load for faster startup
if (Platform.OS === 'ios') {
  CameraView.isAvailableAsync().catch(() => {
    // Ignore errors from pre-warming camera
  });
}

const styles = StyleSheet.create({
  cameraIcon: {
    marginBottom: 16,
  },
  topControlsContainer: {
    paddingTop: 60,
  },
});

export const CameraScreen = () => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const isTakingPhoto = useRef(false);

  // All hooks must be defined before any conditional returns
  const handleClose = useCallback(() => {
    // Immediate UI feedback
    setIsCameraVisible(false);
    setIsReady(false);

    // Navigate immediately for better responsiveness
    router.back();
  }, []);

  const handleCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleRequestPermission = useCallback(() => {
    requestPermission().catch(console.error);
  }, [requestPermission]);

  const handleCameraError = useCallback(
    (error: unknown) => {
      console.error('Camera mount error:', error);
      setIsCameraVisible(false);
      Alert.alert('Camera Error', 'Failed to initialize camera. Please try again.', [
        { text: 'OK', onPress: handleClose },
      ]);
    },
    [handleClose],
  );

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async () => {
    // Prevent double taps
    if (isTakingPhoto.current || !cameraRef.current || !isReady) {
      return;
    }

    isTakingPhoto.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Even lower for maximum speed
        base64: false,
        skipProcessing: true, // Skip all processing
        exif: false, // No EXIF data
        fastMode: true, // Use fastest capture mode if available
      });

      // Check if photo is null or undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (photo?.uri) {
        Alert.alert('Photo Taken!', 'Photo saved successfully', [
          {
            text: 'Take Another',
            style: 'default',
            onPress: () => {
              isTakingPhoto.current = false;
            },
          },
          { text: 'Done', onPress: handleClose },
        ]);
      } else {
        // Photo capture failed silently
        console.error('Photo capture returned null');
        isTakingPhoto.current = false;
        Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      isTakingPhoto.current = false;
      Alert.alert('Camera Error', 'Failed to take picture. Please try again.');
    }
  }, [isReady, handleClose]);

  const handleTakePicture = useCallback(() => {
    takePicture().catch(console.error);
  }, [takePicture]);

  // Memoize button styles
  const buttonStyles = useMemo(
    () => ({
      closeButton: tw`w-12 h-12 rounded-full bg-black/50 items-center justify-center`,
      flipButton: tw`w-12 h-12 rounded-full bg-black/50 items-center justify-center`,
      captureButton: tw.style(
        'w-20 h-20 rounded-full border-4 border-white items-center justify-center',
        {
          backgroundColor: isReady ? '#FFFFFF' : '#FFFFFF80',
        },
      ),
      captureButtonInner: tw.style('w-16 h-16 rounded-full', {
        backgroundColor: isReady ? '#FFFFFF' : '#FFFFFF80',
      }),
    }),
    [isReady],
  );

  // Optimized camera mounting with crash prevention
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      // Minimal delay for crash prevention while keeping it fast
      const mountTimer = setTimeout(() => {
        if (mounted) {
          setIsCameraVisible(true);
        }
      }, 50); // Reduced from 200ms to 50ms for faster mounting

      return () => {
        mounted = false;
        clearTimeout(mountTimer);
        // Immediate cleanup
        setIsCameraVisible(false);
        setIsReady(false);
      };
    }, []),
  );

  // Handle permission states
  if (!permission) {
    // Camera permissions are still loading - show black screen to match camera
    return <View style={tw`flex-1 bg-black`} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View
        style={[tw`flex-1 justify-center items-center px-6`, { backgroundColor: theme.background }]}
      >
        <FontAwesome6
          name="camera"
          size={64}
          color={theme.textSecondary}
          style={styles.cameraIcon}
        />
        <Text style={[tw`text-xl font-bold text-center mb-2`, { color: theme.textPrimary }]}>
          Camera Access Required
        </Text>
        <Text style={[tw`text-base text-center mb-6`, { color: theme.textSecondary }]}>
          We need access to your camera to take photos. This permission is required to use the
          camera feature.
        </Text>
        <Pressable
          onPress={handleRequestPermission}
          style={[
            tw`px-6 py-3 rounded-lg border`,
            {
              backgroundColor: theme.success,
              borderColor: theme.success,
            },
          ]}
        >
          <Text style={tw`text-base font-semibold text-white`}>Grant Camera Permission</Text>
        </Pressable>
        <Pressable onPress={handleClose} style={tw`mt-4 px-6 py-3`}>
          <Text style={[tw`text-base`, { color: theme.textSecondary }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-black`}>
      {/* Camera View - only render when visible */}
      {isCameraVisible && (
        <CameraView
          ref={cameraRef}
          style={tw`flex-1`}
          facing={facing}
          onCameraReady={handleCameraReady}
          onMountError={handleCameraError}
          // Simplified config to prevent crashes
          autofocus="on"
        />
      )}

      {/* Loading overlay when camera is mounting - no text, just subtle indicator */}
      {!isReady && isCameraVisible && <View style={tw`absolute inset-0 bg-black`} />}

      {/* Top controls overlay */}
      <View
        pointerEvents="box-none"
        style={[tw`absolute top-0 left-0 right-0 z-10 px-4`, styles.topControlsContainer]}
      >
        <View style={tw`flex-row justify-between items-center`}>
          {/* Empty space for balance */}
          <View style={tw`w-12 h-12`} />

          {/* Title */}
          <Text style={tw`text-white text-lg font-semibold`}>Camera</Text>

          {/* Flip camera button */}
          <Pressable
            onPress={toggleCameraFacing}
            style={buttonStyles.flipButton}
            disabled={!isReady}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6
              name="camera-rotate"
              size={25}
              color={isReady ? '#FFFFFF' : '#FFFFFF80'}
            />
          </Pressable>
        </View>
      </View>

      {/* Bottom controls overlay */}
      <View style={tw`absolute bottom-0 left-0 right-0 z-10 pb-8 px-4`}>
        <View style={tw`flex-row justify-between items-center`}>
          {/* Empty space for balance */}
          <View style={tw`w-12`} />

          {/* Capture button in center */}
          <Pressable
            onPress={handleTakePicture}
            disabled={!isReady || isTakingPhoto.current}
            style={buttonStyles.captureButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={buttonStyles.captureButtonInner} />
          </Pressable>

          {/* Close button on right */}
          <Pressable
            onPress={handleClose}
            style={buttonStyles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6 name="xmark" size={30} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
