import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function BookingDateSelector({ onConfirm }) {
  const [isPickerVisible, setPickerVisible] = useState(false); // Toggles modal
  const [selectedDate, setSelectedDate] = useState(null); // Holds chosen date

  const showDatePicker = () => setPickerVisible(true); // Show modal
  const hideDatePicker = () => setPickerVisible(false); // Hide modal

  const handleConfirm = (date) => {
    setSelectedDate(date); // Save selected date
    onConfirm(date); // Pass to parent
    hideDatePicker(); // Close picker
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {selectedDate ? selectedDate.toLocaleString() : 'Select Booking Date'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        textColor="white" // ⚪ white text inside picker
        themeVariant="dark" // ⚫ dark background
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12, // Adds spacing above and below the component
  },
  dateButton: {
    backgroundColor: 'white', // ⚪ background to stand out on black
    padding: 12, // Adds space inside the button
    borderRadius: 10, // Makes button edges rounded
    alignItems: 'center', // Centers the text
  },
  dateText: {
    color: 'black', // ⚫ Text is black to contrast button
    fontSize: 16, // Readable size
    fontWeight: 'bold', // Emphasizes text
  },
});
