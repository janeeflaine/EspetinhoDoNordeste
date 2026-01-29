
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
