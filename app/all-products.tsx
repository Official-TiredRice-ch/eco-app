import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiService } from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  category_name?: string;
  category_id?: number;
}

export default function AllProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const productsRes = await apiService.get('/api/products?limit=100&in_stock=true');

      if (productsRes && (productsRes as any).products) {
        setProducts((productsRes as any).products);
      }
    } catch (error) {
      console.error('Error loading all products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return '#007AFF';
    const colors: { [key: string]: string } = {
      'Laptops': '#FF6B6B',
      'Smartphones': '#4ECDC4',
      'Electronics': '#45B7D1',
      'Home & Garden': '#96CEB4',
      'Fashion': '#FFEAA7',
      'Sports & Outdoors': '#74B9FF',
      'Books': '#A29BFE',
      'Beauty & Health': '#FD79A8'
    };
    return colors[categoryName] || '#007AFF';
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard}>
                {product.image_url ? (
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <IconSymbol size={32} name="photo" color="#C7C7CC" />
                  </View>
                )}
                
                {/* Category Label */}
                {product.category_name && (
                  <View style={[styles.categoryLabel, { backgroundColor: getCategoryColor(product.category_name) }]}>
                    <Text style={styles.categoryLabelText}>{product.category_name}</Text>
                  </View>
                )}

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  
                  <View style={styles.stockContainer}>
                    <IconSymbol size={12} name="checkmark.circle.fill" color="#34C759" />
                    <Text style={styles.stockText}>In Stock: {product.stock}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {products.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconSymbol size={64} name="tray" color="#C7C7CC" />
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
