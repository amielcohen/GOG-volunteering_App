import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import config from '../../config';
import { useNavigation } from '@react-navigation/native';
import HelpModal from '../../components/HelpModal';
import OptionsModal from '../../components/OptionsModal';

export default function LinkGlobalOrganizationScreen({ route }) {
  const { organization, user } = route.params;
  const city = user.city;
  const navigation = useNavigation();

  const [externalAllowed, setExternalAllowed] = useState(true);
  const [maxReward, setMaxReward] = useState('50');

  const [helpVisible, setHelpVisible] = useState(false);
  const [helpType, setHelpType] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openHelp = (type) => {
    setHelpType(type);
    setHelpVisible(true);
  };

  const handleLinkOrganization = async () => {
    if (!maxReward || isNaN(maxReward)) {
      Alert.alert('שגיאה', 'אנא הזן מספר תקין למקסימום מטבעות.');
      return;
    }

    try {
      await axios.post(`${config.SERVER_URL}/cityOrganizations/link`, {
        organizationId: organization._id,
        city,
        addedBy: user._id,
        externalRewardAllowed: externalAllowed,
        maxRewardPerVolunteering: Number(maxReward),
      });

      setModalVisible(true);
    } catch (error) {
      console.error('שגיאה בקישור עמותה:', error);
      if (error.response?.data?.message) {
        Alert.alert('שגיאה', error.response.data.message);
      } else {
        Alert.alert('שגיאה', 'לא ניתן לקשר את העמותה.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>קבע את מדיניות העמותה בעיר {city}</Text>

      <View style={styles.card}>
        <Image
          source={
            organization.imageUrl
              ? { uri: organization.imageUrl }
              : require('../../images/noImageFound.webp')
          }
          style={styles.image}
        />
        <Text style={styles.name}>{organization.name}</Text>
        {organization.description ? (
          <Text style={styles.description}>{organization.description}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>העמותה פעילה בערים הבאות:</Text>
        {organization.activeCities && organization.activeCities.length > 0 ? (
          organization.activeCities.map((cityName, index) => (
            <Text key={index} style={styles.cityName}>
              • {cityName}
            </Text>
          ))
        ) : (
          <Text style={styles.noCitiesText}>אין ערים פעילות עדיין.</Text>
        )}
      </View>

      {/* אפשר התנדבות בכל הארץ */}
      <View style={styles.optionRow}>
        <View style={styles.labelWithIcon}>
          <Text style={styles.optionText}>אפשר התנדבות בכל הארץ</Text>
          <TouchableOpacity onPress={() => openHelp('external')}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="#555"
              style={{ marginEnd: 8 }}
            />
          </TouchableOpacity>
        </View>
        <Switch value={externalAllowed} onValueChange={setExternalAllowed} />
      </View>

      <Text style={styles.explanation}>
        אם תבחר להגביל את ההתנדבות רק לעיר, תידרש יצירת אחראי עמותה בעיר. ניתן
        לבצע זאת גם בהמשך.
      </Text>

      {/* סכום מקסימלי */}
      <View style={styles.section}>
        <View style={styles.labelWithIcon}>
          <Text style={styles.sectionTitle}>
            הגדר סכום מטבעות מקסימלי להתנדבות:
          </Text>
          <TouchableOpacity onPress={() => openHelp('maxReward')}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="#555"
              style={{ marginEnd: 8 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={maxReward}
            onChangeText={setMaxReward}
            keyboardType="numeric"
            placeholder="לדוגמה: 50"
            textAlign="center"
          />
        </View>
      </View>

      {/* כפתור קישור */}
      <TouchableOpacity style={styles.button} onPress={handleLinkOrganization}>
        <Text style={styles.buttonText}>קשר עמותה לעיר</Text>
      </TouchableOpacity>

      {/* מודל עזרה */}
      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="מידע נוסף"
        message={
          helpType === 'external'
            ? 'אם תאפשר התנדבות בכל הארץ, מתנדבים יוכלו להשתתף בפעילויות גם מחוץ לעיר שלך.'
            : 'הגדרת סכום מקסימלי קובעת את מספר המטבעות המרבי שניתן להעניק לכל מתנדב עבור התנדבות אחת.'
        }
      />
      <OptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="קישור עמותה הושלם"
        subtitle="האם תרצה ליצור אחראי עמותה לעיר? ניתן גם להוסיף אחראי בהמשך."
        buttons={[
          {
            label: 'צור אחראי עמותה',
            color: '#2196F3',
            onPress: () => {
              setModalVisible(false);
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'CreateCommunityRep',
                    params: { city, cityOrganizationId: organization._id },
                  },
                ],
              });
            },
          },
          {
            label: 'אולי אחר כך',
            color: '#FF9800',
            onPress: () => {
              setModalVisible(false);
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'CommunityRepHomeScreen', params: { user } },
                  {
                    name: 'OrganizationManagerScreen',
                    params: { user },
                  },
                ],
              });
            },
          },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    writingDirection: 'rtl',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    writingDirection: 'rtl',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  cityName: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    marginStart: 10,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  labelWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    writingDirection: 'rtl',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    writingDirection: 'rtl',
    gap: 12, // מרווח קטן בין הטקסט לסוויץ'
    justifyContent: 'flex-start',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  explanation: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
    writingDirection: 'rtl',
  },
  inputWrapper: {
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    elevation: 2,
    width: '50%',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  noCitiesText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    marginStart: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
