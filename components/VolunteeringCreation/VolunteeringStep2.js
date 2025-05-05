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
} from 'react-native';
import TagSelectorModal from '../TagSelectorModal';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

const predefinedTags = ['קשישים', 'ילדים', 'בעלי חיים', 'חינוך', 'סביבה'];

export default function VolunteeringStep2({
  formData,
  setFormData,
  onNext,
  onBack,
  user,
}) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        value={formData.notes}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, notes: text }))
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

      <Text style={styles.sectionTitle}>שיטת תגמול:</Text>

      <Pressable
        style={[
          styles.rewardOption,
          formData.usePredictionModel && styles.selectedOption,
        ]}
        onPress={() =>
          setFormData((prev) => ({
            ...prev,
            usePredictionModel: true,
            percentageReward: '',
          }))
        }
      >
        <Text style={styles.rewardText}>מודל חיזוי</Text>
      </Pressable>

      <Pressable
        style={[
          styles.rewardOption,
          !formData.usePredictionModel && styles.selectedOption,
        ]}
        onPress={() =>
          setFormData((prev) => ({
            ...prev,
            usePredictionModel: false,
          }))
        }
      >
        <Text style={styles.rewardText}>אחוז מהתקרה העירונית</Text>
      </Pressable>

      {!formData.usePredictionModel && (
        <TextInput
          placeholder="כמה אחוזים מהתקרה? (למשל 50)"
          value={formData.percentageReward}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, percentageReward: text }))
          }
          keyboardType="numeric"
          style={styles.input}
          textAlign="right"
        />
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
