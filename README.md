# WashMate - Laundry Service App

WashMate is a comprehensive laundry service management application built with React Native and Expo. It provides a platform for customers to schedule laundry pickups and for administrators to manage orders through their lifecycle.

## Features

### Customer Features
- User authentication (login, register, password reset)
- Schedule laundry pickups with service selection
- Track order status in real-time
- View order history and details
- Multiple service options (Wash & Fold, Wash & Iron, Bedsheets, etc.)

### Admin Features
- Dashboard with order statistics
- Order management by status (Pending, Picked Up, Processing, Ready, Delivered)
- Update order status, weight, and cost
- Add admin notes to orders
- View customer details

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/washmate.git
cd washmate
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npx expo start
```

## Supabase Setup

### Database Schema

The app requires the following tables in your Supabase database:

1. **profiles** - Stores user profile information
   - id (UUID, primary key, references auth.users)
   - email (string, unique)
   - full_name (string)
   - phone_number (string)
   - is_admin (boolean)
   - created_at (timestamp)

2. **orders** - Stores laundry order information
   - id (UUID, primary key)
   - user_id (UUID, foreign key to profiles)
   - pickup_date (date)
   - pickup_time (time)
   - laundry_type (string: 'wash_fold', 'wash_iron', 'bedsheets', etc.)
   - weight_estimate (decimal)
   - weight_kg (decimal) - Actual weight after measurement
   - cost_inr (decimal) - Final cost in Indian Rupees
   - special_instructions (text)
   - status (string: 'pending', 'picked_up', 'processing', 'ready', 'delivered')
   - total_cost (decimal) - Estimated cost
   - address (text) - Customer address
   - admin_notes (text) - Notes for admin use
   - created_at (timestamp)
   - updated_at (timestamp)

### Database Setup

Run the following SQL in your Supabase SQL Editor to set up the required tables and columns:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  pickup_date DATE,
  pickup_time TEXT,
  laundry_type TEXT,
  weight_estimate DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  cost_inr DECIMAL(10,2),
  special_instructions TEXT,
  status TEXT DEFAULT 'pending',
  total_cost DECIMAL(10,2),
  address TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
```

### Authentication Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email/Password sign-in method
3. Configure email templates for verification and password reset

## App Structure

```
washmate/
├── app/                    # Expo Router app directory
│   ├── (auth)/             # Authentication screens
│   ├── (customer)/         # Customer screens
│   │   └── (tabs)/         # Tab navigation screens
│   ├── (admin)/            # Admin screens
│   └── _layout.tsx         # Root layout
├── assets/                 # Static assets
├── components/             # Reusable components
├── constants/              # App constants
├── hooks/                  # Custom hooks
├── lib/                    # Library code (Supabase client)
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Key Files

- `lib/supabase.ts` - Supabase client configuration
- `stores/auth.ts` - Authentication state management
- `utils/format.ts` - Formatting utilities for currency, dates, etc.
- `types/index.ts` - TypeScript type definitions

## Testing

The app includes testing tools for quick admin access:

1. On the login screen, use the "Create Admin User" button to create a test admin account
2. Use "Quick Admin Login" to automatically fill in admin credentials
3. Default admin credentials:
   - Email: admin@example.com
   - Password: admin123

## Troubleshooting

### Common Issues

1. **Foreign key constraint errors during registration**
   - This can happen if the profile is created before the auth user is fully registered
   - Solution: The app includes a delay between auth user creation and profile creation

2. **Missing columns in database**
   - If you see errors about missing columns, run the SQL script in the Supabase Setup section
   - Make sure all required columns exist in your tables

3. **Authentication issues**
   - Check that your Supabase URL and anon key are correct in the .env file
   - Ensure email authentication is enabled in your Supabase dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work

## Acknowledgments

- Expo team for the excellent React Native framework
- Supabase team for the backend services