/**
 * Profile Service
 * Handles API calls related to user profiles
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: 'Active' | 'Busy' | 'Offline';
  customStatus?: string;
  mfaEnabled?: boolean;
  emailNotifications?: boolean;
  createdAt?: number;
  activeSessions?: {
    device: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: string;
  customStatus?: string;
  mfaEnabled?: boolean;
  emailNotifications?: boolean;
  imageUrl?: string | null;
}

export interface SecurityUpdateData {
  mfaEnabled?: boolean;
  mfaMethod?: 'app' | 'sms' | 'none';
  passwordLastChanged?: string;
}

/**
 * Fetch user profile data
 * @param userId User ID
 * @returns Promise with user data
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    // In a real implementation, this would be an API call
    // For now, simulate a network delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: userId,
      name: 'User Name',
      email: 'user@example.com',
      // ... other user data
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Update user profile data
 * @param userId User ID
 * @param profileData Updated profile data
 * @returns Promise 
 */
export const updateUserProfile = async (userId: string, profileData: ProfileUpdateData) => {
  try {
    // Simulate API call
    console.log('Updating profile for user:', userId, profileData);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

/**
 * Update user security settings
 * @param userId User ID
 * @param securityData Security settings data
 * @returns Promise
 */
export const updateUserSecurity = async (userId: string, securityData: SecurityUpdateData) => {
  try {
    // Simulate API call
    console.log('Updating security settings for user:', userId, securityData);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return { success: true, message: 'Security settings updated successfully' };
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw new Error('Failed to update security settings');
  }
};

/**
 * Upload profile image
 * @param imageFile File or Blob to upload
 * @returns Promise with image URL
 */
export const uploadProfileImage = async (imageFile: File | Blob | string) => {
  try {
    // Simulate file upload
    console.log('Uploading profile image:', typeof imageFile);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In a real implementation, this would return the URL from the server
    return 'https://example.com/path/to/image.jpg';
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
};
