import { Vibration } from 'react-native';

interface FeedbackSettings {
  soundEnabled: boolean;
  hapticFeedback: boolean;
}

/**
 * Play sound effect if sound is enabled
 */
export const playSound = (soundEnabled: boolean) => {
  if (soundEnabled) {
    // In a real app, you would play an actual sound file here
    // For now, we'll just log it to show it's working
    console.log('🔊 Sound effect played');
  }
};

/**
 * Trigger haptic feedback if enabled
 */
export const triggerHaptic = (hapticFeedback: boolean, duration: number = 50) => {
  if (hapticFeedback) {
    Vibration.vibrate(duration);
  }
};

/**
 * Combined feedback function - both sound and haptic
 */
export const playFeedback = (settings: FeedbackSettings, hapticDuration: number = 50) => {
  playSound(settings.soundEnabled);
  triggerHaptic(settings.hapticFeedback, hapticDuration);
};

/**
 * Feedback for button presses
 */
export const buttonFeedback = (settings: FeedbackSettings) => {
  playFeedback(settings, 50);
};

/**
 * Feedback for success actions
 */
export const successFeedback = (settings: FeedbackSettings) => {
  playFeedback(settings, 100);
};

/**
 * Feedback for error actions
 */
export const errorFeedback = (settings: FeedbackSettings) => {
  playFeedback(settings, 200);
};
