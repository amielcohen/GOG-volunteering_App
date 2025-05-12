export const uploadImageToCloudinary = async (imageUri) => {
  let filename = imageUri.split('/').pop();
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : 'image';

  let formData = new FormData();
  formData.append('file', { uri: imageUri, name: filename, type });
  formData.append('upload_preset', 'GOG-ProfilesIMG');

  try {
    let response = await fetch(
      'https://api.cloudinary.com/v1_1/drlrtt5dz/image/upload',
      {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    let data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error('שגיאה בהעלאת תמונה:', error);
    return null;
  }
};
