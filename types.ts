
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  icon: string; // Font Awesome class
}

export interface Subcategory {
  id: string;
  name: string;
  icon?: string;
}

export enum AdStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string; // Main category ID
  subcategory: string; // Subcategory ID
  images: string[]; // URLs or base64 strings
  userId: string; // User ID of the owner
  status: AdStatus;
  rejectionReason?: string;
  createdAt: number; // Timestamp
  contactInfo?: string; // e.g., Telegram username
  city: string; // New field: City of the product/seller
  condition: ProductCondition; // New field: Condition of the product
}

export interface Message {
  id: string;
  adId: string;
  senderId: string; 
  receiverId: string; 
  text: string;
  timestamp: number;
  read: boolean;
}

export interface User {
  id: string;
  username: string; 
  password?: string; // Password will be stored in plain text in localStorage for this version (INSECURE)
  createdAt: number; // Timestamp of user registration
}

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, passwordAttempt: string) => Promise<User | null>;
  register: (username: string, passwordAttempt: string) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
}

// For mocked sample data generation. These are not for active user sessions.
export const SAMPLE_USER_ID_1 = 'sampleUser123';
export const SAMPLE_USER_ID_2 = 'sampleSellerABC';
export const SAMPLE_USER_ID_3 = 'anotherSampleSellerXYZ';
// Admin user will be handled in AuthContext
