import { useTheme } from '../contexts/ThemeContext';
import { playSound, triggerHaptic, buttonFeedback, successFeedback, errorFeedback } from '../utils/feedback';

/**
 * Custom hook for handling sound and haptic feedback throughout the app
 */
export const useFeedback = () => {
  const { soundEnabled, hapticFeedback } = useTheme();

  const settings = { soundEnabled, hapticFeedback };

  return {
    // Individual controls
    playSound: () => playSound(soundEnabled),
    triggerHaptic: (duration: number = 50) => triggerHaptic(hapticFeedback, duration),
    
    // Combined feedback
    buttonPress: () => buttonFeedback(settings),
    success: () => successFeedback(settings),
    error: () => errorFeedback(settings),
    
    // Settings values for manual checks
    soundEnabled,
    hapticFeedback,
  };
};
