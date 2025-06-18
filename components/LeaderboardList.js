import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

export default function LeaderboardList({
  data,
  currentUserId,
  sortBy = 'minutes', // 'minutes' or 'count'
}) {
  // מבטיח שנקבל בדיוק 10 מקומות
  const filledData = [...data];
  while (filledData.length < 10) {
    filledData.push(null); // ייצוג מקום ריק
  }

  // פונקציית עזר לבחירת צבע רקע ומסגרת בהתאם למקום
  const getPlaceStyles = (index) => {
    switch (index) {
      case 0: // מקום ראשון - זהב
        return {
          backgroundColor: '#FFD700', // זהב מלא
          borderColor: '#DAA520', // זהב כהה יותר
        };
      case 1: // מקום שני - כסף
        return {
          backgroundColor: '#C0C0C0', // כסף מלא
          borderColor: '#A9A9A9', // כסף כהה יותר
        };
      case 2: // מקום שלישי - ארד
        return {
          backgroundColor: '#CD7F32', // ארד מלא
          borderColor: '#8B4513', // ארד כהה יותר
        };
      default:
        return {
          backgroundColor: 'white', // רקע לבן רגיל
          borderColor: '#E0E0E0', // אפור בהיר
        };
    }
  };

  const renderItem = ({ item, index }) => {
    const place = index + 1;
    const isCurrentUser = item?.userId?._id === currentUserId;
    const placeStyles = getPlaceStyles(index);

    if (!item) {
      return (
        <View style={styles.emptyRow}>
          <Text style={styles.placeText}>#{place}</Text>
          <Text style={styles.emptyText}>מקום פנוי</Text>
          {/* Added a View to hold space for alignment */}
          <View style={styles.valuePlaceholder} />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.row,
          placeStyles, // סגנונות המקום (זהב, כסף, ארד, או רגיל)
          isCurrentUser && styles.currentUserRow, // מסגרת בולטת למשתמש הנוכחי
        ]}
      >
        <Text
          style={[
            styles.placeText,
            // צבע טקסט מיוחד למשתמש הנוכחי רק אם הוא לא במקומות 1-3
            isCurrentUser && (index >= 3 ? styles.currentUserPlaceText : {}),
            // צבע טקסט לבן למקומות מדורגים (1-3)
            (index === 0 || index === 1 || index === 2) &&
              styles.rankedPlaceText,
          ]}
        >
          <Text>#{place}</Text>
        </Text>

        <View style={styles.userInfo}>
          {item.userId.profilePic ? (
            <Image
              source={{ uri: item.userId.profilePic }}
              style={styles.avatar}
            />
          ) : (
            // פלייס הולדר לתמונה אם אין
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>?</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {item.userId.firstName} {item.userId.lastName}
          </Text>
        </View>

        <Text style={styles.valueText}>
          {sortBy === 'minutes'
            ? `${item.totalMinutes} דקות`
            : `${item.totalVolunteeringCount} התנדבויות`}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={filledData}
      keyExtractor={(item, index) => item?._id || `empty-${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer} // סגנונות כלליים לרשימה
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20, // רווח למטה
    paddingTop: 10, // רווח למעלה
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1, // מסגרת לכל שורה
    borderRadius: 12, // פינות מעוגלות יותר
    marginVertical: 6, // רווח אנכי בין שורות
    marginHorizontal: 4, // רווח צידי
    elevation: 2, // צל עדין לאפקט עומק
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  // סגנונות ייחודיים למקומות 1-3
  goldRow: {
    backgroundColor: '#FFD700', // זהב
    borderColor: '#DAA520',
  },
  silverRow: {
    backgroundColor: '#C0C0C0', // כסף
    borderColor: '#A9A9A9',
  },
  bronzeRow: {
    backgroundColor: '#CD7F32', // ארד
    borderColor: '#8B4513',
  },
  rankedPlaceText: {
    color: 'white', // טקסט לבן למקומות 1-3
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // צל קטן לטקסט
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // סגנונות למשתמש הנוכחי
  currentUserRow: {
    borderWidth: 3, // מסגרת עבה יותר
    borderColor: '#3242a8',
    // **חשוב:** אין כאן backgroundColor כדי לא לדרוס את צבע המדליה
  },
  currentUserPlaceText: {
    color: 'black', // צבע טקסט למקום של המשתמש הנוכחי (כשהוא לא במדליה)
    fontWeight: 'bold', // הדגשה
  },
  placeText: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 45, // רוחב קבוע למספר המקום
    textAlign: 'center',
    color: '#555', // צבע טקסט רגיל למקום
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10, // רווח בין תמונה לשם
    flex: 1, // מאפשר תפיסת שטח
  },
  avatar: {
    width: 40, // גודל גדול יותר לתמונה
    height: 40,
    borderRadius: 20, // חצי עיגול מושלם
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D3D3D3', // אפור בהיר לפלייס הולדר
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    color: '#888',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 17,
    fontWeight: '600', // עובי בינוני-בולט
    color: '#333',
    maxWidth: '70%', // מגביל רוחב כדי למנוע גלישה
  },
  valueText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A5276', // כחול כהה לערכים
    minWidth: 100, // רוחב מינימלי ליישור
    textAlign: 'left', // יישור לשמאל כי אנחנו ב-RTL
  },
  emptyRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    backgroundColor: '#F8F8F8', // רקע בהיר יותר לשורה ריקה
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D3D3D3', // מסגרת אפורה לשורה ריקה
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#A0A0A0', // אפור כהה יותר לטקסט ריק
    flex: 1, // כדי שיתפרס על שטח זמין
    textAlign: 'center',
  },
  valuePlaceholder: {
    minWidth: 100, // שומר מקום ליישור כמו ה-valueText
  },
});
