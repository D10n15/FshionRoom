/*
  # Create Sales Feed for Public Product Listings

  1. New Table
    - `sales_feed` - Public feed where store owners can share their product sales
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `store_id` (uuid, foreign key to stores)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text) - Custom title for the feed post
      - `description` (text) - Post description
      - `image_url` (text) - Product image
      - `price` (decimal) - Product price
      - `is_featured` (boolean) - Whether to feature the post
      - `view_count` (integer) - Track views
      - `share_count` (integer) - Track shares
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on sales_feed table
    - All authenticated users can view active feed posts
    - Only store owners can create/update/delete their own feed posts
    - Public view policy for all authenticated users
    - Ownership check for modification operations
*/

CREATE TABLE IF NOT EXISTS sales_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price decimal(10,2) NOT NULL,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all feed posts"
  ON sales_feed FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Store owners can create feed posts"
  ON sales_feed FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = sales_feed.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update own feed posts"
  ON sales_feed FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can delete own feed posts"
  ON sales_feed FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sales_feed_store_id ON sales_feed(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_feed_user_id ON sales_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_feed_created_at ON sales_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_feed_featured ON sales_feed(is_featured);
