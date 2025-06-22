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

  const isLocked = volunteering.isLockedByLevel;
  const lockMessage = `🔒 דרוש רמה ${volunteering.minLevel || ''} להצטרפות`;
  console.log('isLocked', isLocked);
  return (
    <View style={[styles.card, isLocked && styles.lockedCard]}>
      {isLocked && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedOverlayText}>{lockMessage}</Text>
        </View>
      )}

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

      <View
        style={[
          styles.spotsPill,
          spotsLeft === 0 ? styles.fullSpotsPill : styles.availableSpotsPill,
        ]}
      >
        <Text
          style={[
            styles.spotsText,
            spotsLeft === 0 ? styles.fullText : styles.availableText,
          ]}
        >
          {spotsLeft > 0
            ? `🟢 נותרו ${spotsLeft} מקומות`
            : '🔴 אין מקומות פנויים'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.rewardRow}>
          <CustomCoinIcon size={18} />
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
        style={[styles.btn, isLocked ? styles.btnLocked : styles.btnActive]}
        onPress={isLocked ? null : () => onPress(volunteering)}
        disabled={isLocked}
      >
        <Text
          style={[
            styles.btnText,
            isLocked ? styles.btnTextLocked : styles.btnTextActive,
          ]}
        >
          {isLocked ? '' : 'לפרטים '}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    writingDirection: 'rtl',
    overflow: 'hidden',
  },
  lockedCard: {
    borderColor: '#FFEBEE',
    borderWidth: 2,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 18,
    padding: 20,
  },
  lockedOverlayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  textArea: {
    flex: 1,
    marginRight: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
    color: '#222222',
    marginBottom: 6,
  },
  org: {
    fontSize: 16,
    color: '#606060',
    textAlign: 'right',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  detail: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'right',
    marginTop: 8,
  },
  spotsPill: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 15,
  },
  availableSpotsPill: {
    backgroundColor: '#E8F5E9',
  },
  fullSpotsPill: {
    backgroundColor: '#FFEBEE',
  },
  spotsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  availableText: {
    color: '#388E3C',
  },
  fullText: {
    color: '#D32F2F',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  rewardRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rewardText: {
    marginRight: 8,
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: 17,
  },
  expText: {
    color: '#2196F3',
    fontWeight: '800',
    fontSize: 17,
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  btnActive: {
    backgroundColor: '#64B5F6',
  },
  btnLocked: {
    backgroundColor: '#FFCDD2',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  btnTextActive: {
    color: '#1A237E',
  },
  btnTextLocked: {
    color: '#C62828',
  },
});
