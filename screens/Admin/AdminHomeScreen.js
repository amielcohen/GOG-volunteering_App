import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar, // אין צורך ב-ScrollView, אז נסיר אותו
} from 'react-native';

const AdminHomeScreen = ({ navigation }) => {
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    // השתמש ב-View במקום ScrollView כיוון שאין צורך בגלילה
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A3B8A" />

      <View style={styles.header}>
        <Image
          source={require('../../images/adminBanner.png')} // וודא שהנתיב לתמונה נכון!
          style={styles.bannerImage}
        />
        <Text style={styles.welcomeText}>שלום, מנהל מערכת</Text>
      </View>

      {/* הקונטיינר הראשי עבור כל הכפתורים */}
      <View style={styles.buttonsGroupContainer}>
        {/* כרטיס: צפה בסטטיסטיקה */}
        <Pressable
          style={({ pressed }) => [
            styles.cardOuterFrame, // המסגרת הלבנה של הכפתור הבודד
            pressed && styles.cardPressedOuter, // אפקט לחיצה על המסגרת
          ]}
          onPress={() => navigateTo('AdminStatsScreen')}
        >
          <View
            style={[styles.cardInnerBackground, styles.cardStatsBackground]}
          >
            <Text style={styles.cardText}>צפה בסטטיסטיקה</Text>
          </View>
        </Pressable>

        {/* כרטיס: ניהול ארגונים ועמותות */}
        <Pressable
          style={({ pressed }) => [
            styles.cardOuterFrame,
            pressed && styles.cardPressedOuter,
          ]}
          onPress={() => navigateTo('AdminOrganizationScreen')}
        >
          <View
            style={[
              styles.cardInnerBackground,
              styles.cardOrganizationsBackground,
            ]}
          >
            <Text style={styles.cardText}>ניהול ארגונים ועמותות</Text>
          </View>
        </Pressable>

        {/* כרטיס: ניהול ערים וישובים */}
        <Pressable
          style={({ pressed }) => [
            styles.cardOuterFrame,
            pressed && styles.cardPressedOuter,
          ]}
          onPress={() => navigateTo('ManageCitiesScreen')}
        >
          <View
            style={[styles.cardInnerBackground, styles.cardCitiesBackground]}
          >
            <Text style={styles.cardText}>ניהול ערים וישובים</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // חשוב: flex: 1 כדי למלא את כל המסך ללא גלילה
    padding: 24,
    backgroundColor: '#6A5ACD', // רקע סגול-כחול עמוק
    alignItems: 'center',
    justifyContent: 'space-between', // מרווח את התוכן באופן שווה
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // הופחת כדי לפנות מקום, אם צריך
  },
  bannerImage: {
    width: '95%',
    height: 190,
    borderRadius: 20,
    marginBottom: 30,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#8A2BE2',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0E0FF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonsGroupContainer: {
    width: '98%',
    backgroundColor: '#776BCC', // רקע סגול-כחול מעט בהיר יותר
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
    marginBottom: 20, // הוסף מרווח תחתון אם יש צורך
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cardOuterFrame: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 20, // רווח בין כפתורים
    padding: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardPressedOuter: {
    transform: [{ scale: 0.96 }],
    opacity: 0.8,
    shadowOpacity: 0.1,
  },
  cardInnerBackground: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cardStatsBackground: {
    backgroundColor: '#87CEEB',
  },
  cardOrganizationsBackground: {
    backgroundColor: '#66CDAA',
  },
  cardCitiesBackground: {
    backgroundColor: '#FFA07A',
  },
});

export default AdminHomeScreen;
