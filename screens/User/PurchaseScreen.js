import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  I18nManager,
} from 'react-native';

import CustomCoinIcon from '../../components/CustomCoinIcon';
import ErrorModal from '../../components/ErrorModal';
import config from '../../config';

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default function PurchaseScreen({ route, navigation }) {
  const { user, item } = route.params;

  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentUserGogs = user?.GoGs || 0;
  const canAfford = currentUserGogs >= item.price;
  const isDonation = item.deliveryType === 'donation';

  let buttonText;
  if (!canAfford) {
    buttonText = 'חסרים גוגואים!';
  } else if (isDonation) {
    buttonText = 'תרום עכשיו';
  } else {
    buttonText = '🛒 רכוש את הפריט';
  }

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.SERVER_URL}/shop/purchase/${item._id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה לא ידועה');
      }

      // רכישה הצליחה - חזור למסך הבית עם ריסט למחסנית
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserHomeScreen', params: { user, refresh: true } }],
      });
    } catch (err) {
      console.error('שגיאה ברכישה:', err);
      setErrorTitle('שגיאה');
      setErrorMessage(err.message || 'אירעה שגיאה בעת הרכישה');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{item.name}</Text>

        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>אין תמונה</Text>
            </View>
          )}
        </View>

        <View style={styles.priceAndGogsContainer}>
          <View style={styles.priceGroup}>
            <Text style={styles.priceLabel}>מחיר:</Text>
            <Text style={styles.priceAmount}>{item.price}</Text>
            <CustomCoinIcon size={18} />
            <Text style={styles.priceUnit}> גוגואים</Text>
          </View>

          <View style={styles.gogsUserGroup}>
            <Text style={styles.gogsUserLabel}>ברשותך:</Text>
            <Text style={styles.gogsUserAmount}>{currentUserGogs}</Text>
            <CustomCoinIcon size={18} />
          </View>

          {!canAfford && (
            <Text style={styles.notEnoughGogs}>
              אין לך מספיק גוגואים לרכישה זו!
            </Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>תיאור</Text>
          <Text style={styles.description}>
            {item.description || 'אין תיאור זמין עבור פריט זה.'}
          </Text>
        </View>

        {item.deliveryType === 'pickup' && item.pickupLocation ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>איסוף מהחנות</Text>
            <Text style={styles.description}>{item.pickupLocation}</Text>
            <Text style={styles.pickupHint}>
              ניתן לאסוף את הפריט מבית העסק לאחר הרכישה.
            </Text>
          </View>
        ) : item.deliveryType === 'donation' ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>פרטי תרומה</Text>
            <Text style={styles.description}>
              פריט זה הוא תרומה על סך **{item.donationAmount || item.price} ₪**
              לכבוד ארגון **{item.donationTarget || 'הארגון הנבחר'}**.
              <Text style={styles.donationText}>
                {'\n'}תרומתך תועבר ישירות לארגון ותסייע רבות.
              </Text>
            </Text>
          </View>
        ) : item.deliveryType === 'digital' ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>פריט דיגיטלי</Text>
            <Text style={styles.description}>
              פריט זה הינו דיגיטלי ויישלח אליך לאחר הרכישה.
            </Text>
          </View>
        ) : null}

        {!isDonation && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>מידע חשוב</Text>
            <Text style={styles.description}>
              לאחר הרכישה ייווצר עבורך **קוד מימוש חד פעמי** תקף ל-30 יום. הקוד
              יישלח אליך ויופיע במסך "ההזמנות שלי".
            </Text>
          </View>
        )}

        {isDonation && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>הערה חשובה</Text>
            <Text style={styles.description}>
              **תודה רבה על תרומתך!**
              {'\n'}מכיוון שמדובר בתרומה, **לא יישלח קוד מימוש**. תרומתך עברה
              בהצלחה לארגון **{item.donationTarget || 'הארגון הנבחר'}** ותופיע
              במסך "ההזמנות שלי" כתיעוד.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, !canAfford && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={!canAfford || loading}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ErrorModal
        visible={errorModalVisible}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#282828',
    borderRadius: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: '#3E3E3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#D0D0D0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceAndGogsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
  priceGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#E0E0E0',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  gogsUserGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  gogsUserLabel: {
    color: '#FFE066',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
  },
  gogsUserAmount: {
    fontSize: 18,
    color: '#FFE066',
    fontWeight: '600',
    marginLeft: 2,
  },
  notEnoughGogs: {
    position: 'absolute',
    top: -30,
    right: 0,
    left: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  sectionCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
    paddingBottom: 5,
  },
  description: {
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 22,
    textAlign: 'right',
  },
  donationText: {
    fontStyle: 'italic',
    color: '#A0D9EF',
  },
  pickupHint: {
    fontSize: 13,
    color: '#9EC0EB',
    marginTop: 5,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: '#607D8B',
    shadowColor: '#607D8B',
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
