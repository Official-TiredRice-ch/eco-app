import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { apiService } from '@/services/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, onSuggestionSelect, placeholder = 'Search products...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const result = await apiService.get<{ suggestions: string[] }>(
          `/api/search/suggestions?query=${encodeURIComponent(query)}&limit=5`
        );
        setSuggestions(result.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Suggestions error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    onSearch(searchQuery);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <IconSymbol size={20} name="magnifyingglass" color="#8E8E93" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          editable={true}
          selectTextOnFocus={true}
          clearButtonMode="never"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol size={20} name="xmark.circle.fill" color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}>
                <IconSymbol size={16} name="magnifyingglass" color="#007AFF" />
                <ThemedText style={styles.suggestionText}>{item}</ThemedText>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    padding: 0,
    margin: 0,
    minHeight: 20,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    zIndex: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
});
