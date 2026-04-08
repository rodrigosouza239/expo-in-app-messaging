# @rodrigo-souza/expo-in-app-messaging

Módulo nativo para **Expo** que permite interceptar mensagens do **Firebase In-App Messaging (FIAM)**. Este pacote foi criado para desenvolvedores que precisam de total liberdade criativa, permitindo o uso de **UI Customizada** (modais próprios) em vez dos layouts padrão do Firebase.

---

## ⚠️ Atenção: Requisitos de Configuração

Para garantir que o módulo funcione corretamente e evitar conflitos nativos:

1. **Não instale** o pacote oficial `@react-native-firebase/in-app-messaging`. Este módulo já gerencia a interceptação nativa internamente.
2. **Dependências Base:** Você deve ter instalado apenas:
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/installations

3 Arquivos de Configuração: O google-services.json (Android) e o GoogleService-Info.plist (iOS) devem estar na raiz do seu projeto e configurados no seu app.json.

4 Development Builds: Por ser um módulo nativo, ele não funciona no Expo Go. Utilize npx expo run:android ou npx expo run:ios.

🚀 Instalação

npx expo install @rodrigo-souza/expo-in-app-messaging

💻 Exemplo de Implementação

O módulo captura mensagens em dois cenários:

Runtime: Quando o app já está aberto (via Event Listener).

Cold Start: Quando o app é aberto através de um gatilho do Firebase (via busca de mensagem pendente).

1. Criando o Componente de Modal (CustomIAMModal.tsx)

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
            <Text style={styles.buttonText}>Acessar Agora!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', alignItems: 'center', paddingBottom: 25, elevation: 10 },
  closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  banner: { width: '100%', height: 200, resizeMode: 'cover' },
  headerPlaceholder: { width: '100%', height: 150, backgroundColor: '#FFDB00', justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 20, paddingHorizontal: 20, textAlign: 'center' },
  body: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 25, lineDirection: 22 },
  button: { marginTop: 25, backgroundColor: '#3483FA', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 8, width: '85%', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

2. Integrando no App.tsx

import { useEvent } from 'expo';
import ExpoInAppMessaging from '@rodrigo-souza/expo-in-app-messaging';
import installations from '@react-native-firebase/installations';
import { useEffect, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { CustomIAMModal } from './components/CustomIAMModal';

export default function App() {
  const payloadFromEvent = useEvent(ExpoInAppMessaging, 'onMessage');
  const [localMessage, setLocalMessage] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    async function checkPending() {
      try {
        // ID necessário para enviar mensagens de teste via Console do Firebase
        const id = await installations().getId();
        console.log('🆔 FIAM Test ID:', id);

        const pending = await ExpoInAppMessaging.getPendingMessage();
        if (pending) {
          setLocalMessage(pending);
          setIsModalVisible(true);
        }
      } catch (e) {
        console.error("Erro ao buscar mensagem pendente:", e);
      }
    }
    checkPending();
  }, []);

  useEffect(() => {
    if (payloadFromEvent) {
      setLocalMessage(payloadFromEvent);
      setIsModalVisible(true);
    }
  }, [payloadFromEvent]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* ... seu código de fundo ... */}
      
      <CustomIAMModal 
        visible={isModalVisible} 
        data={localMessage} 
        onClose={() => setIsModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

🛠️ API Reference
 
Método.             Descrição

getPendingMessage() Retorna uma Promise com a mensagem que disparou a abertura do app.

setMessagesSuppressed(bool) Bloqueia ou libera a exibição de mensagens programaticamente.

triggerEvent(name)Dispara um gatilho de evento para o Firebase (Analytics Trigger).

onMessageEvento disparado quando uma nova mensagem é interceptada.

📄 Licença
MIT © Rodrigo Souza