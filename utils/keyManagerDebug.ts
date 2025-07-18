/* eslint-disable no-console */
import { getKeyInfo, forceKeyRotation, clearAllKeys } from './keyManager';

/**
 * Debug utilities for key management
 * These functions should only be used in development
 */

export const keyManagerDebug = {
  /**
   * Logs current key information
   */
  async logKeyInfo(): Promise<void> {
    try {
      const keyInfo = await getKeyInfo();
      console.log('[KeyManager Debug] Current key info:', {
        hasKey: keyInfo.hasKey,
        version: keyInfo.version,
        ageDays: Math.floor(keyInfo.age / (24 * 60 * 60 * 1000)),
        needsRotation: keyInfo.needsRotation,
      });
    } catch (error) {
      console.error('[KeyManager Debug] Failed to get key info:', error);
    }
  },

  /**
   * Forces key rotation (for testing)
   */
  async forceRotation(): Promise<void> {
    try {
      console.log('[KeyManager Debug] Forcing key rotation...');
      await forceKeyRotation();
      console.log('[KeyManager Debug] Key rotation complete');
    } catch (error) {
      console.error('[KeyManager Debug] Failed to force rotation:', error);
    }
  },

  /**
   * Clears all keys (for testing)
   */
  async clearKeys(): Promise<void> {
    try {
      console.log('[KeyManager Debug] Clearing all keys...');
      await clearAllKeys();
      console.log('[KeyManager Debug] All keys cleared');
    } catch (error) {
      console.error('[KeyManager Debug] Failed to clear keys:', error);
    }
  },
};

// Make it available globally in development
if (__DEV__) {
  (globalThis as unknown as { keyManagerDebug: typeof keyManagerDebug }).keyManagerDebug =
    keyManagerDebug;
  console.log('[KeyManager Debug] Debug utilities available as global.keyManagerDebug');
}
