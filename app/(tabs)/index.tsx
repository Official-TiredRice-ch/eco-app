import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const featuredProducts = [
    { id: 1, name: 'Electronics', icon: 'bolt.fill', color: '#FF6B6B' },
    { id: 2, name: 'Fashion', icon: 'bag.fill', color: '#4ECDC4' },
    { id: 3, name: 'Home', icon: 'house.fill', color: '#45B7D1' },
    { id: 4, name: 'Sports', icon: 'dumbbell.fill', color: '#FFA07A' },
  ];

  const promotions = [
    { id: 1, title: 'Summer Sale', discount: '50% OFF', icon: 'tag.fill' },
    { id: 2, title: 'Free Shipping', discount: 'On Orders $50+', icon: 'truck.box.fill' },
    { id: 3, title: 'New Arrivals', discount: 'Check Now', icon: 'star.fill' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header with Search */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            EcoApp
          </ThemedText>
          <TouchableOpacity style={styles.searchBar}>
            <IconSymbol size={20} name="magnifyingglass" color="#8E8E93" />
            <ThemedText style={styles.searchPlaceholder}>Search products...</ThemedText>
          </TouchableOpacity>
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

        {/* Featured Categories */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Featured Categories
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.categoryCard, { borderLeftColor: product.color }]}>
                <View style={[styles.iconContainer, { backgroundColor: product.color }]}>
                  <IconSymbol size={32} name={product.icon as any} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.categoryName}>{product.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Best Sellers */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Best Sellers
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.viewAll}>View All</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <View style={styles.productsList}>
            {[1, 2, 3].map((item) => (
              <TouchableOpacity key={item} style={styles.productCard}>
                <View style={styles.productImage}>
                  <IconSymbol size={40} name="star.fill" color="#FFD700" />
                </View>
                <ThemedText style={styles.productName}>Product {item}</ThemedText>
                <ThemedText style={styles.productPrice}>$99.99</ThemedText>
                <View style={styles.ratingContainer}>
                  <IconSymbol size={14} name="star.fill" color="#FFD700" />
                  <ThemedText style={styles.rating}>4.5 (120)</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#8E8E93',
    fontSize: 14,
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
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1C1C1E',
  },
  productsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '31%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1C1C1E',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 11,
    color: '#8E8E93',
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