import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FillProfileModal from '../../components/FillProfileModal';
import axios from 'axios';
import config from '../../config';
import OrganizationRepHeader from '../../components/OrganizationRepHeader';

export default function OrganizationRepHomeScreen({ route, navigation }) {
  const { user: initialUser } = route.params;
  const [user, setUser] = useState(initialUser);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [volunteeringList, setVolunteeringList] = useState([]);
  const cities = user.cities?.length > 0 ? user.cities : [user.city];

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${config.SERVER_URL}/auth/profile/${initialUser._id}`
        );
        const fullUser = res.data;
        setUser(fullUser);

        if (!fullUser.firstName || !fullUser.lastName) {
          setShowModal(true);
        }

        try {
          const vRes = await axios.get(
            `${config.SERVER_URL}/volunteerings/by-org-rep/${initialUser._id}`
          );
          setVolunteeringList(vRes.data);
        } catch (volErr) {
          console.warn('לא נמצאו התנדבויות או שהראוט לא קיים עדיין');
        }
      } catch (err) {
        console.error('שגיאה בטעינת הנתונים:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('organization:', user.organization);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const handleNavigate = (screen) => {
    navigation.navigate(screen, { user });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <OrganizationRepHeader
          repName={user.firstName + ' ' + user.lastName}
          organizationName={user.organization?.name}
          organizationImage={
            user.organization?.imageUrl
              ? { uri: user.organization.imageUrl }
              : require('../../images/noImageFound.webp')
          }
          cities={cities}
          backgroundColor="#e6f0ff"
          onImagePress={() => setModalVisible(true)}
        />

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('CreateVolunteering')}
        >
          <Icon name="add-circle" size={28} color="#007bff" />
          <Text style={styles.actionText}>צור התנדבות חדשה</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('ManageVolunteering')}
        >
          <Icon name="event" size={28} color="#007bff" />
          <Text style={styles.actionText}>התנדבויות פעילות ועתידיות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('Attendance')}
        >
          <Icon name="check-circle" size={28} color="#007bff" />
          <Text style={styles.actionText}>סימון נוכחות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('Reports')}
        >
          <Icon name="bar-chart" size={28} color="#007bff" />
          <Text style={styles.actionText}>צפייה בדוחות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => handleNavigate('EditOrganizationProfile')}
        >
          <Icon name="settings" size={24} color="#999" />
          <Text style={styles.secondaryText}>עריכת פרטי עמותה</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Modal להצגת תמונת הפרופיל המוגדלת */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={
              user.organization.imageUrl
                ? { uri: user.organization.imageUrl }
                : require('../../images/defaultProfile.png')
            }
            style={styles.enlargedImage}
          />
        </Pressable>
      </Modal>

      {showModal && (
        <FillProfileModal
          userId={user._id}
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
