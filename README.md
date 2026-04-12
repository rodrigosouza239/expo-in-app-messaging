# expo-in-app-messaging

Firebase In-App Messaging for Expo — with **full custom UI support**.

Unlike `@react-native-firebase/in-app-messaging`, this module **intercepts** Firebase messages before they render, giving you complete control over the presentation layer. Build any modal, banner, or card using your own React Native components.

---

## Why this module?

`@react-native-firebase/in-app-messaging` forces you to use Firebase's default UI. This module solves that:

| | @react-native-firebase | **expo-in-app-messaging** |
|---|---|---|
| Receive Firebase messages | ✅ | ✅ |
| Custom UI components | ❌ | ✅ |
| Access campaign data & metadata | ❌ | ✅ |
| Log clicks to Analytics | ❌ | ✅ |
| Log dismissals to Analytics | ❌ | ✅ |
| Access custom key-value data | ❌ | ✅ |
| Expo managed workflow | ✅ | ✅ |
| New Architecture (Fabric) | ✅ | ✅ |

---

## Installation

```sh
npx expo install @rodrigo-souza/expo-in-app-messaging
```

> **Note:** Do **not** install `@react-native-firebase/in-app-messaging`. This module replaces it.

### Requirements

- Expo SDK 50+
- `@react-native-firebase/app` configured in your project
- Firebase project with In-App Messaging enabled
- A development build (`expo run:ios` / `expo run:android`) — does not work in Expo Go

### Configure Firebase

**iOS** — add `GoogleService-Info.plist` to `app.json`:

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

**Android** — add `google-services.json` to `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## Quick Start

```tsx
import { useEffect, useState } from 'react';
import { useEvent } from 'expo';
import ExpoInAppMessaging, { InAppMessagePayload } from '@rodrigo-souza/expo-in-app-messaging';

export default function App() {
  const [message, setMessage] = useState<InAppMessagePayload | null>(null);

  // 1. Listen for messages while the app is running
  const event = useEvent(ExpoInAppMessaging, 'onMessage');

  useEffect(() => {
    if (event) setMessage(event);
  }, [event]);

  // 2. Check for messages that opened the app (cold start — iOS only)
  useEffect(() => {
    ExpoInAppMessaging.getPendingMessage().then((pending) => {
      if (pending) setMessage(pending);
    });
  }, []);

  if (!message) return null;

  return (
    <MyCustomModal
      message={message}
      onAction={async () => {
        // 3. Log click — required for Firebase Analytics
        await ExpoInAppMessaging.logClick();
        setMessage(null);
      }}
      onDismiss={async () => {
        // 4. Log dismiss — required for Firebase Analytics
        await ExpoInAppMessaging.logDismiss();
        setMessage(null);
      }}
    />
  );
}
```

---

## API Reference

### Events

#### `onMessage`

Fired when Firebase delivers an in-app message while the app is in the foreground.

```ts
const payload = useEvent(ExpoInAppMessaging, 'onMessage');
```

Payload type: [`InAppMessagePayload`](#inappmessagepayload)

---

### Methods

#### `getPendingMessage(): Promise<InAppMessagePayload | null>`

Returns the message that caused the app to open from a cold start.

> **Note:** This is primarily useful on iOS. On Android, messages are always delivered via the `onMessage` event and this method returns `null`.

```ts
const pending = await ExpoInAppMessaging.getPendingMessage();
```

---

#### `setMessagesSuppressed(suppressed: boolean): void`

Blocks or resumes Firebase In-App Message delivery.

Useful for preventing messages from appearing during sensitive flows (onboarding, checkout, forms).

```ts
// Block messages during checkout
ExpoInAppMessaging.setMessagesSuppressed(true);

// Resume after checkout
ExpoInAppMessaging.setMessagesSuppressed(false);
```

---

#### `triggerEvent(eventName: string): void`

Manually triggers a Firebase In-App Messaging event.

Use this to display messages tied to custom trigger events defined in the [Firebase console](https://console.firebase.google.com/).

```ts
ExpoInAppMessaging.triggerEvent('checkout_completed');
```

---

#### `logClick(): Promise<void>`

Logs a CTA button click to Firebase Analytics.

**Call this when the user taps the action button in your custom UI.** Without this call, Firebase campaign click metrics will be empty.

```ts
const handleCTAPress = async () => {
  await ExpoInAppMessaging.logClick();
  // then navigate or open the action URL
};
```

---

#### `logDismiss(): Promise<void>`

Logs a message dismissal to Firebase Analytics.

**Call this when the user closes your custom UI without clicking the CTA.** Without this call, Firebase campaign dismiss metrics will be empty.

```ts
const handleClose = async () => {
  await ExpoInAppMessaging.logDismiss();
  setMessage(null);
};
```

---

### Types

#### `InAppMessagePayload`

```ts
type InAppMessagePayload = {
  /** Message display type. */
  type: 'BANNER' | 'MODAL' | 'CARD' | 'IMAGE_ONLY' | 'UNKNOWN';

  /** Title text. Empty string for IMAGE_ONLY messages. */
  title: string;

  /** Body text. Empty string when not set in the Firebase console. */
  body: string;

  /** Image URL. Empty string when not set. */
  imageUrl: string;

  /** CTA action URL. Empty string when not set. */
  actionUrl: string;

  /** Firebase campaign ID. */
  campaignId: string;

  /** Firebase campaign name. */
  campaignName: string;

  /** Whether this is a test message sent from the Firebase console. */
  isTestMessage: boolean;

  /** Custom key-value data attached to the campaign in the Firebase console. */
  data: Record<string, string>;
};
```

---

## Full Example

```tsx
import { useEffect, useState } from 'react';
import { useEvent } from 'expo';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native';
import ExpoInAppMessaging, {
  InAppMessagePayload,
} from '@rodrigo-souza/expo-in-app-messaging';

export default function App() {
  const [message, setMessage] = useState<InAppMessagePayload | null>(null);

  const event = useEvent(ExpoInAppMessaging, 'onMessage');

  useEffect(() => {
    ExpoInAppMessaging.getPendingMessage().then((m) => {
      if (m) setMessage(m);
    });
  }, []);

  useEffect(() => {
    if (event) setMessage(event);
  }, [event]);

  const handleAction = async () => {
    await ExpoInAppMessaging.logClick();
    if (message?.actionUrl) Linking.openURL(message.actionUrl);
    setMessage(null);
  };

  const handleDismiss = async () => {
    await ExpoInAppMessaging.logDismiss();
    setMessage(null);
  };

  return (
    <Modal visible={!!message} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {message?.imageUrl ? (
            <Image source={{ uri: message.imageUrl }} style={styles.image} />
          ) : null}

          <Text style={styles.title}>{message?.title}</Text>
          <Text style={styles.body}>{message?.body}</Text>

          {message?.actionUrl ? (
            <Pressable style={styles.button} onPress={handleAction}>
              <Text style={styles.buttonText}>Learn More</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.close} onPress={handleDismiss}>
            <Text>✕</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  body: { fontSize: 15, color: '#444', marginBottom: 20 },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  close: { position: 'absolute', top: 12, right: 16, padding: 4 },
});
```

---

## Using custom data from the Firebase console

Attach custom key-value pairs to any Firebase campaign and read them in your UI:

```tsx
const { data } = message;

if (data.theme === 'dark') {
  // render dark variant
}

if (data.discount_code) {
  // display promo code to user
}
```

---

## Firebase Analytics integration

| Event | Triggered by |
|-------|-------------|
| Impression | Automatically when message arrives |
| Click | Your code calling `logClick()` |
| Dismiss | Your code calling `logDismiss()` |

---

## Getting the Firebase Installation ID (for test devices)

To receive test messages from the Firebase console, you need your device's Firebase Installation ID:

```ts
import installations from '@react-native-firebase/installations';

const id = await installations().getId();
console.log('Firebase Installation ID:', id);
```

Add this ID in **Firebase Console → In-App Messaging → Test on device**.

---

## Platform notes

| Feature | iOS | Android |
|---------|-----|---------|
| `onMessage` event | ✅ | ✅ |
| `getPendingMessage()` | ✅ Cold-start support | Returns `null` (use `onMessage`) |
| `logClick()` | ✅ | ✅ |
| `logDismiss()` | ✅ | ✅ |
| `data` map | ✅ | ✅ |
| CARD message type | ✅ | ✅ |
| New Architecture (Fabric) | ✅ | ✅ |

---

## Contributing

Issues and pull requests are welcome at [github.com/rodrigosouza239/expo-in-app-messaging](https://github.com/rodrigosouza239/expo-in-app-messaging).

---

## License

MIT © Rodrigo Souza
