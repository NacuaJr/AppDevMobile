import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function CustomerBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getUserAndBookings();
  }, []);

  const getUserAndBookings = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return;

    setUserId(user.id);
    fetchBookings(user.id);
  };

  const fetchBookings = async (id) => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, booking_date, status, special_requests, catering_services(title, price), sellers(business_name), reviews(id)'
      )
      .eq('customer_id', id)
      .order('booking_date', { ascending: false });

    if (!error) setBookings(data);
    setRefreshing(false);
    setLoading(false);
  };

  const cancelBooking = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) return Alert.alert('Error', 'Could not cancel booking.');
    fetchBookings(userId);
  };

  const markAsFinished = async (id) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) return Alert.alert('Error', 'Could not mark as finished.');
    fetchBookings(userId);
  };

  const handleCancel = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return Alert.alert('Unavailable', 'This booking can no longer be cancelled.');
    }

    Alert.alert(
      'Confirm Cancel',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No' },
        { text: 'Yes', onPress: () => cancelBooking(booking.id) },
      ]
    );
  };

  const handleReview = (booking) => {
    navigation.navigate('SubmitReviewScreen', { booking });
  };

  const isBookingDatePastOrToday = (date) => {
    const today = new Date();
    const bookingDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate <= today;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FF8C42';
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#E15554';
      default: return '#5A3921';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.catering_services?.title}</Text>
        <Text style={styles.cardPrice}>${item.catering_services?.price}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color="#8B4513" />
        <Text style={styles.detailText}>
          {new Date(item.booking_date).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="business-outline" size={16} color="#8B4513" />
        <Text style={styles.detailText}>{item.sellers?.business_name}</Text>
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>

      {item.special_requests && (
        <View style={styles.requestsContainer}>
          <Text style={styles.requestsLabel}>Special Requests:</Text>
          <Text style={styles.requestsText}>{item.special_requests}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'confirmed' && isBookingDatePastOrToday(item.booking_date) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.finishButton]}
            onPress={() => markAsFinished(item.id)}
          >
            <Text style={styles.buttonText}>Mark as Finished</Text>
          </TouchableOpacity>
        )}

        {(item.status === 'pending' ||
          (item.status === 'confirmed' && !isBookingDatePastOrToday(item.booking_date))) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancel(item)}
          >
            <Text style={styles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {item.status === 'completed' && !item.reviews?.id && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => handleReview(item)}
          >
            <Text style={styles.buttonText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Booking History</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#D4A373" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Your upcoming bookings will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={() => fetchBookings(userId)}
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
  cardPrice: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#8B4513',
    fontSize: 14,
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestsContainer: {
    marginTop: 10,
    marginBottom: 12,
  },
  requestsLabel: {
    color: '#5A3921',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestsText: {
    color: '#7A5C3C',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E15554',
  },
  finishButton: {
    backgroundColor: '#2196F3',
  },
  reviewButton: {
    backgroundColor: '#FF8C42',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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