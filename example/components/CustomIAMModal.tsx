import {
  Modal,
  TouchableOpacity,
  View,
  ImageBackground,
  Text,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import ExpoInAppMessaging from '@rodrigo-souza/expo-in-app-messaging';
import { InAppMessagePayload } from '@rodrigo-souza/expo-in-app-messaging';

const { height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  data: InAppMessagePayload | null;
  onClose: () => void;
};

export const CustomIAMModal = ({ visible, data, onClose }: Props) => {
  if (!data) return null;

  const handleAction = async () => {
    await ExpoInAppMessaging.logClick();
    if (data.actionUrl) Linking.openURL(data.actionUrl);
    onClose();
  };

  const handleDismiss = async () => {
    await ExpoInAppMessaging.logDismiss();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ImageBackground
            source={require('../assets/pop-up.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{data.title?.toUpperCase()}</Text>

              <Text style={styles.body}>{data.body}</Text>

              <TouchableOpacity style={styles.button} onPress={handleAction}>
                <Text style={styles.buttonText}>Simule Agora</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: height * 0.7,
    backgroundColor: '#005CA9',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: 25,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.9,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
