import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import VOLUNTEERING_TAGS from '../constants/volunteeringTags';

export default function FilterVolunteeringModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}) {
  const [selectedTag, setSelectedTag] = useState(initialFilters.tag || '');
  const [minExp, setMinExp] = useState(initialFilters.minExp || '');
  const [maxExp, setMaxExp] = useState(initialFilters.maxExp || '');
  const [minCoins, setMinCoins] = useState(initialFilters.minCoins || '');
  const [maxCoins, setMaxCoins] = useState(initialFilters.maxCoins || '');
  const [location, setLocation] = useState(initialFilters.location || '');
  const [organizationName, setOrganizationName] = useState(
    initialFilters.organizationName || ''
  );

  const resetFilters = () => {
    setSelectedTag('');
    setMinExp('');
    setMaxExp('');
    setMinCoins('');
    setMaxCoins('');
    setLocation('');
    setOrganizationName('');
  };

  const applyFilters = () => {
    onApply({
      tag: selectedTag,
      minExp,
      maxExp,
      minCoins,
      maxCoins,
      location,
      organizationName,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>סינון התנדבויות</Text>

          <Text style={styles.label}>עמותה:</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="הכנס שם עמותה"
            value={organizationName}
            onChangeText={setOrganizationName}
          />

          <Text style={styles.label}>תגית:</Text>
          <ScrollView horizontal contentContainerStyle={styles.tagsContainer}>
            {VOLUNTEERING_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => setSelectedTag(isSelected ? '' : tag)}
                >
                  <Text
                    style={isSelected ? styles.tagTextSelected : styles.tagText}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>נקודות ניסיון (מינימום - מקסימום):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.inputHalf}
              placeholder="מינ'"
              keyboardType="numeric"
              value={minExp}
              onChangeText={setMinExp}
            />
            <TextInput
              style={styles.inputHalf}
              placeholder="מקס'"
              keyboardType="numeric"
              value={maxExp}
              onChangeText={setMaxExp}
            />
          </View>

          <Text style={styles.label}>גוגואים (מינימום - מקסימום):</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.inputHalf}
              placeholder="מינ'"
              keyboardType="numeric"
              value={minCoins}
              onChangeText={setMinCoins}
            />
            <TextInput
              style={styles.inputHalf}
              placeholder="מקס'"
              keyboardType="numeric"
              value={maxCoins}
              onChangeText={setMaxCoins}
            />
          </View>

          <Text style={styles.label}> מיקום (יישוב):</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="הזן עיר / מקום"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
              <Text>נקה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={{ color: 'white' }}>החל</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    writingDirection: 'ltr',
    textAlign: 'right',
  },
  inputFull: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginVertical: 5,
    backgroundColor: 'white',
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    margin: 5,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    color: '#000',
  },
  tagTextSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  clearBtn: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyBtn: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
});
