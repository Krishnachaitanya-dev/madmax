-- This SQL script adds the necessary columns to the orders table
-- Run this in your Supabase SQL Editor

-- Add weight_kg column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);

-- Add cost_inr column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_inr DECIMAL(10,2);

-- Add address column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;

-- Add admin_notes column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Make sure the profiles table has the necessary columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Sample data for testing (uncomment if needed)
-- INSERT INTO profiles (id, full_name, email, phone_number, is_admin)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', '+919876543210', true),
--   ('00000000-0000-0000-0000-000000000002', 'Customer User', 'customer@example.com', '+919876543211', false);