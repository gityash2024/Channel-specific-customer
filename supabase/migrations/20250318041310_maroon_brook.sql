-- This script completely disables RLS on all tables
-- WARNING: Only use this for development/POC environments

-- Disable RLS on channels table
ALTER TABLE IF EXISTS channels DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read channels" ON channels;
DROP POLICY IF EXISTS "Allow authenticated users to insert channels" ON channels;
DROP POLICY IF EXISTS "Allow authenticated users to update channels" ON channels;
DROP POLICY IF EXISTS "Allow authenticated users to delete channels" ON channels;
DROP POLICY IF EXISTS "Service role bypass for channels" ON channels;

-- Disable RLS on customers table
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON customers;
DROP POLICY IF EXISTS "Service role bypass for customers" ON customers;

-- Disable RLS on customer_channels table
ALTER TABLE IF EXISTS customer_channels DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read customer_channels" ON customer_channels;
DROP POLICY IF EXISTS "Allow authenticated users to insert customer_channels" ON customer_channels;
DROP POLICY IF EXISTS "Allow authenticated users to update customer_channels" ON customer_channels;
DROP POLICY IF EXISTS "Allow authenticated users to delete customer_channels" ON customer_channels;
DROP POLICY IF EXISTS "Service role bypass for customer_channels" ON customer_channels;

-- Create tables if they don't exist already (backup approach)
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  allow_global_login boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, channel_id)
);