import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WishlistScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Wishlist</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.emptyWishlist}>
          <ThemedText style={styles.emptyText}>Your wishlist is empty</ThemedText>
          <ThemedText style={styles.emptySubtext}>Save your favorite items here!</ThemedText>
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
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
});