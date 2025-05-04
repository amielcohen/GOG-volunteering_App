// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

// שומר את מזהה המשתמש בזיכרון המקומי
export const saveUserId = async (userId) => {
  try {
    await AsyncStorage.setItem('userId', userId);
  } catch (err) {
    console.error('שגיאה בשמירת userId:', err);
  }
};

// טוען את פרטי המשתמש מהשרת על בסיס ה-id שנשמר
export const loadUserFromStorage = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return null;

    const res = await axios.get(`${config.SERVER_URL}/auth/profile/${userId}`);
    return res.data;
  } catch (err) {
    console.error('שגיאה בטעינת משתמש מ-AsyncStorage:', err);
    return null;
  }
};

// מסיר את המשתמש מהזיכרון המקומי
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userId');
  } catch (err) {
    console.error('שגיאה במחיקת userId:', err);
  }
};
