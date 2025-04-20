import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function CustomerDashboard({ session }) {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const categories = ['All', 'Buffet', 'Plated', 'Drinks', 'Casual'];

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
      query = query.eq('category', filteredCategory);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

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
        <Text
          style={[
            styles.categoryText,
            filteredCategory === cat && { color: 'black' }, // readable on white background
          ]}
        >
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
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          {/* <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? 'red' : 'white'}
          />

          </TouchableOpacity> */}
        </View>
        <Text style={styles.text}>{item.description}</Text>
        <Text style={styles.text}>Price: ${item.price}</Text>
        <Text style={styles.text}>Category: {item.category}</Text>
        <Text style={styles.text}>Provider: {item.sellers?.business_name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Services</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('CustomerBookingHistory')}
          >
            <Ionicons name="calendar-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Ionicons name="person-circle-outline" size={26} color="white" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('FavoritesScreen')}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity> */}
        </View>
      </View>

      {renderCategoryFilter()}

      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill the screen
    backgroundColor: 'black', // ⚫ Background
    paddingHorizontal: 16, // Padding on sides
    paddingTop: 50, // Padding from top
  },
  header: {
    flexDirection: 'row', // Row layout
    justifyContent: 'space-between', // Space between title & icons
    alignItems: 'center', // Vertically center
    marginBottom: 10, // Space below header
  },
  headerTitle: {
    color: 'white', // ⚪ Text
    fontSize: 20, // Large title
    fontWeight: 'bold', // Emphasis
  },
  headerButtons: {
    flexDirection: 'row', // Side by side icons
    gap: 12, // Space between buttons
  },
  headerIcon: {
    marginLeft: 10, // Spacing between icons
  },
  card: {
    backgroundColor: '#1a1a1a', // Slightly lighter than black
    padding: 16, // Inner spacing
    borderRadius: 12, // Rounded corners
    marginBottom: 12, // Space between cards
  },
  title: {
    color: 'white', // ⚪ Text
    fontSize: 18, // Title size
    fontWeight: 'bold', // Emphasis
  },
  text: {
    color: 'white', // ⚪ Info text
    marginTop: 4, // Space between lines
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: 'row', // Title and heart icon
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  categoryButton: {
    backgroundColor: '#2a2a2a', // Slightly different shade
    paddingHorizontal: 10, // Inner spacing
    paddingVertical: 4,
    borderRadius: 16, // Rounded pills
  },
  activeCategory: {
    backgroundColor: 'white', // Active button
  },
  categoryText: {
    color: 'white', // Text inside category pills
    fontSize: 12, // 👈 smaller size
  },
});
