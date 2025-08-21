// Global type declarations for React Native
declare function require(id: string): any;

// NodeJS namespace for timers
declare namespace NodeJS {
  interface Timeout {
    ref(): this;
    unref(): this;
  }
  interface Global {
    __DEV__: boolean;
  }
}

// React Native core module augmentation
declare module 'react-native' {
  // TextInput interface for refs
  interface TextInput {
    focus(): void;
    blur(): void;
    clear(): void;
    isFocused(): boolean;
  }

  // Animated API
  namespace Animated {
    const View: any;
    const Text: any;
    const ScrollView: any;
    const Image: any;
    const SafeAreaView: any;
    const Value: any;
    const timing: any;
    const spring: any;
    const sequence: any;
    const parallel: any;
    const loop: any;
    const createAnimatedComponent: any;
  }
  
  // Fix for nativeEvent property in scroll events
  interface NativeSyntheticEvent<T> {
    nativeEvent: T;
  }
  
  // Export all commonly used components
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const SafeAreaView: any;
  export const TextInput: React.ForwardRefExoticComponent<any & React.RefAttributes<TextInput>>;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const FlatList: any;
  export const RefreshControl: any;
  export const Modal: any;
  export const Pressable: any;
  export const Dimensions: any;
  export const StatusBar: any;
  export const Platform: any;
  export const KeyboardAvoidingView: any;
  export const Image: any;
  export const Clipboard: any;
  export const Vibration: any;
  export const Appearance: any;
  export const Easing: any;
  export const ImageSourcePropType: any;
  export const Share: any;
  export const BackHandler: any;
  export const Switch: any;
  export const useColorScheme: any;
  export const Linking: any;
}

// React Native SVG module augmentation
declare module 'react-native-svg' {
  export const AnimatedSvg: any;
  export default any;
  export const Path: any;
  export const Circle: any;
  export const Svg: any;
  export const Defs: any;
  export const LinearGradient: any;
  export const Stop: any;
  export const G: any;
  export const Rect: any;
  export const Line: any;
  export const Ellipse: any;
  export const Polygon: any;
  export const Polyline: any;
  export const Text: any;
  export const TSpan: any;
  export const TextPath: any;
  export const Use: any;
  export const Image: any;
  export const ClipPath: any;
  export const Mask: any;
  export const Pattern: any;
  export const RadialGradient: any;
}

// Environment variables
declare const __DEV__: boolean;
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

// Image module declarations
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}
