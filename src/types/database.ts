export type ListingType = 'SALE' | 'DONATION' | 'TRADE';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'PENDING';
export type Condition = 'New' | 'Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts';

export interface AppUser {
  id: string;
  name: string;
  city: string;
  zip: string;
  reputation_score: number;
  karma_points: number;
  avatar_url: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  condition: Condition;
  price_cents: number;
  type: ListingType;
  status: ListingStatus;
  created_at: string;
  circle_id?: string; // Added field for location filtering
  // Joined fields
  seller?: AppUser;
  images?: ListingMedia[];
  distance?: number; // Calculated field
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  storage_path: string;
}

export interface Circle {
  id: string;
  name: string;
  zip_center: string;
  image_url: string;
}

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string; // ISO timestamp
  updated_at: string;
  // Computed for UI
  other_user?: AppUser;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'MESSAGE' | 'SYSTEM' | 'TRANSACTION';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface Story {
  id: string;
  circle_id?: string; 
  media_url: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  cta_text?: string;
  cta_link?: string;
  expires_at: string;
  created_at: string;
}