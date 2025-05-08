import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function FavoritesScreen({ session }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchFavorites = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('favorites')
      .select('*, catering_services(*, sellers(business_name))')
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load favorites.');
    } else {
      setFavorites(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchFavorites);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const service = item.catering_services;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('CustomerBookingScreen', {
            service,
            session,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{service.title}</Text>
          <Ionicons name="heart" size={24} color="#E15554" />
        </View>
        <Text style={styles.cardDescription}>{service.description}</Text>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={16} color="#8B4513" />
            <Text style={styles.detailText}>${service.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="business-outline" size={16} color="#8B4513" />
            <Text style={styles.detailText}>{service.sellers?.business_name}</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{service.category}</Text>
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
          <Text style={styles.headerTitle}>My Favorites</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color="#D4A373" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon to add services</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
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
  headerRightPlaceholder: {
    width: 28,
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