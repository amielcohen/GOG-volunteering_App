import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function CityHeader({ title, cityName, color = '#2196F3' }) {
  return (
    <View style={[styles.headerContainer, { backgroundColor: color }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.cityName}>
        {cityName ? `עיר: ${cityName}` : 'עיר לא ידועה'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cityName: {
    fontSize: 16,
    color: '#ddd',
    marginTop: 5,
  },
});
