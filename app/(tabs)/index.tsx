import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BackendStatus } from '@/components/backend-status';
import { SearchBar } from '@/components/search-bar';
import { apiService } from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  category_name?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const categories = [
    { name: 'Electronics', search: 'laptop' },
    { name: 'Home & Garden', search: 'sofa' },
    { name: 'Fashion', search: 'jacket' },
    { name: 'Sports & Outdoors', search: 'yoga' },
    { name: 'Books', search: 'book' },
    { name: 'Beauty & Health', search: 'skincare' }
  ];

  const promotions = [
    { id: 1, title: 'Summer Sale', discount: '50% OFF', icon: 'tag.fill' },
    { id: 2, title: 'Free Shipping', discount: 'On Orders $50+', icon: 'truck.box.fill' },
    { id: 3, title: 'New Arrivals', discount: 'Check Now', icon: 'star.fill' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Rotate categories every 3 seconds
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update featured products when category changes
    if (allProducts.length > 0) {
      updateFeaturedProducts();
    }
  }, [currentCategoryIndex, allProducts]);

  const loadProducts = async () => {
    try {
      console.log('🔄 Loading products...');
      setLoading(true);
      const productsRes = await apiService.get('/api/products?limit=50&in_stock=true');
      

      if (productsRes && (productsRes as any).products) {
        const products = (productsRes as any).products;
        console.log('✅ Found products:', products.length);
        setAllProducts(products);
        setBestsellers(products.slice(0, 6));
        updateFeaturedProducts(products, 0);
      } else {
        console.log('❌ No products in response');
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      setLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const updateFeaturedProducts = (products?: Product[], categoryIndex?: number) => {
    const prods = products || allProducts;
    const catIndex = categoryIndex !== undefined ? categoryIndex : currentCategoryIndex;
    const currentCategory = categories[catIndex];
    
    // Filter products by search term
    const filtered = prods.filter(p => 
      p.name.toLowerCase().includes(currentCategory.search.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(currentCategory.name.toLowerCase()))
    );
    
    // If we have filtered products, use them; otherwise use any 4 products
    const productsToShow = filtered.length >= 4 ? filtered.slice(0, 4) : prods.slice(catIndex * 4, catIndex * 4 + 4);
    setFeaturedProducts(productsToShow);
    console.log(`🎯 Updated featured for ${currentCategory.name}:`, productsToShow.length, 'products');
  };

  const handleSearch = (query: string) => {
    router.push({
      pathname: '/search-results',
      params: { query }
    });
  };

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Backend Status */}
        <BackendStatus />

        {/* Header with Search */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            EcoApp
          </ThemedText>
          <SearchBar onSearch={handleSearch} />
        </ThemedView>

        {/* Promotions Banner */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promotionsContainer}>
          {promotions.map((promo) => (
            <TouchableOpacity key={promo.id} style={styles.promotionCard}>
              <IconSymbol size={24} name={promo.icon as any} color="#007AFF" />
              <ThemedText style={styles.promoTitle}>{promo.title}</ThemedText>
              <ThemedText style={styles.promoDiscount}>{promo.discount}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Category - Rotating */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.categoryHeaderContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {categories[currentCategoryIndex].name}
            </ThemedText>
            <View style={styles.categoryIndicator}>
              {categories.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentCategoryIndex && styles.indicatorDotActive
                  ]}
                />
              ))}
            </View>
          </ThemedView>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : featuredProducts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#8E8E93', padding: 20 }}>
              No products available
            </Text>
          ) : (
            <View style={styles.categoriesGrid}>
              {featuredProducts.slice(0, 4).map((product, index) => (
                <TouchableOpacity
                  key={`${product.id}-${currentCategoryIndex}-${index}`}
                  style={styles.featuredCard}>
                  {product.image_url ? (
                    <Image source={{ uri: product.image_url }} style={styles.featuredImage} />
                  ) : (
                    <View style={styles.featuredImagePlaceholder}>
                      <IconSymbol size={32} name="bolt.fill" color="#007AFF" />
                    </View>
                  )}
                  <Text style={styles.featuredName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.featuredPrice}>{formatPrice(product.price)}</Text>
                  {product.stock > 0 && (
                    <Text style={styles.featuredStock}>In Stock: {product.stock}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Best Sellers */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Best Sellers
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/all-products')}>
              <ThemedText style={styles.viewAll}>View All</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : bestsellers.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#8E8E93', padding: 20 }}>
              No products available
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.productsList}>
                {bestsellers.map((product) => (
                  <TouchableOpacity key={product.id} style={styles.productCard}>
                    {product.image_url ? (
                      <Image source={{ uri: product.image_url }} style={styles.productImage} />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <IconSymbol size={40} name="star.fill" color="#FFD700" />
                      </View>
                    )}
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    {product.category_name && (
                      <Text style={styles.productCategory}>{product.category_name}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </ThemedView>

        {/* Special Offers */}
        <ThemedView style={styles.specialOfferContainer}>
          <IconSymbol size={48} name="gift.fill" color="#007AFF" />
          <ThemedText type="subtitle" style={styles.offerTitle}>
            Special Offer
          </ThemedText>
          <ThemedText style={styles.offerText}>
            Get 20% off on your first purchase
          </ThemedText>
          <TouchableOpacity style={styles.offerButton}>
            <ThemedText style={styles.offerButtonText}>Claim Now</ThemedText>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#007AFF',
  },
  promotionsContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  promotionCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0056CC',
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  promoDiscount: {
    fontSize: 12,
    color: '#E8F4FF',
    fontWeight: '700',
    marginTop: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryHeaderContainer: {
    marginBottom: 12,
  },
  categoryIndicator: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1D6',
  },
  indicatorDotActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  viewAll: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuredCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1C1C1E',
    minHeight: 36,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  featuredStock: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '500',
  },
  productsList: {
    flexDirection: 'row',
    gap: 12,
  },
  productCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
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
    marginBottom: 4,
    color: '#1C1C1E',
    minHeight: 36,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  specialOfferContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0056CC',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  offerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#E8F4FF',
  },
  offerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  offerButtonText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 14,
  },
});