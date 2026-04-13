import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useApiContext } from '@/context/api-context';

export function BackendStatus() {
  const { baseUrl, isConnected, isLoading, error, reconnect } = useApiContext();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <IconSymbol size={16} name="bolt.fill" color="#FFA500" />
        <ThemedText style={styles.text}>Connecting...</ThemedText>
      </View>
    );
  }

  if (isConnected) {
    return (
      <TouchableOpacity style={[styles.container, styles.connected]} onPress={reconnect}>
        <IconSymbol size={16} name="checkmark.circle.fill" color="#34C759" />
        <ThemedText style={styles.text}>Connected</ThemedText>
        <ThemedText style={styles.url}>{baseUrl}</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.container, styles.error]} onPress={reconnect}>
      <IconSymbol size={16} name="exclamationmark.circle.fill" color="#FF3B30" />
      <ThemedText style={styles.text}>Tap to Reconnect</ThemedText>
      {error && <ThemedText style={styles.errorMsg} numberOfLines={2}>{error.message}</ThemedText>}
      <ThemedText style={styles.helpText}>Backend: 192.168.1.30:24365</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  loading: {
    backgroundColor: '#FFF3E0',
  },
  connected: {
    backgroundColor: '#E8F5E9',
  },
  error: {
    backgroundColor: '#FFEBEE',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  url: {
    fontSize: 10,
    opacity: 0.7,
  },
  errorMsg: {
    fontSize: 10,
    color: '#FF3B30',
    marginTop: 4,
  },
  helpText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});
