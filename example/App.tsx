import { useEvent } from 'expo';
import ExpoInAppMessaging from 'expo-in-app-messaging';
import installations from '@react-native-firebase/installations';
import { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View, Image, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { CustomIAMModal } from './components/CustomIAMModal';

export default function App() {
  const payloadFromEvent = useEvent(ExpoInAppMessaging, 'onMessage');
  
  const [localMessage, setLocalMessage] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
  
    async function checkPending() {
      try {
        const id = await installations().getId();
        console.log('🆔 ID para Teste no Firebase:', id);
        const pending = await ExpoInAppMessaging.getPendingMessage();
        console.log('🔍 Verificando mensagem pendente (Android Boot):', pending);
        
        if (pending) {
          setLocalMessage(pending);
          setIsModalVisible(true);
        }
      } catch (e) {
        console.error("Erro ao buscar pendentes:", e);
      }
    }

    checkPending();
  }, []);

  useEffect(() => {
    if (payloadFromEvent) {
      console.log('📩 Nova mensagem recebida via Evento:', payloadFromEvent);
      setLocalMessage(payloadFromEvent);
      setIsModalVisible(true);
    }
  }, [payloadFromEvent]);

  const handleClose = () => {
    setIsModalVisible(false);
    // Opcional: setLocalMessage(null) se você não quiser manter o card na tela atrás do modal
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container}>
          <Text style={styles.header}>FIAM Custom Test</Text>

          <Group name="Controle de Exibição">
            <Button
              title="Bloquear Mensagens"
              onPress={() => ExpoInAppMessaging.setMessagesSuppressed(true)}
            />
            <Button
              title="Liberar Mensagens"
              onPress={() => ExpoInAppMessaging.setMessagesSuppressed(false)}
            />
          </Group>

          <Group name="Gatilho Programático">
            <Button
              title="Disparar Evento 'teste_manual'"
              onPress={() => ExpoInAppMessaging.triggerEvent('teste_manual')}
            />
          </Group>

          <Group name="Status da Mensagem">
            {localMessage ? (
              <View style={styles.card}>
                <Text style={styles.typeTag}>Tipo: {localMessage.type}</Text>
                <Text style={styles.title}>{localMessage.title}</Text>
                <Text style={styles.body}>{localMessage.body}</Text>
                
                {localMessage.imageUrl && (
                  <Image
                    source={{ uri: localMessage.imageUrl }}
                    style={styles.previewImage}
                  />
                )}
                
                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Reabrir Modal"
                    onPress={() => setIsModalVisible(true)}
                  />
                  <View style={{ height: 10 }} />
                  <Button title="Limpar Estado" color="red" onPress={() => setLocalMessage(null)} />
                </View>
              </View>
            ) : (
              <Text style={{ textAlign: 'center', color: '#999' }}>Aguardando disparo do Firebase...</Text>
            )}
          </Group>
        </ScrollView>
      </SafeAreaView>

      <CustomIAMModal 
        visible={isModalVisible} 
        data={localMessage} 
        onClose={handleClose} 
      />
    </>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles: { [key: string]: any } = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 10,
    color: '#333'
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555'
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 15,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  body: { fontSize: 14, color: '#444', marginVertical: 8 },
  typeTag: { fontSize: 10, color: '#007AFF', marginBottom: 5, fontWeight: 'bold', textTransform: 'uppercase' },
  previewImage: { width: '100%', height: 150, borderRadius: 8, marginTop: 10, backgroundColor: '#ddd' }
};