import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Linking, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/search-bar';
import { apiService } from '@/services/api';

interface Product {
  id: number | string;
  name: string;
  price: number;
  description: string;
  rating?: number; // Optional since not all products have ratings
  stock?: number;
  category_name?: string;
  source?: string; // Added source property
  url?: string;
  image_url?: string;
}

interface SearchResult {
  query: string;
  resultCount: number;
  results: Product[];
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const { query: initialQuery } = useLocalSearchParams();
  const [query, setQuery] = useState(initialQuery as string || '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use hybrid search to include online results
      const result = await apiService.get<SearchResult>(
        `/api/search/hybrid?query=${encodeURIComponent(searchQuery)}&includeOnline=true&sortBy=${sortBy}`
      );
      
      console.log('Search results:', result.results?.length);
      console.log('First result:', result.results?.[0]);
      
      setResults(result.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSort = (newSort: string) => {
    setSortBy(newSort);
    performSearch(query);
  };

  const handleViewOnline = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Can't open URL:", url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol size={24} name="chevron.left" color="#007AFF" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>Search</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Results Info */}
          {query && (
            <View style={styles.resultsInfo}>
              <ThemedText style={styles.resultCount}>
                {results.length} results for "{query}"
              </ThemedText>

              {/* Sort Options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
                {[
                  { label: 'Relevance', value: 'relevance' },
                  { label: 'Price: Low', value: 'price_asc' },
                  { label: 'Price: High', value: 'price_desc' },
                  { label: 'Newest', value: 'newest' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortButton,
                      sortBy === option.value && styles.sortButtonActive,
                    ]}
                    onPress={() => handleSort(option.value)}>
                    <ThemedText
                      style={[
                        styles.sortButtonText,
                        sortBy === option.value && styles.sortButtonTextActive,
                      ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.centerContainer}>
              <IconSymbol size={32} name="magnifyingglass" color="#007AFF" />
              <ThemedText style={styles.loadingText}>Searching...</ThemedText>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.centerContainer}>
              <IconSymbol size={32} name="exclamationmark.circle.fill" color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && query && results.length === 0 && (
            <View style={styles.centerContainer}>
              <IconSymbol size={48} name="magnifyingglass" color="#8E8E93" />
              <ThemedText style={styles.emptyText}>No products found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Try a different search term</ThemedText>
            </View>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <View style={styles.resultsContainer}>
              {/* Local Products Section */}
              {results.filter(p => p.source === 'local').length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol size={18} name="house.fill" color="#007AFF" />
                    <Text style={styles.sectionTitle}>
                      Available in Store ({results.filter(p => p.source === 'local').length})
                    </Text>
                  </View>
                  <View style={styles.localProductsContainer}>
                    {results.filter(p => p.source === 'local').map((product, index) => (
                      <TouchableOpacity 
                        key={`${product.source}-${product.id}-${index}`} 
                        style={styles.localProductCard}>
                        <View style={styles.localProductImage}>
                          {product.image_url ? (
                            <Image 
                              source={{ uri: product.image_url }} 
                              style={styles.productImageFull}
                              resizeMode="cover"
                              onError={(e) => console.log('Image load error:', product.image_url, e.nativeEvent.error)}
                              onLoad={() => console.log('Image loaded:', product.image_url)}
                            />
                          ) : (
                            <IconSymbol size={40} name="cube.box.fill" color="#007AFF" />
                          )}
                        </View>
                        <View style={styles.localProductInfo}>
                          <View style={styles.localBadge}>
                            <IconSymbol size={10} name="checkmark.circle.fill" color="#34C759" />
                            <Text style={styles.localBadgeText}>In Stock</Text>
                          </View>
                          <Text style={styles.localProductName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text style={styles.localProductDesc} numberOfLines={2}>
                            {product.description}
                          </Text>
                          <View style={styles.localPriceRow}>
                            <Text style={styles.localPrice}>₱{product.price.toFixed(2)}</Text>
                            {product.stock !== undefined && (
                              <Text style={styles.localStock}>Stock: {product.stock}</Text>
                            )}
                          </View>
                          <TouchableOpacity style={styles.localAddButton}>
                            <IconSymbol size={16} name="cart.fill" color="#FFFFFF" />
                            <Text style={styles.localAddButtonText}>Add to Cart</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Online Products Section */}
              {results.filter(p => p.source !== 'local').length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol size={18} name="globe" color="#FF9500" />
                    <Text style={styles.sectionTitle}>
                      Found Online ({results.filter(p => p.source !== 'local').length})
                    </Text>
                  </View>
                  <View style={styles.onlineProductsGrid}>
                    {results.filter(p => p.source !== 'local').map((product, index) => (
                      <TouchableOpacity 
                        key={`${product.source}-${product.id}-${index}`} 
                        style={styles.onlineProductCard}
                        onPress={() => product.url && handleViewOnline(product.url)}>
                        <View style={styles.onlineHeader}>
                          <View style={[
                            styles.onlineSourceBadge,
                            product.source === 'google' && styles.googleBadge,
                            product.source === 'shopee' && styles.shopeeBadge,
                            product.source === 'lazada' && styles.lazadaBadge,
                            product.source === 'kimstore' && styles.kimstoreBadge,
                          ]}>
                            <IconSymbol 
                              size={12} 
                              name={
                                product.source === 'google' ? 'magnifyingglass' :
                                product.source === 'shopee' ? 'bag.fill' :
                                product.source === 'kimstore' ? 'storefront.fill' :
                                'cart.fill'
                              } 
                              color="#FFFFFF" 
                            />
                            <Text style={styles.onlineSourceText}>
                              {product.source?.toUpperCase()}
                            </Text>
                          </View>
                          <IconSymbol size={14} name="arrow.up.right" color="#8E8E93" />
                        </View>
                        <View style={styles.onlineProductImage}>
                          {product.image_url ? (
                            <Image 
                              source={{ uri: product.image_url }} 
                              style={styles.productImageFull}
                              resizeMode="cover"
                              onError={(e) => console.log('Online image error:', product.image_url, e.nativeEvent.error)}
                              onLoad={() => console.log('Online image loaded:', product.image_url)}
                            />
                          ) : (
                            <IconSymbol size={28} name="link" color="#8E8E93" />
                          )}
                        </View>
                        <Text style={styles.onlineProductName} numberOfLines={2}>
                          {product.name}
                        </Text>
                        {product.description && (
                          <Text style={styles.onlineProductDesc} numberOfLines={1}>
                            {product.description}
                          </Text>
                        )}
                        {product.price > 0 && (
                          <Text style={styles.onlinePrice}>₱{product.price.toFixed(2)}</Text>
                        )}
                        <TouchableOpacity 
                          style={styles.onlineViewButton}
                          onPress={() => product.url && handleViewOnline(product.url)}>
                          <Text style={styles.onlineViewButtonText}>View Online</Text>
                          <IconSymbol size={12} name="arrow.right" color="#007AFF" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  resultsInfo: {
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    fontWeight: '500',
  },
  sortContainer: {
    marginBottom: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    color: '#FF3B30',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  
  // RESULTS CONTAINER
  resultsContainer: {
    gap: 20,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // Changed to white for dark background
  },
  localProductsContainer: {
    gap: 12,
  },
  onlineProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  // LOCAL PRODUCT CARD STYLES - Premium Design
  localProductCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  localProductImage: {
    width: 80,
    height: 80,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  productImageFull: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  localProductInfo: {
    flex: 1,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  localBadgeText: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '700',
  },
  localProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  localProductDesc: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 16,
  },
  localPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  localPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#007AFF',
  },
  localStock: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  localAddButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  localAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // ONLINE PRODUCT CARD STYLES - External Link Design
  onlineProductCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  onlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  googleBadge: {
    backgroundColor: '#4285F4',
  },
  shopeeBadge: {
    backgroundColor: '#EE4D2D',
  },
  lazadaBadge: {
    backgroundColor: '#0F156D',
  },
  kimstoreBadge: {
    backgroundColor: '#FF6B6B',
  },
  onlineSourceText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  onlineProductImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  onlineProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 16,
  },
  onlineProductDesc: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 6,
  },
  onlinePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9500',
    marginBottom: 8,
  },
  onlineViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  onlineViewButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 11,
  },

  // OLD STYLES (REMOVED)
  productCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  productImage: {
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: '#8E8E93',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  sourceTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
