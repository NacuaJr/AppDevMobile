// screens/SellerBookingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function SellerBookingsScreen() {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
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
  };

  const updateBookingStatus = async (bookingId, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) fetchBookings();
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
          <Ionicons name="arrow-back" size={28} color="white" />
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
            <Text style={styles.filterText}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredBookings.length === 0 ? (
        <Text style={styles.noText}>No bookings found.</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.customers.full_name} booked {item.catering_services.title}
              </Text>
              <Text style={styles.cardText}>
                Date: {new Date(item.booking_date).toLocaleString()}
              </Text>
              <Text style={styles.cardText}>Status: {item.status}</Text>

              {item.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: 'green' }]}
                    onPress={() => updateBookingStatus(item.id, 'confirmed')}
                  >
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: 'red' }]}
                    onPress={() => updateBookingStatus(item.id, 'cancelled')}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    marginLeft: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: 'white',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardText: {
    color: 'white',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
