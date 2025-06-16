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
  const [onlyWithAvailableSpots, setOnlyWithAvailableSpots] = useState(
    initialFilters.onlyWithAvailableSpots || false
  );
  const [onlyMatchingLevel, setOnlyMatchingLevel] = useState(
    initialFilters.onlyMatchingLevel || false
  );

  const resetFilters = () => {
    setSelectedTag('');
    setMinExp('');
    setMaxExp('');
    setMinCoins('');
    setMaxCoins('');
    setLocation('');
    setOrganizationName('');
    setOnlyWithAvailableSpots(false);
    setOnlyMatchingLevel(false);
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
      onlyWithAvailableSpots,
      onlyMatchingLevel,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>סינון התנדבויות</Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>עמותה:</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="הכנס שם עמותה"
              placeholderTextColor="#A0A0A0"
              value={organizationName}
              onChangeText={setOrganizationName}
              textAlign="right"
            />

            <Text style={styles.label}>תגית:</Text>
            <ScrollView
              horizontal
              contentContainerStyle={styles.tagsScrollView}
            >
              <View style={styles.tagsContainer}>
                {VOLUNTEERING_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tag, isSelected && styles.tagSelected]}
                      onPress={() => setSelectedTag(isSelected ? '' : tag)}
                    >
                      <Text
                        style={
                          isSelected ? styles.tagTextSelected : styles.tagText
                        }
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.label}>נקודות ניסיון (מינימום - מקסימום):</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.inputHalf}
                placeholder="מינ'"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={minExp}
                onChangeText={setMinExp}
                textAlign="right"
              />
              <TextInput
                style={styles.inputHalf}
                placeholder="מקס'"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={maxExp}
                onChangeText={setMaxExp}
                textAlign="right"
              />
            </View>

            <Text style={styles.label}>גוגואים (מינימום - מקסימום):</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.inputHalf}
                placeholder="מינ'"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={minCoins}
                onChangeText={setMinCoins}
                textAlign="right"
              />
              <TextInput
                style={styles.inputHalf}
                placeholder="מקס'"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={maxCoins}
                onChangeText={setMaxCoins}
                textAlign="right"
              />
            </View>

            <Text style={styles.label}>מיקום (יישוב):</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="הזן עיר / מקום"
              placeholderTextColor="#A0A0A0"
              value={location}
              onChangeText={setLocation}
              textAlign="right"
            />

            <View style={styles.checkboxRow}>
              <Text style={styles.checkboxLabelText}>
                הצג רק התנדבויות עם מקומות פנויים
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setOnlyWithAvailableSpots(!onlyWithAvailableSpots)
                }
                style={[
                  styles.checkbox,
                  onlyWithAvailableSpots && styles.checkboxChecked,
                ]}
              />
            </View>

            <View style={styles.checkboxRow}>
              <Text style={styles.checkboxLabelText}>
                הצג רק התנדבויות שמתאימות לרמה שלי
              </Text>
              <TouchableOpacity
                onPress={() => setOnlyMatchingLevel(!onlyMatchingLevel)}
                style={[
                  styles.checkbox,
                  onlyMatchingLevel && styles.checkboxChecked,
                ]}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
              <Text style={styles.clearBtnText}>נקה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyBtnText}>החל</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>סגור</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    padding: 25,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
    marginTop: 15,
    textAlign: 'right',
  },
  inputFull: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagsScrollView: {
    paddingVertical: 5,
    paddingHorizontal: 0,
    flexGrow: 0,
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
    marginTop: 5,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#D4EEF7',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5, // Space between tags
    backgroundColor: '#EBF5F9',
  },
  tagSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#90CAF9',
  },
  tagText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  tagTextSelected: {
    color: '#1A237E',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  clearBtn: {
    padding: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  clearBtnText: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyBtn: {
    padding: 15,
    backgroundColor: '#BBDEFB',
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  applyBtnText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  checkboxLabelText: {
    fontSize: 15,
    color: '#424242',
    marginRight: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#BBDEFB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3F51B5',
    borderColor: '#3F51B5',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
});
