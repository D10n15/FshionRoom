/*
  # Add Currency Support to Products

  1. Changes
    - Add `currency` column to products table (defaults to 'MXN')
    - Allows users to select between USD, MXN, EUR
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'currency'
  ) THEN
    ALTER TABLE products ADD COLUMN currency text DEFAULT 'MXN';
  END IF;
END $$;
