import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import fallbackImage from '../../images/noImageFound.webp';
import ErrorModal from '../../components/ErrorModal';
import CustomToast from '../../components/CustomToast';

export default function BusinessPartnerHomeScreen({ route, navigation }) {
  const { user } = route.params;
  const [currentUser, setCurrentUser] = useState(user);
  const [rawCode, setRawCode] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (route.params?.user) {
        setCurrentUser(route.params.user);
        navigation.setParams({ user: undefined });
      }
    }, [route.params?.user])
  );

  const displayFormattedCode = (text) => {
    const cleaned = text.replace(/[^a-zA-Z0-9!?@#$%^&*]/g, ''); // אפשר להתאים את הסימנים
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      formatted += cleaned[i];
      if ((i + 1) % 4 === 0 && i + 1 < cleaned.length) {
        formatted += ' ';
      }
    }
    return formatted;
  };

  const handleChangeText = (text) => {
    const cleanedText = text.replace(/ /g, '');
    if (cleanedText.length <= 12) {
      setRawCode(cleanedText.toUpperCase());
    }
  };

  const handleRedeem = useCallback(async () => {
    if (rawCode.length !== 12) {
      setErrorMessage('הקוד חייב להיות באורך 12 תווים.');
      setErrorVisible(true);
      return;
    }

    try {
      setLoading(true);
      const { businessName, address } = currentUser.businessPartner;
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/by-code-for-business/${rawCode}?businessName=${encodeURIComponent(
          businessName
        )}&address=${encodeURIComponent(address)}`
      );
      const text = await res.text();
      if (!res.ok) {
        let errorMessage = 'אירעה שגיאה';
        try {
          const json = JSON.parse(text);
          errorMessage = json.message || errorMessage;
        } catch {
          errorMessage = text; // אם לא פורמט JSON, פשוט טקסט רגיל
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('שגיאה בפענוח תגובת הקוד');
      }

      if (data.status === 'redeemed') {
        throw new Error('קוד זה כבר מומש בעבר');
      }
      if (data.status === 'expired') {
        throw new Error('קוד זה פג תוקף');
      }

      let item = null;
      try {
        const itemRes = await fetch(
          `${config.SERVER_URL}/shop/shop-item/${data.itemId}`
        );
        const itemText = await itemRes.text();
        if (!itemRes.ok) {
          throw new Error('לא ניתן לשלוף את פרטי המוצר');
        }
        item = JSON.parse(itemText);
      } catch {}

      setItemDetails({
        _id: data._id,
        name: data.itemName,
        description: item?.description || '',
        imageUrl: item?.imageUrl || null,
        createdAt: data.createdAt,
      });
      setModalVisible(true);
    } catch (err) {
      setErrorMessage(err.message || 'אירעה שגיאה במימוש');
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  }, [rawCode, currentUser.businessPartner]);

  const confirmRedeem = useCallback(async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/${itemDetails._id}/redeem`,
        {
          method: 'PATCH',
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה במימוש');
      setModalVisible(false);
      setRawCode('');
      setToastMessage('🎉 המימוש הושלם בהצלחה!');
      setToastVisible(true);
    } catch (err) {
      setErrorMessage(err.message || 'אירעה שגיאה באישור המימוש');
      setErrorVisible(true);
    }
  }, [itemDetails]);

  const handleEditBusiness = () => {
    navigation.navigate('EditBusinessScreen', { user: currentUser });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleEditBusiness}
          >
            <Icon name="settings" size={30} color="#00E0FF" />
          </TouchableOpacity>

          <Text style={styles.title}>{currentUser.firstName}</Text>
          <Text style={styles.subtitle}>
            {currentUser.businessPartner.address}
          </Text>
          <Text style={styles.subtitle}>שותף עסקי</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>הכנס קוד מימוש:</Text>
          <TextInput
            style={styles.input}
            placeholder="ABCD EFGH IJKL"
            placeholderTextColor="#6A7B9B"
            value={displayFormattedCode(rawCode)}
            onChangeText={handleChangeText}
            textAlign="center"
            keyboardType="visible-password" // במקום default
            autoCapitalize="characters"
            maxLength={14}
            selectionColor="#00E0FF"
          />

          <TouchableOpacity
            style={styles.redeemButton}
            onPress={handleRedeem}
            disabled={loading || rawCode.length !== 12}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>ממש קוד</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() =>
              navigation.navigate('RedeemHistory', { user: currentUser })
            }
          >
            <Text style={styles.buttonText}>היסטוריית מימושים</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>פרטי הפריט למימוש</Text>
              <Image
                source={
                  itemDetails?.imageUrl
                    ? { uri: itemDetails.imageUrl }
                    : fallbackImage
                }
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.itemName}>{itemDetails?.name}</Text>
              {itemDetails?.description ? (
                <Text style={styles.itemDescription}>
                  {itemDetails.description}
                </Text>
              ) : null}
              {itemDetails?.createdAt && (
                <Text style={styles.itemDate}>
                  <Text style={{ fontWeight: 'bold' }}>נוצר ב:</Text>{' '}
                  {new Date(itemDetails.createdAt).toLocaleDateString('he-IL')}
                </Text>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmRedeem}
                >
                  <Text style={styles.modalButtonText}>ממש כעת</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ErrorModal
          visible={errorVisible}
          title="שגיאה במימוש"
          message={errorMessage}
          onClose={() => setErrorVisible(false)}
        />
        {toastVisible && (
          <CustomToast
            message={toastMessage}
            onHide={() => setToastVisible(false)}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1E3A52',
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    backgroundColor: '#1A2B42',
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 25,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  title: {
    color: '#00E0FF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A0D8F0',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#2A445C',
    borderRadius: 25,
    padding: 35,
    width: '90%',
    alignItems: 'center',
  },
  label: {
    color: '#E0F2F7',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A2B42',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 25,
    width: '100%',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 30,
    borderColor: '#00E0FF',
    borderWidth: 2,
  },
  redeemButton: {
    backgroundColor: '#00E0FF',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#4A627A',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#1A2B42',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,25,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2A445C',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 25,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 25,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 17,
    color: '#E0F2F7',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  itemDate: {
    fontSize: 15,
    color: '#A0D8F0',
    marginBottom: 30,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#4A627A',
  },
  confirmButton: {
    backgroundColor: '#00E0FF',
  },
  modalButtonText: {
    color: '#1A2B42',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
