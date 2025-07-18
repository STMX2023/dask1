import { Platform } from 'react-native';

/**
 * Platform detection utilities for DASK
 */

/**
 * Check if running on iOS simulator
 * @returns true if running on iOS simulator
 */
export const isIOSSimulator = (): boolean => {
  return Platform.OS === 'ios' && __DEV__ && Platform.constants.systemName === 'iOS';
};

/**
 * Check if running on Android emulator
 * @returns true if running on Android emulator
 */
export const isAndroidEmulator = (): boolean => {
  return Platform.OS === 'android' && __DEV__;
};

/**
 * Check if running on a real device
 * @returns true if running on a real device
 */
export const isRealDevice = (): boolean => {
  return !isIOSSimulator() && !isAndroidEmulator();
};

/**
 * Check if SecureStore should be available
 * @returns true if SecureStore should work properly
 */
export const shouldUseSecureStore = (): boolean => {
  // In development, SecureStore works on real devices and some emulators
  // In production builds, it should always work
  return !__DEV__ || isRealDevice();
};

/**
 * Get environment information for debugging
 * @returns Object with environment details
 */
export const getEnvironmentInfo = () => ({
  platform: Platform.OS,
  version: Platform.Version,
  isDev: __DEV__,
  isSimulator: isIOSSimulator(),
  isEmulator: isAndroidEmulator(),
  isRealDevice: isRealDevice(),
  shouldUseSecureStore: shouldUseSecureStore(),
});
