import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Store = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  domain: string | null;
  logo_url: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Integration = {
  id: string;
  store_id: string;
  platform_name: string;
  platform_type: string;
  api_key: string;
  config: Record<string, any>;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  source: string;
  order_data: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Analytics = {
  id: string;
  store_id: string;
  date: string;
  views: number;
  sales: number;
  revenue: number;
  source: string;
  created_at: string;
};
