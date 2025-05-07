// screens/SellerBookingsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function SellerBookingsScreen() {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customers ( full_name ),
        catering_services ( title )
      `)
      .eq('seller_id', user.id)
      .order('booking_date', { ascending: false });

    const { data, error } = await query;
    if (!error) setBookings(data);
    setLoading(false);
  };

  const confirmStatusChange = (bookingId, newStatus) => {
    Alert.alert(
      `Change status to "${newStatus}"?`,
      `Are you sure you want to mark this booking as "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => updateBookingStatus(bookingId, newStatus) },
      ]
    );
  };

  const updateBookingStatus = async (bookingId, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#333';
    }
  };

  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#5D4037" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Seller Bookings</Text>
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.activeFilter,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text style={[
              styles.filterText,
              filter === status && styles.activeFilterText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8D6E63" style={{ marginTop: 40 }} />
      ) : filteredBookings.length === 0 ? (
        <Text style={styles.noText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.customers.full_name} booked <Text style={styles.serviceText}>{item.catering_services.title}</Text>
              </Text>
              <Text style={styles.cardText}>
                Date: {new Date(item.booking_date).toLocaleString()}
              </Text>
              <Text style={[styles.cardText, { color: getStatusColor(item.status) }]}>
                Status: {item.status}
              </Text>

              {item.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => confirmStatusChange(item.id, 'confirmed')}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                    onPress={() => confirmStatusChange(item.id, 'cancelled')}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchBookings}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingTop: 30,  // Increased top padding
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#5D4037',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#D7CCC8',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#5D4037',
  },
  filterText: {
    color: '#5D4037',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: 'white',
  },
  noText: {
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFE0B2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    color: '#5D4037',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceText: {
    color: '#BF360C',
  },
  cardText: {
    color: '#5D4037',
    fontSize: 14,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
