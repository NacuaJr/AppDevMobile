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
  SafeAreaView,
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Catering</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.manageBookingsButton}
          onPress={() => navigation.navigate('SellerBookingsScreen')}
        >
          <Text style={styles.buttonText}>Manage Bookings </Text>
          <Ionicons name="calendar-outline" size={20} color="#FFF" />
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
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardPrice}>${item.price}</Text>
                </View>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <View style={styles.cardCategory}>
                  <Text style={styles.cardCategoryText}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>

        {/* Add Service Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Catering Service</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#8B4513" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Service Title</Text>
              <TextInput
                placeholder="e.g., Premium Wedding Package"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                placeholder="Describe your catering service..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
              
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor="#999"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  style={styles.picker}
                  dropdownIconColor="#8B4513"
                >
                  <Picker.Item label="Wedding" value="wedding" />
                  <Picker.Item label="Corporate" value="corporate" />
                  <Picker.Item label="Birthday" value="birthday" />
                  <Picker.Item label="Casual" value="casual" />
                </Picker>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.addButton]}
                  onPress={addService}
                >
                  <Text style={styles.buttonText}>Add Service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* View/Edit/Delete Modal */}
        <Modal visible={viewModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Service' : 'Service Details'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setIsEditing(false);
                  setViewModalVisible(false);
                }}>
                  <Ionicons name="close" size={24} color="#8B4513" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Service Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                editable={isEditing}
                placeholderTextColor="#999"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.multilineInput]}
                editable={isEditing}
                placeholderTextColor="#999"
                multiline
              />
              
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                style={styles.input}
                editable={isEditing}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  style={styles.picker}
                  enabled={isEditing}
                  dropdownIconColor="#8B4513"
                >
                  <Picker.Item label="Wedding" value="wedding" />
                  <Picker.Item label="Corporate" value="corporate" />
                  <Picker.Item label="Birthday" value="birthday" />
                  <Picker.Item label="Casual" value="casual" />
                </Picker>
              </View>

              <View style={styles.modalActions}>
                {isEditing ? (
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={updateService}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => deleteService(selectedService.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 20,
    marginHorizontal: -16,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  profileButton: {
    padding: 5,
  },
  heading: {
    fontSize: 22,
    color: 'orange',
    marginVertical: 15,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'sans-serif-condensed',
  },
  manageBookingsButton: {
    backgroundColor: '#FF8C42',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#FF8C42',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginLeft: 10,
  },
  cardDescription: {
    color: '#7A5C3C',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5D4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCategoryText: {
    color: '#8B4513',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF6B35',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF9F2',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    color: '#5A3921',
    fontSize: 20,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8C4A2',
    color: '#5A3921',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8C4A2',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    color: '#5A3921',
    backgroundColor: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48%',
    flex: 1,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: '#FF6B35',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  editButton: {
    backgroundColor: '#FF8C42',
  },
  deleteButton: {
    backgroundColor: '#E15554',
  },
  cancelButton: {
    backgroundColor: '#A5A5A5',
  },
});