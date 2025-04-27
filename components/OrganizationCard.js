import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  I18nManager,
} from 'react-native';

export default function OrganizationCard({
  organization,
  onPrimaryAction, // פונקציה לכפתור הראשי (מחק / בחר)
  onViewDetails, // פונקציה לכפתור הצגת פרטים
  showButtons = true,
  primaryButtonLabel = 'מחק', // כברירת מחדל 'מחק' (כי זה אדמין)
  viewDetailsLabel = 'פרטים',
}) {
  return (
    <View style={styles.card}>
      <View style={styles.innerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{organization.name}</Text>

          {organization.description ? (
            <Text style={styles.text}>{organization.description}</Text>
          ) : null}

          {organization.type ? (
            <Text style={styles.text}>
              <Text style={styles.label}>סוג: </Text>
              {organization.type}
            </Text>
          ) : null}

          {Array.isArray(organization.activeCities) ? (
            <Text style={styles.text}>
              <Text style={styles.label}>פעילה ב: </Text>
              {organization.activeCities.length} ערים
            </Text>
          ) : null}

          {organization.contactEmail ? (
            <Text style={styles.text}>
              <Text style={styles.label}>אימייל: </Text>
              {organization.contactEmail}
            </Text>
          ) : null}

          {organization.phone ? (
            <Text style={styles.text}>
              <Text style={styles.label}>טלפון: </Text>
              {organization.phone}
            </Text>
          ) : null}
        </View>

        <Image
          source={
            organization.imageUrl
              ? { uri: organization.imageUrl }
              : require('../images/noImageFound.webp')
          }
          style={styles.image}
        />
      </View>

      {showButtons && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewDetails}
          >
            <Text style={styles.secondaryButtonText}>{viewDetailsLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPrimaryAction}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#333',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#F44336', // כפתור ראשי (מחק) בצבע אדום
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#2196F3', // כפתור משני (פרטים) בצבע כחול
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
