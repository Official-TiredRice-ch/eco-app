import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Personal Information</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Order History</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Payment Methods</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Shipping Addresses</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Notifications</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <ThemedText style={styles.menuItemText}>Help & Support</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  menuItem: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
});