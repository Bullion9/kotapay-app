# Notification Configuration Fix

## Issue Fixed
Fixed deprecated `shouldShowAlert` warning in expo-notifications by updating to the new API.

## Changes Made
Updated notification handler configuration in TierDashboard.tsx:

### Before (Deprecated):
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

### After (Updated):
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

## Benefits
- ✅ Eliminates deprecation warnings
- ✅ Uses modern expo-notifications API
- ✅ Better control over notification display
- ✅ Forward-compatible with future Expo versions

## Notification Behavior
- `shouldShowBanner`: Shows notification banner at the top
- `shouldShowList`: Shows notification in the notification list/center
- `shouldPlaySound`: Plays notification sound
- `shouldSetBadge`: Updates app badge count

This provides the same user experience as before but uses the recommended modern API.
