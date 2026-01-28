
export type Category = string;

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description?: string;
  image?: string;
  icon?: string; // Fallback if image isn't perfect
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
