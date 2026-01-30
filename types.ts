
export type Category = string; // This represents the UUID ID

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  image?: string;
  icon?: string; // Fallback if image isn't perfect
  available: boolean;
}

export interface Accompaniment {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedAccompaniments?: Accompaniment[];
}

export interface StoreMessage {
  id: string;
  title: string;
  message: string;
  is_default: boolean;
}

export interface StoreSchedule {
  id: string;
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
  message_id: string | null;
  is_open: boolean;
  day_of_week?: number | null;
  created_at?: string;
}

export interface StoreConfig {
  id: number;
  is_open: boolean;
  active_message_id: string | null;
  use_schedule: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  icon_key: string;
}

