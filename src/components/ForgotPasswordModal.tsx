import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Check,
} from 'lucide-react-native';
import { EyeIcon } from './icons';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'identifier' | 'otp' | 'password' | 'success';

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Refs for animations and inputs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef<(TextInput | null)[]>([]);
  
  // Validation helpers
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isValidPhone = (phone: string) => {
    return /^\+?[\d\s-()]{10,}$/.test(phone);
  };
  
  const isIdentifierValid = identifier.trim() && (isValidEmail(identifier) || isValidPhone(identifier));
  const isOtpComplete = otp.every(digit => digit !== '');
  
  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[\d\W]/.test(password)) strength += 25;
    return strength;
  };
  
  const passwordStrength = getPasswordStrength(newPassword);
  const isPasswordValid = passwordStrength >= 75 && newPassword === confirmPassword;
  
  // Animate modal in
  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, [overlayOpacity, slideAnim]);
  
  // Animate modal out
  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, slideAnim]);
  
  // Shake animation for errors
  const shakeInput = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 4, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 75, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 75, useNativeDriver: true }),
    ]).start();
  };
  
  // Animate password strength bar
  useEffect(() => {
    Animated.timing(strengthAnim, {
      toValue: passwordStrength / 100,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [passwordStrength, strengthAnim]);
  
  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('identifier');
      setIdentifier('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setResendTimer(0);
      setIsLoading(false);
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animateIn, animateOut]);
  
  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  
  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < 100;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const progress = Math.min(gestureState.dy / 300, 1);
          slideAnim.setValue(1 - progress);
          overlayOpacity.setValue(1 - progress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
        } else {
          animateIn();
        }
      },
    })
  ).current;
  
  // Handle send code
  const handleSendCode = async () => {
    if (!isIdentifierValid) {
      setError('Please enter a valid email or phone number');
      shakeInput();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('otp');
      setResendTimer(60);
    } catch {
      setError('Failed to send code. Please try again.');
      shakeInput();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP change
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (newOtp.every(digit => digit !== '')) {
      setTimeout(() => handleVerifyOtp(newOtp), 100);
    }
  };
  
  // Handle verify OTP
  const handleVerifyOtp = async (otpCode?: string[]) => {
    const codeToVerify = otpCode || otp;
    if (!codeToVerify.every(digit => digit !== '')) {
      setError('Please enter the complete 6-digit code');
      shakeInput();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('password');
    } catch {
      setError('Invalid code. Please try again.');
      shakeInput();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      setError('Passwords must match and meet strength requirements');
      shakeInput();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('success');
      
      // Success animation
      successScale.setValue(0);
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }).start();
      
      // Auto close and login after success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch {
      setError('Failed to reset password. Please try again.');
      shakeInput();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendTimer(60);
      setError(null);
    } catch {
      setError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'identifier':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Reset Password</Text>
            <Text style={styles.stepSubtitle}>
              We&apos;ll send a 6-digit code to your phone or email
            </Text>
            
            <Animated.View 
              style={[
                styles.inputContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  identifier && styles.inputFocused,
                  error && styles.inputError,
                ]}
                placeholder="Email or phone number"
                placeholderTextColor="#A3AABE"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Enter email or phone number"
              />
            </Animated.View>
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isIdentifierValid && styles.buttonDisabled,
              ]}
              onPress={handleSendCode}
              disabled={!isIdentifierValid || isLoading}
              accessibilityLabel="Send verification code"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        );
        
      case 'otp':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Enter Verification Code</Text>
            <Text style={styles.stepSubtitle}>
              We sent a 6-digit code to {identifier}
            </Text>
            
            <Animated.View 
              style={[
                styles.otpContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => otpRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    error && styles.inputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(index, text.slice(-1))}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  accessibilityLabel={`Digit ${index + 1} of verification code`}
                />
              ))}
            </Animated.View>
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isOtpComplete && styles.buttonDisabled,
              ]}
              onPress={() => handleVerifyOtp()}
              disabled={!isOtpComplete || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm Code</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={resendTimer > 0 || isLoading}
            >
              <Text style={[
                styles.resendButtonText,
                resendTimer > 0 && styles.resendButtonTextDisabled,
              ]}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        );
        
      case 'password':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepSubtitle}>
              Choose a strong password to secure your account
            </Text>
            
            <Animated.View 
              style={[
                styles.inputContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    newPassword && styles.inputFocused,
                    error && styles.inputError,
                  ]}
                  placeholder="New password"
                  placeholderTextColor="#A3AABE"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showNewPassword}
                  accessibilityLabel="Enter new password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon 
                    size={20} 
                    color="#A3AABE" 
                    filled={!showNewPassword}
                  />
                </TouchableOpacity>
              </View>
              
              {newPassword && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBackground}>
                    <Animated.View
                      style={[
                        styles.strengthBar,
                        {
                          width: strengthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: passwordStrength >= 75 ? '#06402B' : 
                                         passwordStrength >= 50 ? '#FFA500' : '#EA3B52',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {passwordStrength >= 75 ? 'Strong' : 
                     passwordStrength >= 50 ? 'Medium' : 'Weak'}
                  </Text>
                </View>
              )}
              
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    confirmPassword && styles.inputFocused,
                    error && styles.inputError,
                    confirmPassword && newPassword !== confirmPassword && styles.inputError,
                  ]}
                  placeholder="Confirm new password"
                  placeholderTextColor="#A3AABE"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  accessibilityLabel="Confirm new password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon 
                    size={20} 
                    color="#A3AABE" 
                    filled={!showConfirmPassword}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isPasswordValid && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!isPasswordValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Reset & Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        );
        
      case 'success':
        return (
          <View style={styles.successContainer}>
            <Animated.View
              style={[
                styles.successIcon,
                { transform: [{ scale: successScale }] }
              ]}
            >
              <Check size={48} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.successTitle}>Password Reset Successfully!</Text>
            <Text style={styles.successSubtitle}>
              You will be automatically signed in
            </Text>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal transparent visible={visible} animationType="none">
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.overlayBackground,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            {/* Close Button */}
            {currentStep !== 'success' && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close forgot password modal"
              >
                <X size={24} color="#A3AABE" />
              </TouchableOpacity>
            )}
            
            {/* Step Content */}
            {renderStepContent()}
            
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: 400,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#b9f1ff',
    backgroundColor: '#F8FFFE',
  },
  inputError: {
    borderColor: '#EA3B52',
    backgroundColor: '#FFF5F5',
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 20,
    height: 20,
  },
  strengthContainer: {
    marginBottom: 8,
  },
  strengthBarBackground: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#06402B',
    backgroundColor: '#F8FFF8',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#06402B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    alignItems: 'center',
    padding: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#06402B',
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#A3AABE',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#06402B',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#EA3B52',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EA3B52',
    fontWeight: '500',
  },
});

export default ForgotPasswordModal;
