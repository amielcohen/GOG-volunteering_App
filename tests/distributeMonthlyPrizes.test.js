const distributeMonthlyPrizes = require('../utils/cron/distributeMonthlyPrizes');
const MonthlyPrize = require('../my-backend/models/MonthlyPrize');
const MonthlyStats = require('../my-backend/models/MonthlyStats');
const UserMessage = require('../my-backend/models/UserMessage');
const User = require('../my-backend/models/Users');

jest.mock('../my-backend/models/MonthlyPrize');
jest.mock('../my-backend/models/MonthlyStats');
jest.mock('../my-backend/models/UserMessage');
jest.mock('../my-backend/models/Users');

describe('distributeMonthlyPrizes', () => {
  const fakeDate = new Date(2025, 0, 15); // ינואר => צריך לחלק עבור דצמבר

  const mockUser = {
    _id: 'user1',
    username: 'testuser',
    firstName: 'Test',
    GoGs: 0,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    let callCount = 0;
    MonthlyPrize.find.mockImplementation(({ type }) => {
      callCount++;
      // מחזיר פרסים רק לקריאה הראשונה (minutes), ולאחר מכן גם ל-count
      return Promise.resolve([
        {
          city: 'city123',
          prizes: [{ place: 1, type: 'gog', value: 10 }],
        },
      ]);
    });

    MonthlyStats.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => ({
          populate: () =>
            Promise.resolve([
              {
                userId: mockUser,
              },
            ]),
        }),
      }),
    }));

    UserMessage.prototype.save = jest.fn().mockResolvedValue(true);
  });

  test('should assign GoGs and send messages to top users', async () => {
    await expect(distributeMonthlyPrizes(fakeDate)).resolves.not.toThrow();

    // 2 סוגי פרסים, בכל אחד פרס 1 = 2 קריאות
    expect(UserMessage.prototype.save).toHaveBeenCalledTimes(2);
    expect(mockUser.save).toHaveBeenCalledTimes(2);
  });

  test('should log error if DB fails', async () => {
    MonthlyStats.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => ({
          populate: () => {
            throw new Error('DB failure');
          },
        }),
      }),
    }));

    await expect(distributeMonthlyPrizes(fakeDate)).rejects.toThrow(
      'DB failure'
    );
  });
});
