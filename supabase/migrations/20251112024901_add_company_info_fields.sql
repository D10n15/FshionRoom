/*
  # Add Company Information Fields to Products

  1. Changes
    - Add `company_name` column to products table
    - Add `company_nit` column to products table
    - Add `company_email` column to products table
    - Add `company_whatsapp` column to products table
    - These fields allow sellers to display their company information to buyers
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE products ADD COLUMN company_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'company_nit'
  ) THEN
    ALTER TABLE products ADD COLUMN company_nit text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'company_email'
  ) THEN
    ALTER TABLE products ADD COLUMN company_email text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'company_whatsapp'
  ) THEN
    ALTER TABLE products ADD COLUMN company_whatsapp text DEFAULT '';
  END IF;
END $$;
