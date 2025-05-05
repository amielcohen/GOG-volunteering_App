import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';

export default function VolunteeringStep3({ formData, onBack, onSubmit }) {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const renderRewardDetails = () => {
    if (formData.usePredictionModel) return 'מודל חיזוי';
    if (formData.percentageReward)
      return `אחוז מהתקרה: ${formData.percentageReward}%`;
    if (Object.keys(formData.customRewardByCity || {}).length > 0)
      return 'תגמול ידני לפי עיר';
    return 'לא הוגדר';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>שלב 3 מתוך 3</Text>
      <Text style={styles.title}>סקירה לפני שליחה</Text>

      <Text style={styles.sectionTitle}>פרטי ההתנדבות:</Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>שם:</Text> {formData.title}
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>תיאור:</Text> {formData.description}
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>תאריך:</Text>{' '}
        {formData.date.toLocaleString('he-IL')}
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>משך:</Text> {formData.durationMinutes} דקות
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>קבועה:</Text>{' '}
        {formData.isRecurring
          ? `כן (כל יום ${dayNames[formData.recurringDay]})`
          : 'לא'}
      </Text>

      <Text style={styles.sectionTitle}>מיקום ותגיות:</Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>עיר:</Text> {formData.city}
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>כתובת:</Text> {formData.address}
      </Text>
      <Text style={styles.item}>
        <Text style={styles.bold}>תגיות:</Text>{' '}
        {formData.tags.join(', ') || 'ללא'}
      </Text>
      {formData.notes ? (
        <Text style={styles.item}>
          <Text style={styles.bold}>הערות:</Text> {formData.notes}
        </Text>
      ) : null}

      <Text style={styles.sectionTitle}>תגמול:</Text>
      <Text style={styles.item}>{renderRewardDetails()}</Text>

      {formData.imageUrl ? (
        <Image source={{ uri: formData.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={onBack}
          style={[styles.navButton, styles.backButton]}
        >
          <Text style={styles.navText}>חזור</Text>
        </Pressable>

        <Pressable onPress={onSubmit} style={styles.navButton}>
          <Text style={styles.navText}>צור התנדבות</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  item: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 6,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  navigationButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 30,
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
