export type OrderStatus = 'pending_payment' | 'paid' | 'packing' | 'shipped' | 'done' | 'cancelled';

export interface Order {
  id: string; // Supabase UUID
  orderNumber: string; // e.g., ORD-001
  customerName: string;
  whatsappNumber: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  notes: string;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface Customer {
  id: string;
  name: string;
  whatsappNumber: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate: string; // ISO String or date string
}

export type TemplateType = 'order_format' | 'payment_confirmation' | 'processing' | 'shipping';

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  body: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  localOrdersImported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRow {
  id: string;
  user_id: string;
  order_number: string;
  customer_name: string;
  whatsapp_number: string;
  product_name: string;
  quantity: number;
  total_price: number;
  notes: string;
  status: OrderStatus;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateRow {
  id: string;
  user_id: string;
  type: TemplateType;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}
