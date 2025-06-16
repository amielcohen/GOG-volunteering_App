import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import CustomCoinIcon from '../../components/CustomCoinIcon';
import ConfirmModal from '../../components/ConfirmModal';

export default function SendCityMessage({ route }) {
  const { user } = route.params;
  const [type, setType] = useState('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendCoins, setSendCoins] = useState(false);
  const [coins, setCoins] = useState('');

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState({ title: '', message: '' });
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const sendTheMessage = async () => {
    try {
      const payload = {
        city: user.city,
        title: title.trim(),
        message: message.trim(),
        type,
        sendCoins,
        coins: sendCoins ? Number(coins) : 0,
      };

      const response = await axios.post(
        `${config.SERVER_URL}/user-messages/send`,
        payload
      );

      setErrorText({
        title: 'הצלחה',
        message: `ההודעה נשלחה בהצלחה ל-${response.data.sentCount} משתמשים בעיר!`,
      });
      setErrorVisible(true);

      setTitle('');
      setMessage('');
      setSendCoins(false);
      setCoins('');
    } catch (err) {
      console.error('שגיאה בשליחת ההודעה:', err.message);
      setErrorText({
        title: 'שגיאה',
        message:
          err.response?.data?.message ||
          'אירעה תקלה בעת שליחת ההודעה. נסה שוב.',
      });
      setErrorVisible(true);
    } finally {
      setConfirmModalVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setErrorText({ title: 'שגיאה', message: 'נא למלא כותרת ותוכן הודעה' });
      setErrorVisible(true);
      return;
    }

    if (sendCoins && (!coins || isNaN(Number(coins)) || Number(coins) <= 0)) {
      setErrorText({ title: 'שגיאה', message: 'נא להזין כמות גוגואים חוקית' });
      setErrorVisible(true);
      return;
    }

    if (sendCoins && Number(coins) > 0) {
      setConfirmAction(() => sendTheMessage);
      setConfirmModalVisible(true);
    } else {
      await sendTheMessage();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>שליחת הודעה{'\n'}למשתמשי העיר</Text>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>סוג הודעה:</Text>
          <Picker
            selectedValue={type}
            onValueChange={(val) => setType(val)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            mode={Platform.OS === 'android' ? 'dropdown' : 'dialog'}
          >
            <Picker.Item label="מידע (Info)" value="info" />
            <Picker.Item label="אזהרה (Warning)" value="warning" />
            <Picker.Item label="הצלחה (Success)" value="success" />
            <Picker.Item label="התראה (Alert)" value="alert" />
          </Picker>
        </View>

        <Text style={styles.label}>כותרת:</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="כותרת ההודעה"
          placeholderTextColor="#A0A0A0"
          textAlign="right"
        />

        <Text style={styles.label}>תוכן ההודעה:</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={[styles.input, styles.messageInput]}
          placeholder="תוכן חופשי..."
          placeholderTextColor="#A0A0A0"
          multiline
          textAlign="right"
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>שלח גוגואים עם ההודעה</Text>
          <Switch
            value={sendCoins}
            onValueChange={setSendCoins}
            trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
            thumbColor={
              Platform.OS === 'android'
                ? sendCoins
                  ? '#3F51B5'
                  : '#888888'
                : ''
            }
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {sendCoins && (
          <>
            <Text style={styles.label}>כמות גוגואים:</Text>
            <View style={styles.coinsInputContainer}>
              <TextInput
                value={coins}
                onChangeText={setCoins}
                style={styles.coinsInput}
                placeholder="הכנס כמות"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                textAlign="right"
              />
              <CustomCoinIcon size={24} style={styles.coinIcon} />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>שלח הודעה</Text>
        </TouchableOpacity>

        <ErrorModal
          visible={errorVisible}
          title={errorText.title}
          message={errorText.message}
          onClose={() => setErrorVisible(false)}
        />

        <ConfirmModal
          visible={confirmModalVisible}
          title="אישור שליחת גוגואים"
          message={`האם לאשר שליחת ${coins} גוגואים עם ההודעה?`}
          onConfirm={confirmAction}
          onCancel={() => setConfirmModalVisible(false)}
          confirmText="שלח גוגואים"
          confirmColor="#4CAF50"
          cancelText="בטל"
          cancelColor="#EF5350"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  headerContainer: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1A237E',
    lineHeight: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
    marginTop: 15,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    textAlign: 'right',
    fontSize: 16,
    color: '#424242',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingRight: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#424242',
    writingDirection: 'rtl',
  },
  pickerItem: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  switchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginRight: 10,
  },
  coinsInputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingRight: 15,
    paddingLeft: 30,
    minHeight: 50,
  },
  coinsInput: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 0,
    fontSize: 16,
    color: '#424242',
    textAlign: 'right',
  },
  coinIcon: {
    marginLeft: 0,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#BBDEFB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
