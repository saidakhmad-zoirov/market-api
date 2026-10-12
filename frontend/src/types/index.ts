// Backend serializerlariga aynan mos tiplar (backend/*/serializers.py)

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CategoryShort {
  id: number;
  name: string;
  slug: string;
}

export interface Category extends CategoryShort {
  description: string;
  product_count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string; // DRF DecimalField satr ko'rinishida qaytaradi
  stock: number;
  in_stock: boolean;
  image: string | null;
  is_active: boolean;
  category: CategoryShort;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductOrdering = "-created_at" | "price" | "-price" | "name" | "-sold_count";

export interface ProductQuery {
  search?: string;
  category?: string;
  ordering?: ProductOrdering;
  page?: number;
  page_size?: number;
  min_price?: string;
  max_price?: string;
  in_stock?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  is_staff: boolean;
  date_joined: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password2: string;
}

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  image: string | null;
  category: CategoryShort;
}

export interface CartItem {
  id: number;
  product: CartProduct;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  image: string | null;
}

export interface Order {
  id: number;
  status: OrderStatus;
  status_display: string;
  full_name: string;
  phone: string;
  address: string;
  comment: string;
  total_price: string;
  items_count: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutPayload {
  full_name: string;
  phone: string;
  address: string;
  comment?: string;
}
