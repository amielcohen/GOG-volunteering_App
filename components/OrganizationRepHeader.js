import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function OrganizationRepHeader({
  repName,
  organizationName,
  organizationImage,
  cities,
  backgroundColor = '#f2f2f2',
  onImagePress,
}) {
  const cityText =
    cities.length === 1
      ? `עיר: ${cities[0]?.name}`
      : `ערים: ${cities.map((c) => c.name).join(', ')}`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity onPress={onImagePress}>
        <Image source={organizationImage} style={styles.image} />
      </TouchableOpacity>

      <Text style={styles.repText}>שלום {repName} 👋</Text>
      <Text style={styles.orgName}>{organizationName}</Text>
      <Text style={styles.cityText}>{cityText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  repText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  cityText: {
    fontSize: 16,
    color: '#444',
    marginTop: 8,
  },
});
