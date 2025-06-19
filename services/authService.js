import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

/**
 * שמירת userId באחסון המקומי
 */
export const saveUserId = async (userId) => {
  try {
    if (!userId) throw new Error('userId לא תקין');
    await AsyncStorage.setItem('userId', userId);
  } catch (err) {
    console.error('❌ שגיאה בשמירת userId:', err.message || err);
  }
};

/**
 * טוען את פרטי המשתמש על בסיס userId שנשמר.
 * מחזיר null אם אין userId או אם הקריאה נכשלה.
 */
export const loadUserFromStorage = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.warn('⚠️ לא נמצא userId באחסון');
      return null;
    }

    const res = await axios.get(`${config.SERVER_URL}/auth/profile/${userId}`);
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      console.warn('⚠️ המשתמש לא קיים בשרת');
    } else {
      console.error(
        '❌ שגיאה בטעינת משתמש מ-AsyncStorage:',
        err.message || err
      );
    }
    return null;
  }
};

/**
 * מחיקת userId מהאחסון המקומי
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userId');
  } catch (err) {
    console.error('❌ שגיאה במחיקת userId:', err.message || err);
  }
};
