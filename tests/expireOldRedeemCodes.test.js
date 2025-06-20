// tests/expireOldRedeemCodes.test.js

import { expireOldRedeemCodes } from '../utils/cron/expireOldRedeemCodes.js';
import RedeemCode from '../my-backend/models/RedeemCode.js';

jest.mock('../my-backend/models/RedeemCode.js');

describe('expireOldRedeemCodes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should expire pending codes older than threshold', async () => {
    RedeemCode.find.mockResolvedValue([{ _id: 'code1' }, { _id: 'code2' }]);

    RedeemCode.updateMany.mockResolvedValue({ modifiedCount: 2 });

    const count = await expireOldRedeemCodes(new Date('2020-01-01'));

    expect(RedeemCode.find).toHaveBeenCalledWith({
      createdAt: { $lt: new Date('2020-01-01') },
      status: 'pending',
    });

    expect(RedeemCode.updateMany).toHaveBeenCalledWith(
      { createdAt: { $lt: new Date('2020-01-01') }, status: 'pending' },
      { $set: { status: 'expired' } }
    );

    expect(count).toBe(2);
  });

  test('should return 0 if no codes to expire', async () => {
    RedeemCode.find.mockResolvedValue([]);

    const count = await expireOldRedeemCodes(new Date('2020-01-01'));

    expect(RedeemCode.find).toHaveBeenCalled();
    expect(RedeemCode.updateMany).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  test('should throw and log error if query fails', async () => {
    const error = new Error('DB error');
    RedeemCode.find.mockRejectedValue(error);

    await expect(expireOldRedeemCodes(new Date('2020-01-01'))).rejects.toThrow(
      'DB error'
    );
  });
});
