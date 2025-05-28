import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import CustomCoinIcon from './CustomCoinIcon';
import theColor from '../constants/theColor';

export default function VolunteerCard({ volunteering, onPress }) {
  const spotsLeft = volunteering.totalSpots - volunteering.registeredSpots;
  const imageToUse =
    volunteering.imageUrl || volunteering.fallbackImageUrl || null;
  console.log('VolunteerCard props:', volunteering);

  return (
    <Pressable style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textArea}>
          <Text style={styles.title}>{volunteering.title}</Text>
          <Text style={styles.org}>עמותה: {volunteering.organizationName}</Text>
        </View>
        {imageToUse && (
          <Image source={{ uri: imageToUse }} style={styles.image} />
        )}
      </View>

      <Text style={styles.detail}>📍 {volunteering.city}</Text>
      <Text style={styles.detail}>
        🕒 {volunteering.date} בשעה {volunteering.time}
      </Text>

      <Text style={[styles.spotsText, spotsLeft === 0 && styles.fullText]}>
        {spotsLeft > 0
          ? `🟢 נותרו ${spotsLeft} מקומות`
          : '🔴 אין מקומות פנויים'}
      </Text>

      <View style={styles.row}>
        <View style={styles.rewardRow}>
          <CustomCoinIcon size={16} />
          <Text style={styles.rewardText}>
            {volunteering.rewardCoins} גוגואים
          </Text>
        </View>
        <Text style={styles.expText}>🎖️ {volunteering.exp} EXP</Text>
      </View>

      {volunteering.tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          {volunteering.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={() => onPress(volunteering)}
      >
        <Text style={styles.btnText}>לפרטים </Text>
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', // Clean white background
    borderRadius: 15, // More rounded corners for a modern look
    padding: 20, // More generous padding inside the card
    marginHorizontal: 12, // Space from screen edges
    marginVertical: 8, // Space between cards
    // Enhanced subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 8,
    elevation: 6, // Android shadow
    writingDirection: 'rtl', // Keep RTL for the card content
    overflow: 'hidden', // Ensures rounded corners clip content correctly
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start', // Align items to the start of the cross-axis
    marginBottom: 12, // More space below the top section
  },
  textArea: {
    flex: 1,
    marginRight: 12, // Space between text and image
    justifyContent: 'center', // Center text vertically if image is taller
  },
  title: {
    fontSize: 20, // Slightly larger and more prominent
    fontWeight: '700', // Bolder title
    textAlign: 'right',
    color: '#2a2a2a', // Darker for better contrast
    marginBottom: 4, // Small space below title
  },
  org: {
    fontSize: 15, // Clearer for organization name
    color: '#666', // Softer grey
    textAlign: 'right',
  },
  image: {
    width: 60, // Slightly larger image
    height: 60, // Slightly larger image
    borderRadius: 10, // More rounded image corners
    resizeMode: 'cover', // Ensure image covers the area nicely
  },
  detail: {
    fontSize: 15, // Consistent with org text
    color: '#4a4a4a', // Darker detail text for readability
    textAlign: 'right',
    marginTop: 6, // More space between details
  },
  spotsText: {
    fontSize: 16, // More prominent spots text
    fontWeight: '600', // Medium bold
    marginTop: 10, // More space above spots text
    textAlign: 'right',
    paddingVertical: 4, // Add some vertical padding
    paddingHorizontal: 8, // Add some horizontal padding
    borderRadius: 6, // Slightly rounded background
    alignSelf: 'flex-end', // Align text to the right within its container
    backgroundColor: '#e6f7ed', // Light green background for available spots
    color: '#2c7a7b', // Dark green text
  },
  fullText: {
    color: '#d9534f', // Red for full
    backgroundColor: '#ffe6e6', // Light red background for full
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15, // More space above reward/exp row
    borderTopWidth: 1, // Subtle separator
    borderColor: '#f0f0f0', // Light grey separator
    paddingTop: 12, // Padding above separator
  },
  rewardRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rewardText: {
    marginRight: 6, // Space from coin icon
    color: theColor.gold, // Keep gold for consistency
    fontWeight: '700', // Bolder for reward
    fontSize: 16, // Larger for reward
  },
  expText: {
    color: '#007bff', // Primary blue for EXP
    fontWeight: '700', // Bolder for EXP
    fontSize: 16, // Larger for EXP
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: 12, // More space above tags
  },
  tag: {
    backgroundColor: '#f2f2f2', // Lighter grey for tags
    borderRadius: 15, // More rounded, pill-like tags
    paddingHorizontal: 10, // More horizontal padding
    paddingVertical: 5, // More vertical padding
    margin: 3, // Small margin between tags
    borderWidth: 1, // Subtle border
    borderColor: '#e0e0e0', // Light border color
  },
  tagText: {
    fontSize: 13, // Slightly larger tag text
    color: '#555', // Softer color for tag text
    fontWeight: '500', // Medium bold
  },
  btn: {
    // השתמש בצבע ספציפי אם theColor.primary הוא לבן או לא מוגדר כצבע רצוי
    backgroundColor: '#4CAF50', // צבע ירוק חי ובולט לכפתור
    // אם theColor.primary אמור להיות צבע אחר ויש לו ערך תקין, השאר: backgroundColor: theColor.primary,
    paddingVertical: 14, // Taller button
    borderRadius: 10, // Rounded button corners
    marginTop: 20, // More space above the button
    alignItems: 'center',
    justifyContent: 'center', // Center text horizontally and vertically
    // Add a slight shadow to the button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  btnText: {
    color: 'white',
    fontSize: 17, // Larger button text
    fontWeight: '700', // Bolder button text
  },
});
