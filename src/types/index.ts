export interface Cake {
  id: number;
  name: string;
  weight: string;
  price: string;
  price_range?: string;
  type: string;
  selling_type: 'returnable' | 'permanent';
  description?: string;
  images: string[];
  video?: string;
  is_available: boolean;
  likes: number;
  average_rating?: number;
  rating_count?: number;
  comments?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  cake_id: number;
  visitor_name: string;
  comment: string;
  created_at: string;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  phone: string;
  address: string;
}

export interface Admin {
  username: string;
  token?: string;
}

export interface CakeFormData {
  name: string;
  weight: string;
  price: string;
  price_range?: string;
  type: string;
  selling_type: 'returnable' | 'permanent';
  description?: string;
  is_available: boolean;
}
