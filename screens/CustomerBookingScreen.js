import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';
import BookingDateSelector from '../screens/BookingDateSelector'; // Import your reusable component

export default function CustomerBookingScreen({ route, navigation }) {
  const { service, session } = route.params;
  const [bookingDate, setBookingDate] = useState(null); // Store selected date
  const [specialRequests, setSpecialRequests] = useState('');

  const handleBooking = async () => {
    if (!bookingDate) {
      return Alert.alert('Error', 'Please select a booking date.');
    }
  
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  
    if (bookingDate < now) {
      return Alert.alert('Invalid Date', 'Booking date cannot be in the past.');
    }
  
    if (bookingDate < threeHoursFromNow) {
      return Alert.alert(
        'Too Soon',
        'Please book at least 1 hour in advance.'
      );
    }
  
    // Fetch the current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
  
    const customerId = user?.id;
    if (authError || !customerId) {
      console.error(authError);
      return Alert.alert('Error', 'User not logged in.');
    }
  
    // Confirm this is a customer (validate against customers table)
    const { data: customerProfile, error: profileError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .single();
  
    if (profileError || !customerProfile) {
      console.error(profileError);
      return Alert.alert('Error', 'Customer profile not found.');
    }
  
    // Proceed with inserting the booking
    const { error: bookingError } = await supabase.from('bookings').insert([
      {
        service_id: service.id,
        customer_id: customerId,
        seller_id: service.seller_id,
        booking_date: bookingDate.toISOString(),
        special_requests: specialRequests,
        status: 'pending',
      },
    ]);
  
    if (bookingError) {
      console.error(bookingError);
      return Alert.alert('Booking Failed', 'Could not store booking.');
    }
  
    Alert.alert('Success', 'Booking request sent!');
    navigation.goBack();
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Book Service</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.text}>Price: ${service.price}</Text>
        <Text style={styles.text}>Category: {service.category}</Text>
        <Text style={styles.text}>Provider: {service.sellers?.business_name}</Text>
        <Text style={styles.text}>{service.description}</Text>
      </View>

      <BookingDateSelector onConfirm={setBookingDate} />

      <TextInput
        style={styles.textArea}
        placeholder="Special requests (optional)"
        placeholderTextColor="#ccc"
        multiline
        numberOfLines={4}
        value={specialRequests}
        onChangeText={setSpecialRequests}
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full height
    backgroundColor: 'black', // ⚫ background
    padding: 16, // Outer spacing
  },
  heading: {
    fontSize: 24, // Large title
    color: 'white', // ⚪ text
    fontWeight: 'bold', // Bold heading
    marginBottom: 20, // Space under heading
  },
  card: {
    backgroundColor: 'white', // ⚪ service card
    borderRadius: 10, // Rounded corners
    padding: 16, // Inner padding
    marginBottom: 20, // Space under card
  },
  title: {
    fontSize: 18, // Title text
    fontWeight: 'bold', // Emphasized
    color: 'black', // ⚫ text
    marginBottom: 6, // Below title
  },
  text: {
    fontSize: 14, // Standard text size
    color: 'black', // ⚫ text
    marginBottom: 4, // Spacing between lines
  },
  textArea: {
    borderWidth: 1, // Input border
    borderColor: 'white', // ⚪ border
    borderRadius: 8, // Rounded input
    padding: 12, // Inner padding
    color: 'white', // ⚪ text
    height: 100, // Textarea height
    marginBottom: 16, // Space under textarea
    textAlignVertical: 'top', // Text starts at top
  },
  button: {
    backgroundColor: 'white', // ⚪ button
    padding: 14, // Inner padding
    borderRadius: 8, // Rounded corners
    alignItems: 'center', // Center text
  },
  buttonText: {
    color: 'black', // ⚫ text
    fontWeight: 'bold', // Bold text
    fontSize: 16, // Readable size
  },
});
