export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_slug?: string;
  category_name?: string;
  subcategory?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  previous_price?: number | null;
  stock: number;
  image_url: string;
  active: boolean;
  featured: boolean;
  is_offer: boolean;
  unit?: string; // e.g. "kg", "unidad", "bandeja"
  created_at?: string;
  updated_at?: string;
}

export interface ComboItem {
  id?: string;
  combo_id?: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit?: string;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  image_url: string;
  active: boolean;
  featured: boolean;
  category?: string;
  items?: ComboItem[];
  items_summary?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // product id or combo id
  type: 'product' | 'combo';
  item: Product | Combo;
  quantity: number;
  unit_price: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'otro';
export type DeliveryMethod = 'domicilio' | 'retiro';
export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'EN CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  neighborhood: string;
  notes?: string;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  subtotal: number;
  delivery_cost: number;
  total: number;
  status: OrderStatus;
  items?: OrderItem[];
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  role: 'admin' | 'customer';
  created_at?: string;
}
