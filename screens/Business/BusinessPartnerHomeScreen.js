// screens/BusinessPartnerHomeScreen.js
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
} from 'react-native';
import config from '../../config';
import fallbackImage from '../../images/noImageFound.webp';
import ErrorModal from '../../components/ErrorModal';
import CustomToast from '../../components/CustomToast';

export default function BusinessPartnerHomeScreen({ route, navigation }) {
  const { user } = route.params;
  const [rawCode, setRawCode] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // פונקציה לעיצוב הקוד עם רווחים ויזואליים בלבד, ללא הוספת רווחים אמיתיים
  // נשאיר את הקוד הגולמי נקי עבור הלוגיקה
  const displayFormattedCode = (text) => {
    // מנקה את כל התווים שאינם ספרות או אותיות
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '');
    let formatted = '';
    // כאן נוסיף רווחים ויזואליים ב-placeholder, אבל ב-value עצמו נציג את הקוד נטו
    // כדי לאפשר ל-TextInput לנהל גלילה/מרכוז טוב יותר ללא תווים בלתי נראים
    for (let i = 0; i < cleaned.length; i++) {
      formatted += cleaned[i];
      if ((i + 1) % 4 === 0 && i + 1 < cleaned.length) {
        formatted += ' '; // נוסיף רווח רק לצורך תצוגה
      }
    }
    return formatted;
  };

  const handleChangeText = (text) => {
    const cleanedText = text.replace(/ /g, ''); // הסר רווחים שהוצגו
    if (cleanedText.length <= 12) {
      setRawCode(cleanedText.toUpperCase()); // נמיר לאותיות גדולות אוטומטית לקודים
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

      const { businessName, address } = user.businessPartner;
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/by-code-for-business/${rawCode}?businessName=${encodeURIComponent(
          businessName
        )}&address=${encodeURIComponent(address)}`
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error('קוד לא נמצא או שאינו שייך לעסק שלך');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
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
      } catch (err) {
        console.warn('⚠️ שגיאה פנימית בשליפת מוצר, ממשיכים עם פרטים בסיסיים.');
      }

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
  }, [rawCode, user.businessPartner]);

  const confirmRedeem = useCallback(async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/${itemDetails._id}/redeem`,
        { method: 'PATCH' }
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

        <View style={styles.header}>
          <Text style={styles.title}>{user.firstName}</Text>
          <Text style={styles.subtitle}>{user.businessPartner.address}</Text>

          <Text style={styles.subtitle}>שותף עסקי</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>הכנס קוד מימוש:</Text>
          <TextInput
            style={styles.input}
            placeholder="ABCD EFGH IJKL" // Placeholder נקי יותר עם פורמט
            placeholderTextColor="#6A7B9B"
            value={displayFormattedCode(rawCode)} // תצוגה עם רווחים
            onChangeText={handleChangeText} // עדכון הקוד הגולמי
            textAlign="center"
            keyboardType="default"
            autoCapitalize="characters"
            maxLength={14} // 12 תווים + 2 רווחים לתצוגה
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
            onPress={() => {
              navigation.navigate('RedeemHistory', { user });
            }}
          >
            <Text style={styles.buttonText}>היסטוריית מימושים</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Item Details */}
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

        {/* ErrorModal and CustomToast */}
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A52', // כחול כהה עמוק
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#1A2B42', // כחול כהה יותר, בסיס
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
  },
  title: {
    color: '#00E0FF', // כחול זוהר
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#A0D8F0', // כחול בהיר מעט
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#2A445C', // כחול כהה בינוני לכרטיס
    borderRadius: 25,
    padding: 35,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.2)',
  },
  label: {
    color: '#E0F2F7', // כחול לבן זוהר
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 224, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  input: {
    backgroundColor: '#1A2B42', // כהה יותר, ניגודיות טובה
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 25, // פדינג שווה משני הצדדים
    width: '100%',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00E0FF', // כחול זוהר לקוד
    // הפילטר האמיתי של הריווח יגיע מפונקציית displayFormattedCode
    // letterSpacing: 4, // נסיר את זה מכאן כדי לא לגרום לגלילה בלתי רצויה
    marginBottom: 30,
    borderColor: '#00E0FF',
    borderWidth: 2,
    elevation: 5,
    shadowColor: 'rgba(0, 224, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  redeemButton: {
    backgroundColor: '#00E0FF',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'rgba(0, 224, 255, 0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  historyButton: {
    backgroundColor: '#4A627A',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#1A2B42',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Modal Styles
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 25,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#00E0FF',
    shadowColor: 'rgba(0, 224, 255, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
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
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
