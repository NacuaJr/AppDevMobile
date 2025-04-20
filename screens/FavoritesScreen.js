import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../supabase'; // Adjust path if needed
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
    fetchFavorites();
  }, []);

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
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.text}>{service.description}</Text>
        <Text style={styles.text}>Price: ${service.price}</Text>
        <Text style={styles.text}>Category: {service.category}</Text>
        <Text style={styles.text}>
          Provider: {service.sellers?.business_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={favorites}
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
    flex: 1, // 📦 full screen
    backgroundColor: 'black', // ⚫ app theme
    paddingHorizontal: 16, // ↔️ screen padding
    paddingTop: 40, // ⬆ padding from top
  },
  header: {
    flexDirection: 'row', // 🔁 row layout
    justifyContent: 'space-between', // ⬅️➡️
    alignItems: 'center', // ⬆️⬇️ center align
    marginBottom: 16, // ⬇ space below
  },
  headerTitle: {
    fontSize: 20, // 🔠 title size
    fontWeight: 'bold', // 🔡 emphasis
    color: 'white', // ⚪ text color
  },
  card: {
    backgroundColor: 'white', // ⚪ container bg
    padding: 16, // 🧱 spacing
    borderRadius: 12, // 🟦 rounded corners
    marginBottom: 12, // ↕ spacing between cards
  },
  title: {
    fontSize: 18, // 🔠 service title
    fontWeight: 'bold', // emphasis
    color: 'black', // ⚫ for contrast
    marginBottom: 4, // spacing from desc
  },
  text: {
    color: 'black', // ⚫ text color
    marginBottom: 2, // line spacing
  },
});
