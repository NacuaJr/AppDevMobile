import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function CustomerBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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
        'id, booking_date, status, special_requests, catering_services(title), reviews(id)'
      )
      .eq('customer_id', id)
      .order('booking_date', { ascending: false });

    if (!error) setBookings(data);
    setRefreshing(false);
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.catering_services?.title}</Text>
      <Text style={styles.date}>
        📅 {new Date(item.booking_date).toLocaleString()}
      </Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.requests}>
        Requests: {item.special_requests || 'None'}
      </Text>

      {item.status === 'confirmed' && isBookingDatePastOrToday(item.booking_date) && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => markAsFinished(item.id)}
        >
          <Text style={styles.reviewText}>Mark as Finished</Text>
        </TouchableOpacity>
      )}

      {(item.status === 'pending' ||
        (item.status === 'confirmed' && !isBookingDatePastOrToday(item.booking_date))) && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item)}
        >
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && !item.reviews?.id && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => handleReview(item)}
        >
          <Text style={styles.reviewText}>Leave a Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={() => fetchBookings(userId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  date: {
    fontSize: 14,
    color: 'black',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    color: 'black',
  },
  requests: {
    fontSize: 14,
    color: 'black',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
