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

function ItemGridTile({
  title,
  price,
  img,
  deleteMode = false,
  onDelete,
  onPress,
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
        },
      ]}
    >
      {deleteMode && (
        <Pressable style={styles.deleteIcon} onPress={onDelete}>
          <Icon name="remove-circle" size={25} color="red" />
        </Pressable>
      )}

      <Pressable
        android_ripple={{ color: '#ccc' }}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        disabled={deleteMode}
        onPress={!deleteMode ? onPress : null}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text>מחיר {price} </Text>

          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
              onError={(err) => console.log('שגיאה בטעינת תמונה', err)}
            />
          </View>
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
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
});
