// This file provides a type-safe interface for user profile operations

// Types for our user profile data
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

export type ProfileUpdateData = Partial<Omit<UserProfile, 'id' | 'createdAt' | 'activeSessions'>>;

/**
 * Fetch a user's profile data
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // For now, return mock data
  // Once Convex is properly integrated, replace with actual API call
  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    imageUrl: "https://avatars.githubusercontent.com/u/1234567?v=4",
    bio: "Frontend developer passionate about UI/UX",
    jobTitle: "Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    status: "Active",
    mfaEnabled: false,
    emailNotifications: true,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    activeSessions: [
      {
        device: "Chrome on Mac",
        lastActive: "Active now",
        isCurrent: true
      },
      {
        device: "Safari on iPhone",
        lastActive: "2 hours ago",
        isCurrent: false
      }
    ]
  };
}

/**
 * Update a user's profile data
 */
export async function updateUserProfile(
  userId: string, 
  data: ProfileUpdateData
): Promise<UserProfile> {
  console.log('Updating profile for user', userId, 'with data', data);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return the updated profile (mock)
  return {
    id: userId,
    name: data.name || "John Doe",
    email: data.email || "john@example.com",
    phone: data.phone || "+1 555-123-4567",
    imageUrl: data.imageUrl || "https://avatars.githubusercontent.com/u/1234567?v=4",
    bio: data.bio || "Frontend developer passionate about UI/UX",
    jobTitle: data.jobTitle || "Software Engineer",
    department: data.department || "Engineering",
    location: data.location || "San Francisco, CA",
    status: data.status as any || "Active",
    customStatus: data.customStatus,
    mfaEnabled: data.mfaEnabled !== undefined ? data.mfaEnabled : false,
    emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    activeSessions: [
      {
        device: "Chrome on Mac",
        lastActive: "Active now",
        isCurrent: true
      },
      {
        device: "Safari on iPhone",
        lastActive: "2 hours ago",
        isCurrent: false
      }
    ]
  };
}

/**
 * Update a user's security settings
 */
export async function updateUserSecurity(
  userId: string, 
  data: { mfaEnabled: boolean }
): Promise<{ success: boolean }> {
  console.log('Updating security settings for user', userId, 'with data', data);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true };
}

/**
 * Upload a profile image
 */
export async function uploadProfileImage(
  file: File | Blob | string
): Promise<string> {
  console.log('Uploading profile image');
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, the server would return the URL of the uploaded image
  return typeof file === 'string' ? file : 'https://avatars.githubusercontent.com/u/1234567?v=4';
}
