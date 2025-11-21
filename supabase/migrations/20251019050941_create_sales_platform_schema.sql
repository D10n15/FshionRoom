/*
  # Sales Platform Database Schema

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text)
      - `domain` (text, unique)
      - `logo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `stock` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `integrations`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `platform_name` (text) - e.g., 'Facebook', 'Instagram', 'WooCommerce', 'Custom API'
      - `platform_type` (text) - e.g., 'social_media', 'marketplace', 'ecommerce', 'analytics'
      - `api_key` (text, encrypted)
      - `config` (jsonb) - stores platform-specific configuration
      - `is_active` (boolean)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `customer_name` (text)
      - `customer_email` (text)
      - `total_amount` (decimal)
      - `status` (text) - 'pending', 'processing', 'completed', 'cancelled'
      - `source` (text) - which integration/platform the order came from
      - `order_data` (jsonb) - stores order details
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `analytics`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `date` (date)
      - `views` (integer)
      - `sales` (integer)
      - `revenue` (decimal)
      - `source` (text) - which integration/platform
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own store data
    - Store owners have full control over their stores, products, orders, and integrations
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  domain text UNIQUE,
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stores"
  ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stores"
  ON stores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  platform_name text NOT NULL,
  platform_type text NOT NULL,
  api_key text DEFAULT '',
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = integrations.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = integrations.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = integrations.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = integrations.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = integrations.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  source text DEFAULT 'direct',
  order_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views integer DEFAULT 0,
  sales integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0,
  source text DEFAULT 'direct',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = analytics.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = analytics.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_integrations_store_id ON integrations(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_store_id ON analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);