import axios from 'axios';

const CLOUD_NAME = 'your_cloud_name';
const UPLOAD_PRESET = 'your_upload_preset';

export const uploadImageToCloudinary = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg'
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};