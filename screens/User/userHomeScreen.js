import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomCoinIcon from '../../components/CustomCoinIcon';
import axios from 'axios';
import config from '../../config';
import levelTable from '../../constants/levelsList';
export default function UserHomeScreen({ route, navigation }) {
  const { user: initialUser } = route.params;
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    console.log('USER INfo Home  ', user);
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${config.SERVER_URL}/auth/profile/${initialUser._id}`
        );
        setUser(res.data);
      } catch (err) {
        console.error('שגיאה בטעינת המשתמש:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const nextLevelXP = levelTable[user.level]?.requiredExp || 100;
  const progress = Math.min((user.exp / nextLevelXP) * 100, 100);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image
              source={
                user.profilePic
                  ? { uri: user.profilePic }
                  : require('../../images/defaultProfile.png')
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.greeting}>שלום {user.firstName} </Text>
          <Text style={styles.level}>
            רמה {user.level} | {user.exp}/{nextLevelXP} נק&quot;נ
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.gogsContainer}>
            <CustomCoinIcon size={20} style={styles.gogoIcon} />
            <Text style={styles.gogs}>גוגואים: {user.GoGs}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyVolunteerings', { user })}
        >
          <Icon name="event" size={28} color="#007bff" />
          <Text style={styles.actionText}>ההתנדבויות שלי</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('SearchVolunteering', { user })}
        >
          <Icon name="search" size={28} color="#007bff" />
          <Text style={styles.actionText}>מצא התנדבויות חדשות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('giftshop', { user })}
        >
          <Icon name="shopping-cart" size={28} color="#007bff" />
          <Text style={styles.actionText}>חנות התגמולים</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => {
            console.log(' edit profile press');
            navigation.navigate('EditProfile', { user });
          }}
        >
          <Icon name="settings" size={24} color="#999" />
          <Text style={styles.secondaryText}>עריכת פרופיל</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* מודל לתמונה מוגדלת */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setImageModalVisible(false)}
        >
          <Image
            source={
              user.profilePic
                ? { uri: user.profilePic }
                : require('../../images/defaultProfile.png')
            }
            style={styles.enlargedImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e6f0ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  level: { fontSize: 16, color: '#666', marginBottom: 8 },
  gogsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  gogs: { fontSize: 16, color: '#444', marginRight: 6, marginLeft: 8 },
  gogoIcon: { marginLeft: 16 },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    fontSize: 18,
    marginRight: 12,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 12,
    borderRadius: 10,
  },
  secondaryText: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '80%',
    height: '60%',
    borderRadius: 12,
  },
});
