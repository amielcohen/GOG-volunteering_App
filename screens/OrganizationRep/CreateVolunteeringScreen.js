import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import VolunteeringStep1 from '../../components/VolunteeringCreation/VolunteeringStep1';
import VolunteeringStep2 from '../../components/VolunteeringCreation/VolunteeringStep2';
import VolunteeringStep3 from '../../components/VolunteeringCreation/VolunteeringStep3';

export default function CreateVolunteeringScreen({ route, navigation }) {
  const { user } = route.params;

  useEffect(() => {
    if (user) {
      console.log('organization:', user.organization);
    }
  }, [user]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    durationMinutes: '',
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
    // נוכל להוסיף כאן שליחה לשרת בהמשך
    console.log('Submitting volunteering:', formData);
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
