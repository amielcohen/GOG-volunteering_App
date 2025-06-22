import { calculateExpFromMinutes } from './expUtils';
import { calculateRewardCoins } from './rewardUtils';

export function adaptVolunteeringForCard(
  volunteering,
  { cityOrganizationEntry, user }
) {
  console.log('Adapting volunteering for card:', volunteering.title);

  const approvedVolunteers =
    volunteering.registeredVolunteers?.filter((v) => v.status === 'approved') ||
    [];

  const duration = volunteering.durationMinutes || 0;
  const exp = calculateExpFromMinutes(duration);
  const rewardCoins = calculateRewardCoins(volunteering, cityOrganizationEntry);

  const minLevel = volunteering.minlevel || 0;
  const userLevel = user?.level || 0;
  const isLockedByLevel = userLevel < minLevel;

  return {
    title: volunteering.title,
    description: volunteering.description,
    organizationName: cityOrganizationEntry?.name || 'עמותה',
    city: volunteering.city,
    date: formatDate(volunteering.date),
    time: formatTime(volunteering.date),
    durationInMinutes: duration,
    exp,
    rewardCoins,
    imageUrl: volunteering.imageUrl || cityOrganizationEntry?.imageUrl || null,
    fallbackImageUrl: cityOrganizationEntry?.imageUrl || null,
    totalSpots: volunteering.maxParticipants || 0,
    registeredSpots: approvedVolunteers.length,
    tags: volunteering.tags || [],
    notesForVolunteers: volunteering.notesForVolunteers || '',
    address: volunteering.address || '',
    _id: volunteering._id || '',
    minLevel,
    isLockedByLevel,
    phone: cityOrganizationEntry.phone,
    contactEmail: cityOrganizationEntry.contactEmail,
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
