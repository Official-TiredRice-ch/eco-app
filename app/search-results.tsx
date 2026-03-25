import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/search-bar';
import { apiService } from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  rating: number;
  stock: number;
  category_name: string;
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
      const result = await apiService.get<SearchResult>(
        `/api/search/products?query=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`
      );
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
            <View style={styles.resultsGrid}>
              {results.map((product) => (
                <TouchableOpacity key={product.id} style={styles.productCard}>
                  <View style={styles.productImage}>
                    <IconSymbol size={32} name="star.fill" color="#FFD700" />
                  </View>
                  <ThemedText style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </ThemedText>
                  <View style={styles.ratingContainer}>
                    <IconSymbol size={12} name="star.fill" color="#FFD700" />
                    <ThemedText style={styles.rating}>{product.rating || 'N/A'}</ThemedText>
                  </View>
                  <ThemedText style={styles.price}>₱{product.price.toFixed(2)}</ThemedText>
                  <TouchableOpacity style={styles.addButton}>
                    <IconSymbol size={16} name="cart.fill" color="#FFFFFF" />
                    <ThemedText style={styles.addButtonText}>Add</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
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
  resultsGrid: {
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
