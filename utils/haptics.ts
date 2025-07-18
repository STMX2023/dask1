import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticsManager {
  private enabled = true;

  // Selection feedback - light tap
  selection = () => {
    if (!this.enabled || Platform.OS === 'web') {
      return;
    }

    Haptics.selectionAsync().catch(() => {
      // Silently fail if haptics not available
    });
  };

  // Impact feedback - medium tap
  impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (!this.enabled || Platform.OS === 'web') {
      return;
    }

    Haptics.impactAsync(style).catch(() => {
      // Silently fail if haptics not available
    });
  };

  // Notification feedback
  notification = (
    type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
  ) => {
    if (!this.enabled || Platform.OS === 'web') {
      return;
    }

    Haptics.notificationAsync(type).catch(() => {
      // Silently fail if haptics not available
    });
  };

  // Light impact
  light = () => { this.impact(Haptics.ImpactFeedbackStyle.Light); };

  // Heavy impact
  heavy = () => { this.impact(Haptics.ImpactFeedbackStyle.Heavy); };

  // Success notification
  success = () => { this.notification(Haptics.NotificationFeedbackType.Success); };

  // Warning notification
  warning = () => { this.notification(Haptics.NotificationFeedbackType.Warning); };

  // Error notification
  error = () => { this.notification(Haptics.NotificationFeedbackType.Error); };

  // Enable/disable haptics
  setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  };

  // Check if haptics are available
  isAvailable = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      // Test with a light impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch {
      return false;
    }
  };
}

export const haptics = new HapticsManager();
