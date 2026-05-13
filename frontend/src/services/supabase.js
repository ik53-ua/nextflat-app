import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generic function to upload any image to a specific bucket
export const uploadImage = async (bucket, file) => {
  try {
    // 1. Generate a unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // 3. Retrieve the public URL to save in the database
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Function to upload property photos
export const uploadPropertyPhoto = async (file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const fileName = `${Date.now()}-${uniqueId}.${fileExt}`;
    const filePath = `inmueble-photos/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('inmuebles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from('inmuebles')
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading property photo:', error);
    return null;
  }
};

// Function to delete property photo
export const deletePropertyPhoto = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('inmuebles')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting property photo:', error);
    return false;
  }
};