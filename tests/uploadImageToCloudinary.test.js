import { uploadImageToCloudinary } from '../utils/cloudinary';

beforeEach(() => {
  fetch.resetMocks();
});

describe('uploadImageToCloudinary', () => {
  test('should return secure_url on success', async () => {
    const mockUrl = 'https://example.com/image.jpg';
    fetch.mockResponseOnce(JSON.stringify({ secure_url: mockUrl }));

    const result = await uploadImageToCloudinary('file:///path/to/image.jpg');
    expect(result).toBe(mockUrl);
  });

  test('should return null on failure (bad response)', async () => {
    fetch.mockReject(() => Promise.reject('Network error'));

    const result = await uploadImageToCloudinary('file:///path/to/image.jpg');
    expect(result).toBeNull();
  });

  test('should return null if secure_url is missing', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await uploadImageToCloudinary('file:///path/to/image.jpg');
    expect(result).toBeNull();
  });
});
