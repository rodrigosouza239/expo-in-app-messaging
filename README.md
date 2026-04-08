# 🚀 @rodrigo-souza/expo-in-app-messaging

Módulo nativo para **Expo** que permite interceptar mensagens do
**Firebase In-App Messaging (FIAM)** e renderizá-las com **UI totalmente
customizada**.

Ideal para quem precisa sair dos layouts padrão do Firebase e criar
experiências mais ricas --- como fazem apps como bancos, marketplaces e
super apps.

------------------------------------------------------------------------

## ✨ Features

-   🔥 Intercepta mensagens do **Firebase In-App Messaging**
-   🎨 Permite criar **modais e componentes 100% customizados**
-   ⚡ Suporte a:
    -   Runtime (app aberto)
    -   Cold Start (app aberto via trigger)
-   📡 Integração com eventos do Firebase (Analytics Trigger)
-   🧠 Controle programático de exibição (suppress)

------------------------------------------------------------------------

## ⚠️ Requisitos Importantes

### ❌ NÃO instale

``` bash
@react-native-firebase/in-app-messaging
```

------------------------------------------------------------------------

### ✅ Instale apenas as dependências base

``` bash
npx expo install @react-native-firebase/app @react-native-firebase/installations
```

------------------------------------------------------------------------

### 📁 Arquivos obrigatórios

-   google-services.json (Android)
-   GoogleService-Info.plist (iOS)

------------------------------------------------------------------------

### 📱 Development Build obrigatório

``` bash
npx expo run:android
npx expo run:ios
```

------------------------------------------------------------------------

## 📦 Instalação

``` bash
npx expo install @rodrigo-souza/expo-in-app-messaging
```

------------------------------------------------------------------------

## 🧩 Exemplo Completo

### 1. CustomIAMModal.tsx

``` tsx
import { Modal, TouchableOpacity, View, Image, Text, Linking, StyleSheet } from "react-native";

export const CustomIAMModal = ({ visible, data, onClose }) => {
  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ fontSize: 20 }}>✕</Text>
          </TouchableOpacity>

          {data.imageUrl ? (
            <Image source={{ uri: data.imageUrl }} style={styles.banner} />
          ) : (
            <View style={styles.headerPlaceholder}>
              <Text style={styles.emoji}>🤩</Text>
            </View>
          )}

          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.body}>{data.body}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (data.actionUrl) Linking.openURL(data.actionUrl);
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Acessar agora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
});
```

------------------------------------------------------------------------

### 2. App.tsx

``` tsx
import { useEvent } from 'expo';
import ExpoInAppMessaging from '@rodrigo-souza/expo-in-app-messaging';
import installations from '@react-native-firebase/installations';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { CustomIAMModal } from './CustomIAMModal';

export default function App() {
  const payload = useEvent(ExpoInAppMessaging, 'onMessage');

  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function checkPending() {
      const pending = await ExpoInAppMessaging.getPendingMessage();
      if (pending) {
        setMessage(pending);
        setVisible(true);
      }
    }
    checkPending();
  }, []);

  useEffect(() => {
    if (payload) {
      setMessage(payload);
      setVisible(true);
    }
  }, [payload]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomIAMModal
        visible={visible}
        data={message}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
}
```

Before 
<img width="1080" height="2220" alt="Screenshot_1775434402" src="https://github.com/user-attachments/assets/dae95329-88b8-4415-9c9c-fd02b8e52024" />


After 
<img width="1206" height="2622" alt="Simulator Screenshot - iPhone 17 Pro - 2026-04-05 at 19 40 45" src="https://github.com/user-attachments/assets/4828778a-203c-4f6c-9cde-f7ac8f699bb6" />


------------------------------------------------------------------------

## 🛠️ API

-   getPendingMessage()
-   setMessagesSuppressed(boolean)
-   triggerEvent(name)
-   onMessage

------------------------------------------------------------------------

## 📄 Licença

MIT © Rodrigo Souza
