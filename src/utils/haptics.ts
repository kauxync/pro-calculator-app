import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerLightHaptic = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable on device/simulator
  }
};

export const triggerMediumHaptic = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics unavailable
  }
};

export const triggerHeavyHaptic = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Haptics unavailable
  }
};

export const triggerSuccessHaptic = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics unavailable
  }
};

export const triggerErrorHaptic = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics unavailable
  }
};

