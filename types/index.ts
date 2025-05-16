export type OrderStatus = 'pending' | 'picked_up' | 'processing' | 'ready' | 'delivered';

export type LaundryType = 'wash_fold' | 'wash_iron' | 'bedsheets' | 'quilts' | 'curtains' | 'shoes';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  is_admin: boolean;
  address?: string; // Added address field as optional
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string | number;
  user_id: string;
  created_at: string;
  pickup_date: string;
  pickup_time: string;
  laundry_type: string;
  weight_estimate: number;
  weight_kg?: number;
  special_instructions?: string;
  status: OrderStatus;
  total_cost: number;
  cost_inr?: number;
  address?: string;
  admin_notes?: string;
  profiles?: Profile;
}

export const SERVICES = [
  {
    service_type: 'wash_fold',
    name: 'Normal Clothes Wash & Fold',
    price: 100,
    unit: '/kg',
    description: 'Advanced wash, stain pre-treat, free pickup & delivery, 24 h turnaround'
  },
  {
    service_type: 'wash_iron',
    name: 'Normal Clothes Wash & Steam Iron',
    price: 150,
    unit: '/kg',
    description: 'Steam iron, fabric softener, express 24 h, precise ironing',
    popular: true
  },
  {
    service_type: 'bedsheets',
    name: 'Bedsheets - Wash & Fold',
    price: 130,
    unit: '/kg',
    description: 'Professional cleaning for all types of bedsheets'
  },
  {
    service_type: 'quilts',
    name: 'Quilts - Wash & Fold',
    price: 150,
    unit: '/kg',
    description: 'Deep cleaning for quilts and comforters'
  },
  {
    service_type: 'curtains',
    name: 'Curtains - Wash & Fold',
    price: 140,
    unit: '/kg',
    description: 'Specialized cleaning for all types of curtains'
  },
  {
    service_type: 'shoes',
    name: 'Shoes',
    price: 250,
    unit: '/pair',
    description: 'Detailed finishing & fabric protection'
  }
];