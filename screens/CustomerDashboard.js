import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function CustomerDashboard({ session }) {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCategory, setFilteredCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);

  const categories = ['All', 'Wedding', 'Corporate', 'Birthday', 'Casual'];

  const getCustomerId = async () => {
    const user = session?.user;
    if (!user) return null;
  
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
  
    if (error) {
      console.error('Error getting customer ID:', error);
      return null;
    }
  
    return data.id;
  };
  
  const fetchFavorites = async () => {
    const customerId = await getCustomerId();
    if (!customerId) return;
  
    const { data, error } = await supabase
      .from('favorites')
      .select('service_id')
      .eq('customer_id', customerId);
  
    if (error) {
      console.error('Favorite fetch error:', error);
      return;
    }
  
    setFavoriteIds(data.map((item) => item.service_id));
  };
  
  const fetchServices = async () => {
    setLoading(true);
    let query = supabase
      .from('catering_services')
      .select('*, sellers(business_name)')
      .order('created_at', { ascending: false });

    if (filteredCategory && filteredCategory !== 'All') {
      query = query.eq('category', filteredCategory.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      Alert.alert('Error', 'Failed to load services.');
      console.error(error);
    } else {
      setServices(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    fetchFavorites();
  }, [filteredCategory]);

  const toggleFavorite = async (serviceId) => {
    const customerId = await getCustomerId();
    if (!customerId) return;
  
    const isFavorited = favoriteIds.includes(serviceId);
  
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('customer_id', customerId)
        .eq('service_id', serviceId);
    } else {
      await supabase.from('favorites').insert([
        {
          customer_id: customerId,
          service_id: serviceId,
        },
      ]);
    }
  
    fetchFavorites();
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterRow}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryButton,
            filteredCategory === cat && styles.activeCategory,
          ]}
          onPress={() => setFilteredCategory(cat)}
        >
          <Text style={[
            styles.categoryText,
            filteredCategory === cat && styles.activeCategoryText,
          ]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('CustomerBookingScreen', {
            service: item,
            session,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#E15554' : '#D4A373'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#8B4513" />
            <Text style={styles.detailText}>${item.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="business-outline" size={16} color="#8B4513" />
            <Text style={styles.detailText}>{item.sellers?.business_name}</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Services</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Ionicons name="person-circle-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CustomerBookingHistory')}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FavoritesScreen')}
          >
            <Ionicons name="heart-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {renderCategoryFilter()}

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fast-food-outline" size={60} color="#D4A373" />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Try changing your filters</Text>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#FF6B35',
    marginHorizontal: -16,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF8C42',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#FFE5D4',
  },
  activeCategory: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    color: '#5A3921',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  activeCategoryText: {
    color: '#FFF',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#FF8C42',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#5A3921',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    color: '#7A5C3C',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#8B4513',
    fontSize: 14,
    marginLeft: 5,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5D4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#8B4513',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: '#5A3921',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    color: '#8B4513',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});