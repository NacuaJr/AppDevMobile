import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function SellerDashboard() {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('wedding');

  const fetchServices = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('catering_services')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setServices(data);
  };

  const addService = async () => {
    if (!title || !description || !price || !category) {
      return Alert.alert('Missing Fields', 'Please fill all fields.');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('catering_services').insert([
      {
        seller_id: user.id,
        title,
        description,
        price: parseFloat(price),
        category,
        availability: [],
      },
    ]);

    if (!error) {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('wedding');
      setModalVisible(false);
      fetchServices();
    }
  };

  const deleteService = async (id) => {
    const { error } = await supabase
      .from('catering_services')
      .delete()
      .eq('id', id);

    if (!error) {
      setViewModalVisible(false);
      fetchServices();
    }
  };

  const updateService = async () => {
    const { error } = await supabase
      .from('catering_services')
      .update({
        title,
        description,
        price: parseFloat(price),
        category,
      })
      .eq('id', selectedService.id);

    if (!error) {
      setIsEditing(false);
      setViewModalVisible(false);
      fetchServices();
    }
  };

  const openServiceModal = (item) => {
    setSelectedService(item);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setIsEditing(false);
    setViewModalVisible(true);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.manageBookingsButton}
        onPress={() => navigation.navigate('SellerBookingsScreen')}
      >
        <Text style={styles.buttonText}>Manage Bookings</Text>
      </TouchableOpacity>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.heading}>My Catering Services</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openServiceModal(item)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>${item.price}</Text>
              <Text style={styles.cardText}>Category: {item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>

      {/* Add Service Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Catering Service</Text>
            <TextInput
              placeholder="Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            <TextInput
              placeholder="Price"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
              dropdownIconColor="white"
            >
              <Picker.Item label="Wedding" value="wedding" />
              <Picker.Item label="Corporate" value="corporate" />
              <Picker.Item label="Birthday" value="birthday" />
              <Picker.Item label="Casual" value="casual" />
            </Picker>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.button} onPress={addService}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#555' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View/Edit/Delete Modal */}
      <Modal visible={viewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Service' : 'Service Details'}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              editable={isEditing}
              placeholderTextColor="#999"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              editable={isEditing}
              placeholderTextColor="#999"
            />
            <TextInput
              value={price}
              onChangeText={setPrice}
              style={styles.input}
              editable={isEditing}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
              enabled={isEditing}
              dropdownIconColor="white"
            >
              <Picker.Item label="Wedding" value="wedding" />
              <Picker.Item label="Corporate" value="corporate" />
              <Picker.Item label="Birthday" value="birthday" />
              <Picker.Item label="Casual" value="casual" />
            </Picker>

            <View style={styles.modalActions}>
              {isEditing ? (
                <TouchableOpacity style={styles.button} onPress={updateService}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'red' }]}
                onPress={() => deleteService(selectedService.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#555' }]}
                onPress={() => {
                  setIsEditing(false);
                  setViewModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'flex-end',
  },
  heading: {
    fontSize: 22,
    color: 'white',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  manageBookingsButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    color: 'white',
    backgroundColor: '#222',
    marginBottom: 10,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
