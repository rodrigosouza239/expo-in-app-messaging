import { useEvent } from 'expo';
import ExpoInAppMessaging, { InAppMessagePayload } from 'expo-in-app-messaging';
import installations from '@react-native-firebase/installations';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View, StyleSheet } from 'react-native';
import { CustomIAMModal } from './components/CustomIAMModal';

type LogEntry = { time: string; msg: string };

export default function App() {
  const payloadFromEvent = useEvent(ExpoInAppMessaging, 'onMessage');

  const [localMessage, setLocalMessage] = useState<InAppMessagePayload | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [installationId, setInstallationId] = useState('...');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg }, ...prev].slice(0, 20));
    console.log(`[FIAM] ${msg}`);
  };

  // Get Firebase Installation ID for test device setup
  useEffect(() => {
    installations()
      .getId()
      .then((id) => {
        setInstallationId(id);
        log(`Installation ID: ${id}`);
      })
      .catch((e) => log(`Error getting ID: ${e.message}`));
  }, []);

  // Cold-start: check for pending message (iOS only)
  useEffect(() => {
    ExpoInAppMessaging.getPendingMessage()
      .then((pending) => {
        if (pending) {
          log(`Cold-start message: ${pending.type} — "${pending.title}"`);
          setLocalMessage(pending);
          setIsModalVisible(true);
        } else {
          log('No pending message on cold-start');
        }
      })
      .catch((e) => log(`getPendingMessage error: ${e.message}`));
  }, []);

  // Runtime: listen for new messages via event
  useEffect(() => {
    if (payloadFromEvent) {
      log(`onMessage event: ${payloadFromEvent.type} — "${payloadFromEvent.title}"`);
      log(`  campaignId: ${payloadFromEvent.campaignId}`);
      if (payloadFromEvent.isTestMessage !== undefined) {
        log(`  isTestMessage: ${payloadFromEvent.isTestMessage}`);
      }
      if (Object.keys(payloadFromEvent.data ?? {}).length > 0) {
        log(`  data: ${JSON.stringify(payloadFromEvent.data)}`);
      }
      setLocalMessage(payloadFromEvent);
      setIsModalVisible(true);
    }
  }, [payloadFromEvent]);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <Text style={styles.header}>FIAM Custom Test v1.1</Text>

          {/* Installation ID — needed to register test device in Firebase Console */}
          <Group name="Firebase Installation ID">
            <Text selectable style={styles.idText}>
              {installationId}
            </Text>
            <Text style={styles.hint}>
              Copy this ID and add it in Firebase Console → In-App Messaging → Test on device
            </Text>
          </Group>

          {/* Message controls */}
          <Group name="Message Controls">
            <Button
              title="Suppress Messages"
              onPress={() => {
                ExpoInAppMessaging.setMessagesSuppressed(true);
                log('Messages suppressed');
              }}
            />
            <View style={styles.spacer} />
            <Button
              title="Resume Messages"
              onPress={() => {
                ExpoInAppMessaging.setMessagesSuppressed(false);
                log('Messages resumed');
              }}
            />
          </Group>

          {/* Manual trigger */}
          <Group name="Manual Trigger">
            <Button
              title="Trigger 'teste_manual'"
              onPress={() => {
                ExpoInAppMessaging.triggerEvent('teste_manual');
                log("triggerEvent('teste_manual') called");
              }}
            />
          </Group>

          {/* Last received message */}
          <Group name="Last Message">
            {localMessage ? (
              <View style={styles.messageCard}>
                <Row label="Type" value={localMessage.type} />
                <Row label="Title" value={localMessage.title || '—'} />
                <Row label="Body" value={localMessage.body || '—'} />
                <Row label="Campaign ID" value={localMessage.campaignId || '—'} />
                <Row label="Campaign Name" value={localMessage.campaignName || '—'} />
                {localMessage.isTestMessage !== undefined && (
                  <Row label="Test Message" value={String(localMessage.isTestMessage)} />
                )}
                <Row label="Image URL" value={localMessage.imageUrl ? 'yes' : 'none'} />
                <Row label="Action URL" value={localMessage.actionUrl ? 'yes' : 'none'} />
                <Row
                  label="Custom Data"
                  value={
                    Object.keys(localMessage.data ?? {}).length > 0
                      ? JSON.stringify(localMessage.data)
                      : 'none'
                  }
                />

                <View style={styles.spacer} />
                <Button title="Reopen Modal" onPress={() => setIsModalVisible(true)} />
                <View style={styles.spacer} />
                <Button title="Clear" color="red" onPress={() => setLocalMessage(null)} />
              </View>
            ) : (
              <Text style={styles.emptyText}>Waiting for Firebase message...</Text>
            )}
          </Group>

          {/* Live logs */}
          <Group name="Event Log">
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No events yet</Text>
            ) : (
              logs.map((entry, i) => (
                <Text key={i} style={styles.logEntry}>
                  <Text style={styles.logTime}>{entry.time} </Text>
                  {entry.msg}
                </Text>
              ))
            )}
          </Group>
        </ScrollView>
      </View>

      <CustomIAMModal
        visible={isModalVisible}
        data={localMessage}
        onClose={handleModalClose}
      />
    </>
  );
}

function Group({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{name}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 44 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    color: '#111',
  },
  group: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  spacer: { height: 10 },
  messageCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { fontSize: 12, color: '#888', flex: 1 },
  rowValue: { fontSize: 12, color: '#333', flex: 2, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#bbb', fontSize: 13, paddingVertical: 8 },
  logEntry: { fontSize: 11, color: '#555', paddingVertical: 2, fontFamily: 'monospace' },
  logTime: { color: '#aaa' },
});
