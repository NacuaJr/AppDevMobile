import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import BookingDateSelector from '../screens/BookingDateSelector';

export default function CustomerBookingScreen({ route, navigation }) {
  const { service, session } = route.params;
  const [bookingDate, setBookingDate] = useState(null);
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
  
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
  
    const customerId = user?.id;
    if (authError || !customerId) {
      console.error(authError);
      return Alert.alert('Error', 'User not logged in.');
    }
  
    const { data: customerProfile, error: profileError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .single();
  
    if (profileError || !customerProfile) {
      console.error(profileError);
      return Alert.alert('Error', 'Customer profile not found.');
    }
  
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Service</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{service.title}</Text>
          <Text style={styles.cardDescription}>{service.description}</Text>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={18} color="#8B4513" />
              <Text style={styles.detailText}>${service.price}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={18} color="#8B4513" />
              <Text style={styles.detailText}>{service.sellers?.business_name}</Text>
            </View>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{service.category}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Booking Date</Text>
        <BookingDateSelector onConfirm={setBookingDate} />

        <Text style={styles.sectionTitle}>Special Requests</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any dietary restrictions or special notes..."
          placeholderTextColor="#D4A373"
          multiline
          numberOfLines={4}
          value={specialRequests}
          onChangeText={setSpecialRequests}
        />

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  container: {
    paddingBottom: 40,
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
    marginBottom: 20,
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
    marginBottom: 20,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#FF8C42',
  },
  cardTitle: {
    color: '#5A3921',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#7A5C3C',
    fontSize: 15,
    marginBottom: 15,
    lineHeight: 22,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#8B4513',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#8B4513',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    color: '#5A3921',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E8C4A2',
    backgroundColor: '#FFF',
    color: '#5A3921',
    borderRadius: 12,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});