import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CategoriesScreen() {
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Beauty & Health',
    'Toys & Games',
    'Automotive',
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Categories</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <ThemedView key={index} style={styles.categoryCard}>
              <ThemedText style={styles.categoryText}>{category}</ThemedText>
            </ThemedView>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});