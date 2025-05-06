import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VolunteeringStep1 from '../../components/VolunteeringCreation/VolunteeringStep1';
import VolunteeringStep2 from '../../components/VolunteeringCreation/VolunteeringStep2';
import VolunteeringStep3 from '../../components/VolunteeringCreation/VolunteeringStep3';
import config from '../../config';

export default function CreateVolunteeringScreen({ route, navigation }) {
  const { user } = route.params;

  useEffect(() => {
    console.log('user:', user);
    console.log('user.organization:', user.organization);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    durationMinutes: '',
    maxParticipants: '', // ✅ נוסף
    isRecurring: false,
    recurringDay: null,
    createdBy: user._id,
    organizationId:
      typeof user.organization === 'object'
        ? user.organization._id
        : user.organization,
    tags: [],
    city: user.cities?.length === 1 ? user.cities[0].name || '' : '',
    address: '',
    notes: '',
    usePredictionModel: false,
    customRewardByCity: {},
    percentageReward: '',
    imageUrl: '',
  });

  const [currentStep, setCurrentStep] = useState(1);

  const goToNextStep = () => setCurrentStep((prev) => prev + 1);
  const goToPrevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      // ✅ הכנה של הנתונים למניעת שדות מחרוזתיים במספרים
      const preparedFormData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants) || null,
        durationMinutes: parseInt(formData.durationMinutes) || 0,
      };

      const response = await fetch(
        `${config.SERVER_URL}/volunteerings/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preparedFormData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log('ההתנדבות נשמרה בהצלחה:', data);
        navigation.reset({
          index: 0,
          routes: [{ name: 'OrganizationRepHomeScreen', params: { user } }],
        });
      } else {
        console.error('שגיאה בשמירת ההתנדבות:', data.message);
        alert('שגיאה: ' + (data.message || 'לא ניתן לשמור את ההתנדבות'));
      }
    } catch (error) {
      console.error('שגיאה כללית בשמירת ההתנדבות:', error);
      alert('שגיאה: לא ניתן להתחבר לשרת');
    }
  };

  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <VolunteeringStep1
          formData={formData}
          setFormData={setFormData}
          onNext={goToNextStep}
        />
      )}

      {currentStep === 2 && (
        <VolunteeringStep2
          formData={formData}
          setFormData={setFormData}
          onNext={goToNextStep}
          onBack={goToPrevStep}
          user={user}
        />
      )}

      {currentStep === 3 && (
        <VolunteeringStep3
          formData={formData}
          onBack={goToPrevStep}
          onSubmit={handleSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
