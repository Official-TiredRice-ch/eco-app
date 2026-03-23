import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WishlistScreen() {
  const [wishlistItems] = useState([
    { id: 1, name: 'Wireless Headphones', price: '$79.99', rating: 4.5, reviews: 128, image: '🎧' },
    { id: 2, name: 'Smart Watch', price: '$199.99', rating: 4.8, reviews: 256, image: '⌚' },
    { id: 3, name: 'Phone Case', price: '$19.99', rating: 4.2, reviews: 89, image: '📱' },
    { id: 4, name: 'USB-C Cable', price: '$12.99', rating: 4.6, reviews: 342, image: '🔌' },
    { id: 5, name: 'Screen Protector', price: '$9.99', rating: 4.4, reviews: 156, image: '🛡️' },
    { id: 6, name: 'Portable Charger', price: '$34.99', rating: 4.7, reviews: 203, image: '🔋' },
  ]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Wishlist</ThemedText>
          <ThemedText style={styles.itemCount}>{wishlistItems.length} items saved</ThemedText>
        </ThemedView>
        
        <View style={styles.itemsList}>
          {wishlistItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.wishlistCard}>
              <View style={styles.imageContainer}>
                <ThemedText style={styles.emoji}>{item.image}</ThemedText>
              </View>
              
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <View style={styles.ratingContainer}>
                  <IconSymbol size={14} name="star.fill" color="#FFD700" />
                  <ThemedText style={styles.rating}>{item.rating}</ThemedText>
                  <ThemedText style={styles.reviews}>({item.reviews})</ThemedText>
                </View>
                <ThemedText style={styles.price}>{item.price}</ThemedText>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.heartButton}>
                  <IconSymbol size={20} name="heart.fill" color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton}>
                  <IconSymbol size={20} name="cart.fill" color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  itemsList: {
    gap: 12,
  },
  wishlistCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reviews: {
    fontSize: 12,
    color: '#8E8E93',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  actions: {
    gap: 8,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});