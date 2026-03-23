import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          <ThemedText style={styles.menuItem}>Personal Information</ThemedText>
          <ThemedText style={styles.menuItem}>Order History</ThemedText>
          <ThemedText style={styles.menuItem}>Payment Methods</ThemedText>
          <ThemedText style={styles.menuItem}>Shipping Addresses</ThemedText>
          <ThemedText style={styles.menuItem}>Notifications</ThemedText>
          <ThemedText style={styles.menuItem}>Help & Support</ThemedText>
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
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    borderRadius: 8,
  },
});