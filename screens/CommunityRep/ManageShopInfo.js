import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ManageShopInfo({ route }) {
  const navigation = useNavigation();
  const user = route.params?.user;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.buttonsGrid}>
        {/* כפתור ניהול עסקים */}
        <Text style={styles.descriptionText}>
          ניהול העסקים קובע מי יכבד את קודי המימוש של המוצרים בחנות.
        </Text>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() =>
            navigation.navigate('ManageBusinessesScreen', { user })
          }
        >
          <Text style={styles.buttonText}>ניהול עסקים</Text>
        </TouchableOpacity>

        {/* כפתור ניהול עמותות לתרומה */}
        <Text style={styles.descriptionText}>
          ניהול העמותות מאפשר להגדיר למי ניתן לתרום מהחנות ולנהל מעקב אחרי
          התרומות שהצטברו עד כה.
        </Text>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() => navigation.navigate('ManageDonation', { user })}
        >
          <Text style={styles.buttonText}>ניהול עמותות לתרומה</Text>
        </TouchableOpacity>

        {/* כפתור ניהול קטגוריות */}
        <Text style={styles.descriptionText}>
          ניהול הקטגוריות מתייחס למוצרים בחנות העירונית.
        </Text>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={() =>
            navigation.navigate('ManageCategoriesScreen', { user })
          }
        >
          <Text style={styles.buttonText}>ניהול קטגוריות</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF', // רקע כללי בהיר יותר (AliceBlue)
  },

  buttonsGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30, // רווח עליון גדול יותר
  },
  descriptionText: {
    fontSize: 15, // גודל גופן מעט גדול יותר
    color: '#4682B4', // צבע כחול פלדה - אסתטי וקריא
    textAlign: 'right',
    marginBottom: 12, // רווח גדול יותר בין ההסבר לכפתור
    width: width * 0.8,
    maxWidth: 400,
    lineHeight: 22, // רווח שורות להקלה בקריאה
    fontWeight: '500', // עובי גופן בינוני
  },
  gridButton: {
    backgroundColor: '#FFFFFF', // רקע כפתור לבן
    paddingVertical: 35, // ריפוד פנימי גדול יותר
    paddingHorizontal: 15,
    borderRadius: 18, // פינות עגולות יותר
    marginBottom: 35, // רווח גדול יותר בין הכפתורים לבלוק הבא
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85, // רוחב כפתור מעט גדול יותר
    maxWidth: 450, // רוחב מקסימלי מעט גדול יותר
    shadowColor: '#4682B4',
    shadowOffset: { width: 0, height: 8 }, // צל עמוק יותר
    shadowOpacity: 0.2, // צל עדין ורך
    shadowRadius: 10, // פיזור רך של הצל
    elevation: 12, // התאמה לאנדרואיד
    borderLeftWidth: 6, // פס עבה יותר
    borderColor: '#4682B4', // פס כחול פלדה עמוק
  },
  buttonText: {
    color: '#1C1C3A',
    fontSize: 22, // גודל גופן מעט גדול ובולט יותר
    fontWeight: '700', // עובי גופן מודגש מאוד
    textAlign: 'center',
  },
});
