import type { Order, OrderRow } from '../types';
import { supabase, requireSupabaseConfig } from '../lib/supabaseClient';

type OrderInput = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>;

export const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name,
  whatsappNumber: row.whatsapp_number,
  productName: row.product_name,
  quantity: row.quantity,
  totalPrice: row.total_price,
  notes: row.notes,
  status: row.status,
  trackingNumber: row.tracking_number || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toOrderInsert = (userId: string, orderNumber: string, order: OrderInput) => ({
  user_id: userId,
  order_number: orderNumber,
  customer_name: order.customerName,
  whatsapp_number: order.whatsappNumber,
  product_name: order.productName,
  quantity: order.quantity,
  total_price: order.totalPrice,
  notes: order.notes,
  status: order.status,
  tracking_number: order.trackingNumber || null,
});

const toOrderUpdate = (order: Partial<OrderInput>) => ({
  ...(order.customerName !== undefined ? { customer_name: order.customerName } : {}),
  ...(order.whatsappNumber !== undefined ? { whatsapp_number: order.whatsappNumber } : {}),
  ...(order.productName !== undefined ? { product_name: order.productName } : {}),
  ...(order.quantity !== undefined ? { quantity: order.quantity } : {}),
  ...(order.totalPrice !== undefined ? { total_price: order.totalPrice } : {}),
  ...(order.notes !== undefined ? { notes: order.notes } : {}),
  ...(order.status !== undefined ? { status: order.status } : {}),
  ...(order.trackingNumber !== undefined ? { tracking_number: order.trackingNumber || null } : {}),
});

export const fetchOrders = async () => {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(mapOrderRow);
};

export const createOrder = async (userId: string, orderNumber: string, order: OrderInput) => {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('orders')
    .insert(toOrderInsert(userId, orderNumber, order))
    .select('*')
    .single();
  if (error) throw error;
  return mapOrderRow(data as OrderRow);
};

export const updateOrderById = async (id: string, order: Partial<OrderInput>) => {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('orders')
    .update(toOrderUpdate(order))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapOrderRow(data as OrderRow);
};

export const deleteOrderById = async (id: string) => {
  requireSupabaseConfig();
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
};

export const importOrders = async (userId: string, orders: Order[]) => {
  requireSupabaseConfig();
  const rows = orders.map((order) => ({
    ...toOrderInsert(userId, order.orderNumber || order.id, order),
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  }));
  if (rows.length === 0) return [];
  const { data, error } = await supabase.from('orders').insert(rows).select('*');
  if (error) throw error;
  return (data as OrderRow[]).map(mapOrderRow);
};
