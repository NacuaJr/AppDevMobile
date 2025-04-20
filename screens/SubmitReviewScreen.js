import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';

export default function SubmitReviewScreen({ route, navigation }) {
  const { booking } = route.params;
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return Alert.alert('Invalid Rating', 'Please enter a number from 1 to 5.');
    }

    const { error } = await supabase.from('reviews').insert([
      {
        booking_id: booking.id,
        rating: numericRating,
        comment,
      },
    ]);

    if (error) {
      console.error(error);
      return Alert.alert('Error', 'Could not submit review.');
    }

    Alert.alert('Thank you!', 'Your review has been submitted.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating (1-5)</Text>
      <TextInput
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
        style={styles.input}
        placeholder="Enter rating"
        placeholderTextColor="#999"
      />
      <Text style={styles.label}>Comment</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        style={[styles.input, { height: 80 }]}
        placeholder="Leave a comment..."
        placeholderTextColor="#999"
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // ⚫ background
    padding: 20,
  },
  label: {
    color: 'white', // ⚪ label text
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white', // ⚪ input background
    color: 'black', // ⚫ text inside input
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'white', // ⚪ submit button
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black', // ⚫ text
    fontWeight: 'bold',
  },
});
