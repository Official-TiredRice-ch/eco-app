import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CategoriesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Electronics', color: '#FF6B6B', icon: 'bolt.fill', products: 245 },
    { name: 'Fashion', color: '#4ECDC4', icon: 'bag.fill', products: 512 },
    { name: 'Home & Garden', color: '#45B7D1', icon: 'house.fill', products: 389 },
    { name: 'Sports & Outdoors', color: '#FFA07A', icon: 'dumbbell.fill', products: 178 },
    { name: 'Books', color: '#95E1D3', icon: 'book.fill', products: 1203 },
    { name: 'Beauty & Health', color: '#F38181', icon: 'heart.fill', products: 456 },
    { name: 'Toys & Games', color: '#AA96DA', icon: 'gamecontroller.fill', products: 234 },
    { name: 'Automotive', color: '#FCBAD3', icon: 'car.fill', products: 167 },
  ];

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to search-results with category name as query
    router.push({
      pathname: '/search-results',
      params: { query: categoryName }
    });
  };

  const categoryProducts = {
    'Electronics': [
      { id: 1, name: 'Wireless Headphones', price: '$79.99', rating: 4.5 },
      { id: 2, name: 'Smart Watch', price: '$199.99', rating: 4.8 },
      { id: 3, name: 'USB-C Cable', price: '$12.99', rating: 4.6 },
    ],
    'Fashion': [
      { id: 1, name: 'Cotton T-Shirt', price: '$29.99', rating: 4.4 },
      { id: 2, name: 'Denim Jeans', price: '$59.99', rating: 4.7 },
      { id: 3, name: 'Casual Sneakers', price: '$89.99', rating: 4.5 },
    ],
    'Home & Garden': [
      { id: 1, name: 'LED Lamp', price: '$34.99', rating: 4.6 },
      { id: 2, name: 'Plant Pot', price: '$19.99', rating: 4.3 },
      { id: 3, name: 'Wall Clock', price: '$24.99', rating: 4.5 },
    ],
  };

  if (selectedCategory) {
    const products = categoryProducts[selectedCategory as keyof typeof categoryProducts] || [];
    const category = categories.find(c => c.name === selectedCategory);

    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}>
            <IconSymbol size={24} name="chevron.left" color="#007AFF" />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>

          {/* Category Header */}
          <View style={[styles.categoryHeader, { backgroundColor: category?.color }]}>
            <IconSymbol size={48} name={category?.icon as any} color="#FFFFFF" />
            <ThemedText style={styles.categoryHeaderTitle}>{selectedCategory}</ThemedText>
            <ThemedText style={styles.productCount}>{category?.products} products</ThemedText>
          </View>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                <View style={styles.productImagePlaceholder}>
                  <IconSymbol size={32} name="star.fill" color="#FFD700" />
                </View>
                <ThemedText style={styles.productName}>{product.name}</ThemedText>
                <View style={styles.productRating}>
                  <IconSymbol size={12} name="star.fill" color="#FFD700" />
                  <ThemedText style={styles.productRatingText}>{product.rating}</ThemedText>
                </View>
                <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                <TouchableOpacity style={styles.addToCartBtn}>
                  <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Categories</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.categoryCard, { backgroundColor: category.color }]}
              onPress={() => handleCategoryPress(category.name)}>
              <IconSymbol size={32} name={category.icon as any} color="#FFFFFF" />
              <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
              <ThemedText style={styles.categoryProducts}>{category.products} items</ThemedText>
            </TouchableOpacity>
          ))}
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 12,
  },
  categoryProducts: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  categoryHeader: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  productCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  productRatingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  addToCartBtn: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
});