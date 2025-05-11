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
    <Pressable style={styles.card} onPress={() => onPress(volunteering)}>
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

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>לפרטים והרשמה</Text>
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 10,
    elevation: 3,
    writingDirection: 'rtl',
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  org: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  detail: {
    fontSize: 13,
    color: '#555',
    textAlign: 'right',
    marginTop: 4,
  },
  spotsText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    color: '#2c7a7b',
    textAlign: 'right',
  },
  fullText: {
    color: '#cc0000',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rewardRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rewardText: {
    marginRight: 6,
    color: theColor.gold,
    fontWeight: '600',
  },
  expText: {
    color: '#0077cc',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  btn: {
    backgroundColor: theColor.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
