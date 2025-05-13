import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TagSelectorModal from '../TagSelectorModal';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import Slider from '@react-native-community/slider';
import VOLUNTEERING_TAGS from '../../constants/volunteeringTags';
import HelpModal from '../../components/HelpModal';

const predefinedTags = VOLUNTEERING_TAGS;

export default function VolunteeringStep2({
  formData,
  setFormData,
  onNext,
  onBack,
  user,
}) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [helpVisible, setHelpVisible] = useState(false);
  const [helpType, setHelpType] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadingImage(true);
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      } else {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה');
      }
      setUploadingImage(false);
    }
  };
  const openHelp = (type) => {
    setHelpType(type);
    setHelpVisible(true);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>שלב 2 מתוך 3</Text>
      <Text style={styles.title}>מיקום, תגיות ותגמול</Text>

      <TextInput
        placeholder="עיר ההתנדבות"
        value={formData.city}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, city: text }))
        }
        style={styles.input}
        textAlign="right"
      />

      <TextInput
        placeholder="כתובת (רחוב ומספר)"
        value={formData.address}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, address: text }))
        }
        style={styles.input}
        textAlign="right"
      />

      <Pressable style={styles.tagButton} onPress={() => setShowTagModal(true)}>
        <Text style={styles.tagButtonText}>בחר תגיות</Text>
      </Pressable>

      {formData.tags.length > 0 && (
        <Text style={styles.tagsDisplay}>
          תגיות שנבחרו: {formData.tags.join(', ')}
        </Text>
      )}

      <TextInput
        placeholder="הערות למתנדב (אופציונלי)"
        value={formData.notesForVolunteers}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, notesForVolunteers: text }))
        }
        style={styles.input}
        textAlign="right"
        multiline
      />

      <Pressable style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>העלאת תמונה (אופציונלי)</Text>
      </Pressable>

      {formData.imageUrl && (
        <Image
          source={{ uri: formData.imageUrl }}
          style={styles.imagePreview}
        />
      )}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
        <Text style={styles.sectionTitle}>שיטת תגמול:</Text>
        <TouchableOpacity onPress={() => openHelp('external')}>
          <Ionicons
            name="help-circle-outline"
            size={25}
            color="#555"
            style={{ marginEnd: 5, marginTop: 10 }}
          />
        </TouchableOpacity>
      </View>
      <Pressable
        style={[
          styles.rewardOption,
          formData.rewardType === 'model' && styles.selectedOption,
        ]}
        onPress={() =>
          setFormData((prev) => ({
            ...prev,
            rewardType: 'model',
            percentageReward: '',
          }))
        }
      >
        <Text style={styles.rewardText}>מודל חיזוי</Text>
      </Pressable>

      <Pressable
        style={[
          styles.rewardOption,
          formData.rewardType === 'percent' && styles.selectedOption,
        ]}
        onPress={() =>
          setFormData((prev) => ({
            ...prev,
            rewardType: 'percent',
          }))
        }
      >
        <Text style={styles.rewardText}>אחוז מהתקרה העירונית</Text>
      </Pressable>

      {formData.rewardType === 'percent' && (
        <>
          <Text style={styles.sliderLabel}>
            אחוז מהתקרה: {formData.percentageReward || 0}%
          </Text>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={parseInt(formData.percentageReward) || 0}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                percentageReward: String(value),
              }))
            }
          />
        </>
      )}

      <View style={styles.navButtons}>
        <Pressable
          onPress={onBack}
          style={[styles.navButton, styles.backButton]}
        >
          <Text style={styles.navText}>חזור</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.navButton}>
          <Text style={styles.navText}>המשך</Text>
        </Pressable>
      </View>

      <TagSelectorModal
        visible={showTagModal}
        onClose={() => setShowTagModal(false)}
        selectedTags={formData.tags}
        onSelectTags={(tags) => setFormData((prev) => ({ ...prev, tags }))}
        availableTags={predefinedTags}
      />
      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="כיצד לקבוע את שיטת התגמול?"
        message={
          helpType === 'external'
            ? 'שיטת התגמול נועדה להתאים את כמות הגוגואים לקושי ולמשמעות של ההתנדבות. ככל שהמשימה דורשת יותר מאמץ, מומלץ להעניק אחוז גבוה יותר מהתקרה העירונית. ניתן גם להשתמש במודל החיזוי כדי לחשב תגמול אופטימלי באופן אוטומטי.'
            : ''
        }
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  stepLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  tagButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  tagButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tagsDisplay: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  imageButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  rewardOption: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#c8e6c9',
  },
  rewardText: {
    fontSize: 16,
    textAlign: 'right',
  },
  sliderLabel: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 4,
    fontWeight: '500',
    color: '#444',
  },
  navButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#888',
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
