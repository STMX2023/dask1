import * as SecureStore from 'expo-secure-store';
import { shouldUseSecureStore, getEnvironmentInfo } from './platformCheck';

// Key management constants
const ENCRYPTION_KEY_ALIAS = 'dask_encryption_key';
const KEY_ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const KEY_CREATION_DATE_ALIAS = 'dask_key_creation_date';
const KEY_VERSION_ALIAS = 'dask_key_version';

/**
 * Generates a cryptographically secure random key
 * @returns Base64 encoded encryption key
 */
function generateSecureKey(): string {
  const keyLength = 32; // 256 bits
  const bytes = new Uint8Array(keyLength);

  // Use crypto.getRandomValues for secure random generation
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback for older environments
    for (let i = 0; i < keyLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to base64
  return globalThis.btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

/**
 * Stores a key securely in the device keychain
 * @param key The encryption key to store
 * @param version The version number of the key
 */
async function storeKeySecurely(key: string, version: number): Promise<void> {
  try {
    // Simple options for simulator compatibility
    const options = {
      keychainService: 'dask-driver-keychain',
      requireAuthentication: false,
    };

    await SecureStore.setItemAsync(ENCRYPTION_KEY_ALIAS, key, options);

    // Store metadata
    await SecureStore.setItemAsync(KEY_CREATION_DATE_ALIAS, Date.now().toString());
    await SecureStore.setItemAsync(KEY_VERSION_ALIAS, version.toString());

    // Encryption key stored securely
  } catch (error) {
    console.error('[KeyManager] Failed to store encryption key:', error);
    throw new Error('Failed to store encryption key');
  }
}

/**
 * Retrieves the current encryption key from secure storage
 * @returns The current encryption key or null if not found
 */
async function getStoredKey(): Promise<string | null> {
  try {
    const key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ALIAS);
    return key;
  } catch (error) {
    console.error('[KeyManager] Failed to retrieve encryption key:', error);
    return null;
  }
}

/**
 * Gets the current key version
 * @returns The current key version number
 */
async function getKeyVersion(): Promise<number> {
  try {
    const version = await SecureStore.getItemAsync(KEY_VERSION_ALIAS);
    return version ? parseInt(version, 10) : 0;
  } catch (error) {
    console.error('[KeyManager] Failed to retrieve key version:', error);
    return 0;
  }
}

/**
 * Checks if the current key needs rotation based on age
 * @returns True if key rotation is needed
 */
async function shouldRotateKey(): Promise<boolean> {
  try {
    const creationDateStr = await SecureStore.getItemAsync(KEY_CREATION_DATE_ALIAS);
    if (!creationDateStr) {
      return true;
    } // No creation date means new key needed

    const creationDate = parseInt(creationDateStr, 10);
    const currentDate = Date.now();
    const keyAge = currentDate - creationDate;

    const shouldRotate = keyAge > KEY_ROTATION_INTERVAL;

    if (shouldRotate) {
      // Key rotation needed
    }

    return shouldRotate;
  } catch (error) {
    console.error('[KeyManager] Failed to check key rotation status:', error);
    return true; // Default to rotation needed if check fails
  }
}

/**
 * Rotates the encryption key to a new version
 * @returns The new encryption key
 */
async function rotateKey(): Promise<string> {
  try {
    const currentVersion = await getKeyVersion();
    const newVersion = currentVersion + 1;
    const newKey = generateSecureKey();

    // Rotating key

    // Store the new key
    await storeKeySecurely(newKey, newVersion);

    // TODO: In the future, we might want to keep old keys for data migration
    // For now, we simply replace the key

    return newKey;
  } catch (error) {
    console.error('[KeyManager] Failed to rotate key:', error);
    throw new Error('Failed to rotate encryption key');
  }
}

/**
 * Gets or creates the encryption key for MMKV
 * Handles key rotation automatically
 * @returns The current encryption key
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    // Log environment info for debugging
    getEnvironmentInfo();
    // Check environment info

    // Check if we should use SecureStore
    if (!shouldUseSecureStore()) {
      // Using basic key generation for simulator/emulator
      return generateSecureKey();
    }

    // Check if we need to rotate the key
    const needsRotation = await shouldRotateKey();

    if (needsRotation) {
      // Performing key rotation
      return await rotateKey();
    }

    // Get existing key
    const existingKey = await getStoredKey();

    if (existingKey) {
      // Using existing encryption key
      return existingKey;
    }

    // Generate new key if none exists
    // Generating new encryption key
    const newKey = generateSecureKey();
    await storeKeySecurely(newKey, 1);

    return newKey;
  } catch (error) {
    console.error('[KeyManager] Failed to get or create encryption key:', error);

    // Fallback to a basic key if secure storage fails
    // This shouldn't happen in production, but provides resilience
    console.warn('[KeyManager] Falling back to basic key generation');
    return generateSecureKey();
  }
}

/**
 * Manually triggers key rotation (for testing or administrative purposes)
 * @returns The new encryption key
 */
export async function forceKeyRotation(): Promise<string> {
  // Forcing key rotation
  return await rotateKey();
}

/**
 * Clears all stored keys (for logout or reset)
 */
export async function clearAllKeys(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ALIAS);
    await SecureStore.deleteItemAsync(KEY_CREATION_DATE_ALIAS);
    await SecureStore.deleteItemAsync(KEY_VERSION_ALIAS);
    // All keys cleared
  } catch (error) {
    console.error('[KeyManager] Failed to clear keys:', error);
  }
}

/**
 * Gets key information for debugging/monitoring
 * @returns Key metadata
 */
export async function getKeyInfo(): Promise<{
  hasKey: boolean;
  version: number;
  age: number;
  needsRotation: boolean;
}> {
  try {
    const hasKey = (await getStoredKey()) !== null;
    const version = await getKeyVersion();
    const creationDateStr = await SecureStore.getItemAsync(KEY_CREATION_DATE_ALIAS);
    const creationDate = creationDateStr ? parseInt(creationDateStr, 10) : Date.now();
    const age = Date.now() - creationDate;
    const needsRotation = await shouldRotateKey();

    return {
      hasKey,
      version,
      age,
      needsRotation,
    };
  } catch (error) {
    console.error('[KeyManager] Failed to get key info:', error);
    return {
      hasKey: false,
      version: 0,
      age: 0,
      needsRotation: true,
    };
  }
}
