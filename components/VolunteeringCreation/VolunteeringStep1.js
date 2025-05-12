import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import HelpModal from '../../components/HelpModal';
import { Ionicons } from '@expo/vector-icons';

const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function VolunteeringStep1({ formData, setFormData, onNext }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleConfirmDate = (date) => {
    setShowDatePicker(false);
    const recurringDay = date.getDay();

    setFormData((prev) => ({
      ...prev,
      date,
      recurringDay,
    }));
  };

  const currentDayName = daysOfWeek[formData.date.getDay()];

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>שלב 1 מתוך 3</Text>
      <Text style={styles.title}>פרטי בסיס</Text>

      <TextInput
        placeholder="שם ההתנדבות"
        value={formData.title}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, title: text }))
        }
        style={styles.input}
        textAlign="right"
      />

      <TextInput
        placeholder="תיאור ההתנדבות"
        value={formData.description}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, description: text }))
        }
        style={styles.input}
        multiline
        textAlign="right"
      />

      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>בחר תאריך ושעה</Text>
        <Text style={styles.dateValue}>
          {formData.date.toLocaleString('he-IL')}
        </Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
        locale="he-IL"
        is24Hour={true}
      />

      <TextInput
        placeholder="משך ההתנדבות משוערת (בדקות)"
        value={formData.durationMinutes}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, durationMinutes: text }))
        }
        keyboardType="numeric"
        style={styles.input}
        textAlign="right"
      />

      <TextInput
        placeholder="מספר משתתפים מקסימלי"
        value={formData.maxParticipants?.toString() || ''}
        onChangeText={(text) =>
          setFormData((prev) => ({
            ...prev,
            maxParticipants: parseInt(text) || '',
          }))
        }
        keyboardType="numeric"
        style={styles.input}
        textAlign="right"
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>התנדבות קבועה?</Text>

        <Pressable onPress={() => setShowHelp(true)}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color="#555"
            style={{ marginEnd: 5 }}
          />
        </Pressable>

        <Pressable
          style={[
            styles.toggleBox,
            formData.isRecurring && { backgroundColor: '#4caf50' },
          ]}
          onPress={() =>
            setFormData((prev) => ({
              ...prev,
              isRecurring: !prev.isRecurring,
              recurringDay: prev.date.getDay(),
            }))
          }
        >
          <Text style={styles.toggleText}>
            {formData.isRecurring ? 'כן' : 'לא'}
          </Text>
        </Pressable>
      </View>

      {formData.isRecurring && (
        <Text style={styles.explanation}>
          ההתנדבות תיפתח מחדש בכל יום {currentDayName} בשעה שנבחרה
        </Text>
      )}

      <Pressable style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextText}>המשך לשלב הבא</Text>
      </Pressable>

      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="מה זה התנדבות קבועה?"
        message="התנדבות קבועה נוצרת אוטומטית מחדש כל שבוע, ביום ובשעה שקבעת, עם אותם פרטים בדיוק."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
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
  dateButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  dateValue: {
    textAlign: 'right',
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggleBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  toggleText: {
    color: '#fff',
  },
  explanation: {
    textAlign: 'right',
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  nextText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
