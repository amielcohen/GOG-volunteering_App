// tests/closeVolunteeringHandlers.test.js

import {
  handleApprovedVolunteer,
  handleMissedVolunteer,
} from '../utils/closeVolunteeringHandlers';

jest.mock('../my-backend/models/MonthlyStats', () => ({
  findOneAndUpdate: jest.fn(),
}));

jest.mock(
  '../my-backend/models/UserMessage',
  () =>
    function (data) {
      return {
        save: jest.fn(),
      };
    }
);

describe('handleApprovedVolunteer', () => {
  test('should update user EXP, level, and GoGs correctly', async () => {
    const user = {
      _id: 'user1',
      exp: 0,
      level: 1,
      GoGs: 0,
      city: 'Netivot',
      save: jest.fn(),
    };

    const volunteering = {
      title: 'Test Volunteering',
      durationMinutes: 600, // 10 hours
      date: new Date('2025-06-01T00:00:00Z'),
      reward: 50, // Added to enable GoGs calculation
    };

    const cityOrgEntry = { maxRewardPerVolunteering: 100 };
    const organizationName = 'עמותת בדיקה';

    const result = await handleApprovedVolunteer({
      user,
      volunteering,
      cityOrgEntry,
      organizationName,
    });

    expect(user.GoGs).toBeGreaterThan(0);
    expect(user.level).toBeGreaterThanOrEqual(1);
    expect(user.exp).toBeGreaterThanOrEqual(0);
    expect(user.save).toHaveBeenCalled();
    expect(result.GoGs).toBeDefined();
    expect(result.newLevel).toBe(user.level);
  });
});

describe('handleMissedVolunteer', () => {
  test('should add bad point and not block immediately', async () => {
    const user = {
      _id: 'user2',
      badPoints: [],
      save: jest.fn(),
    };

    const volunteering = {
      title: 'Missed Test Volunteering',
      date: new Date('2025-06-01T00:00:00Z'),
    };

    const organizationName = 'עמותת חסד';

    const result = await handleMissedVolunteer({
      user,
      volunteering,
      organizationName,
    });

    expect(user.badPoints.length).toBe(1);
    expect(user.blockedUntil).toBeUndefined();
    expect(user.save).toHaveBeenCalled();
    expect(result.badPoints).toBe(1);
  });

  test('should block user after 3 bad points in range', async () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

    const user = {
      _id: 'user3',
      badPoints: [recent, recent],
      save: jest.fn(),
    };

    const volunteering = {
      title: 'Another Missed Volunteering',
      date: now,
    };

    const organizationName = 'עמותת חסד';

    const result = await handleMissedVolunteer({
      user,
      volunteering,
      organizationName,
    });

    expect(user.badPoints.length).toBe(3);
    expect(user.blockedUntil).toBeDefined();
    expect(result.badPoints).toBe(3);
    expect(result.blockedUntil).toBeInstanceOf(Date);
  });
});
