import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomCoinIcon from '../../components/CustomCoinIcon';

function ItemGridTile({
  title,
  price,
  img,
  deleteMode = false,
  onDelete,
  onPress,
  locked = false,
  level = 0,
  cityManger = false,
  stock = 0,
}) {
  const fallbackImage = require('../../images/noImageFound.webp');

  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (deleteMode) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(shakeX, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeY, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(shakeX, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeY, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(shakeX, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeY, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      shakeX.setValue(0);
      shakeY.setValue(0);
    }
  }, [deleteMode]);

  const imageSource = !img || img === '' ? fallbackImage : img;

  return (
    <Animated.View
      style={[
        styles.griditem,
        {
          transform: [{ translateX: shakeX }, { translateY: shakeY }],
          opacity: locked ? 0.4 : 1,
        },
      ]}
    >
      {deleteMode && (
        <Pressable
          style={styles.deleteIcon}
          onPress={() => {
            console.log('נלחץ כפתור מחיקה');
            onDelete();
          }}
        >
          <Icon name="remove-circle" size={25} color="red" />
        </Pressable>
      )}

      <Pressable
        android_ripple={{ color: '#ccc' }}
        style={({ pressed }) => [
          styles.button,
          pressed && !locked && styles.buttonPressed,
        ]}
        disabled={deleteMode || locked}
        onPress={!deleteMode && !locked ? onPress : null}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>מחיר: {price} </Text>
            <CustomCoinIcon size={15} style={styles.gogoIcon} />
          </View>

          {locked && (
            <Text style={styles.lockedText}>🔒 רמה נדרשת: {level}</Text>
          )}
          {!locked && <Text style={styles.levelText}> רמה נדרשת: {level}</Text>}

          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onError={(err) => console.log('שגיאה בטעינת תמונה', err)}
            />
          </View>
          {cityManger && <Text style={styles.levelText}> מלאי: {stock}</Text>}

          {locked && (
            <View style={styles.lockOverlay}>
              <Icon name="lock" size={30} color="#888" />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default ItemGridTile;

const styles = StyleSheet.create({
  griditem: {
    width: '48%',
    margin: '1%',
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.25,
    elevation: 4,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    position: 'relative',
  },
  innerContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  priceText: {
    fontSize: 14,
    color: '#444',
  },
  levelText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  lockedText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 999,
    elevation: 10, // לאנדרואיד
    pointerEvents: 'auto',
    backgroundColor: 'rgba(255,255,255,0.8)', // כדי לוודא שהוא תופס מקום
    borderRadius: 12,
    padding: 2,
  },

  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#444',
  },
  gogoIcon: {
    marginRight: 4,
  },
});
