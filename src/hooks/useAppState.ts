import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Customer, Order, OrderStatus, Template } from '../types';
import { supabase, requireSupabaseConfig, isSupabaseConfigured } from '../lib/supabaseClient';
import { createOrder, deleteOrderById, fetchOrders, importOrders, updateOrderById } from '../services/orderService';
import { PREDEFINED_TEMPLATES, seedTemplatesIfEmpty } from '../services/templateService';

const STORAGE_KEY_ORDERS = 'warungify_orders';
const LEGACY_STORAGE_KEY_ORDERS = 'wa_order_manager_orders';
const getImportFlagKey = (userId: string) => `warungify_imported_${userId}`;
const getLegacyImportFlagKey = (userId: string) => `wa_order_manager_imported_${userId}`;

const getSavedLocalOrders = () => (
  localStorage.getItem(STORAGE_KEY_ORDERS) || localStorage.getItem(LEGACY_STORAGE_KEY_ORDERS)
);

const getSeedDemoOrders = (): Order[] => {
  const now = new Date();
  const getPastDateString = (daysAgo: number, hoursAgo = 0) => {
    const d = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
    return d.toISOString();
  };

  return [
    {
      id: 'demo-order-1',
      orderNumber: 'ORD-001',
      customerName: 'Ahmad Subarjo',
      whatsappNumber: '6281234567890',
      productName: 'Gamis Silk Premium',
      quantity: 2,
      totalPrice: 700000,
      notes: 'Minta transfer via Mandiri. Warna Navy & Maroon.',
      status: 'pending_payment',
      createdAt: getPastDateString(2, 4),
      updatedAt: getPastDateString(2, 4),
    },
    {
      id: 'demo-order-2',
      orderNumber: 'ORD-002',
      customerName: 'Siti Rahma',
      whatsappNumber: '6289876543210',
      productName: 'Sambal Cumi Ciamik (200g)',
      quantity: 3,
      totalPrice: 135000,
      notes: 'Kirim pakai GoSend Sameday. Level pedas 5.',
      status: 'paid',
      createdAt: getPastDateString(0, 4),
      updatedAt: getPastDateString(0, 4),
    },
    {
      id: 'demo-order-3',
      orderNumber: 'ORD-003',
      customerName: 'Budi Santoso',
      whatsappNumber: '6285211223344',
      productName: 'Kopi Susu Gula Aren (1L)',
      quantity: 1,
      totalPrice: 85000,
      notes: 'Less sugar, no ice. Kirim jam 10 pagi.',
      status: 'paid',
      createdAt: getPastDateString(0, 1),
      updatedAt: getPastDateString(0, 1),
    },
    {
      id: 'demo-order-4',
      orderNumber: 'ORD-004',
      customerName: 'Dewi Lestari',
      whatsappNumber: '6287766554433',
      productName: 'Hijab Bella Square',
      quantity: 5,
      totalPrice: 125000,
      notes: 'Warna: Hitam 2, Navy 2, Mocca 1. Tolong dipack rapi kado.',
      status: 'packing',
      createdAt: getPastDateString(3, 2),
      updatedAt: getPastDateString(3, 2),
    },
    {
      id: 'demo-order-5',
      orderNumber: 'ORD-005',
      customerName: 'Rian Hidayat',
      whatsappNumber: '6281399887766',
      productName: 'Kaos Polos Cotton Combed 30s',
      quantity: 2,
      totalPrice: 130000,
      notes: 'Kirim J&T Reguler. Ukuran L dua-duanya.',
      status: 'shipped',
      trackingNumber: '',
      createdAt: getPastDateString(0, 12),
      updatedAt: getPastDateString(0, 12),
    },
    {
      id: 'demo-order-6',
      orderNumber: 'ORD-006',
      customerName: 'Eka Wijaya',
      whatsappNumber: '6281288776655',
      productName: 'Gamis Silk Premium',
      quantity: 1,
      totalPrice: 350000,
      notes: 'Warna Rose Gold. Bonus bros hijab.',
      status: 'done',
      trackingNumber: 'JN129083980ID',
      createdAt: getPastDateString(5, 1),
      updatedAt: getPastDateString(5, 1),
    },
    {
      id: 'demo-order-7',
      orderNumber: 'ORD-007',
      customerName: 'Fitri Astuti',
      whatsappNumber: '6289944332211',
      productName: 'Hijab Bella Square',
      quantity: 10,
      totalPrice: 250000,
      notes: 'Reseller discount applied.',
      status: 'done',
      trackingNumber: 'JN129083981ID',
      createdAt: getPastDateString(6, 3),
      updatedAt: getPastDateString(6, 3),
    },
    {
      id: 'demo-order-8',
      orderNumber: 'ORD-008',
      customerName: 'Gani Prasetyo',
      whatsappNumber: '6281122334455',
      productName: 'Roti Bakar Bandung Cokelat',
      quantity: 4,
      totalPrice: 120000,
      notes: 'Batal karena pembeli salah alamat kirim.',
      status: 'cancelled',
      createdAt: getPastDateString(1, 6),
      updatedAt: getPastDateString(1, 6),
    },
  ];
};

type OrderDraft = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>;

const normalizeLocalOrder = (order: Order): Order => ({
  ...order,
  orderNumber: order.orderNumber || order.id,
});

const makeOrderNumber = (orders: Order[]) => {
  const nextIdNumber = orders.reduce((max, order) => {
    const source = order.orderNumber || order.id;
    const num = parseInt(source.replace('ORD-', ''), 10);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0) + 1;

  return `ORD-${String(nextIdNumber).padStart(3, '0')}`;
};

const collateCustomers = (orders: Order[]) => {
  const customerMap = new Map<string, {
    name: string;
    whatsappNumber: string;
    totalOrders: number;
    totalSpending: number;
    lastOrderDate: string;
  }>();

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  sortedOrders.forEach((order) => {
    const cleanPhone = order.whatsappNumber.trim();
    if (!cleanPhone) return;

    const existing = customerMap.get(cleanPhone);
    const isCancelled = order.status === 'cancelled';
    const orderPrice = isCancelled ? 0 : order.totalPrice;

    if (existing) {
      existing.name = order.customerName;
      existing.totalOrders += 1;
      existing.totalSpending += orderPrice;
      if (new Date(order.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      customerMap.set(cleanPhone, {
        name: order.customerName,
        whatsappNumber: cleanPhone,
        totalOrders: 1,
        totalSpending: orderPrice,
        lastOrderDate: order.createdAt,
      });
    }
  });

  return Array.from(customerMap.values()).map((customer, index): Customer => ({
    id: `CUST-${String(index + 1).padStart(3, '0')}`,
    ...customer,
  }));
};

export const useAppState = (user: User | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [canImportLocalOrders, setCanImportLocalOrders] = useState(false);

  const customers = useMemo(() => collateCustomers(orders), [orders]);

  const refreshData = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setTemplates([]);
      setCanImportLocalOrders(false);
      return;
    }

    if (user.id === 'demo-user') {
      const savedOrders = localStorage.getItem('warungify_demo_orders');
      let parsedOrders: Order[] = [];
      if (savedOrders) {
        parsedOrders = JSON.parse(savedOrders);
      } else {
        parsedOrders = getSeedDemoOrders();
        localStorage.setItem('warungify_demo_orders', JSON.stringify(parsedOrders));
      }

      const savedTemplates = localStorage.getItem('warungify_demo_templates');
      let parsedTemplates: Template[] = [];
      if (savedTemplates) {
        parsedTemplates = JSON.parse(savedTemplates);
      } else {
        parsedTemplates = PREDEFINED_TEMPLATES.map((t) => ({ ...t, id: t.type }));
        localStorage.setItem('warungify_demo_templates', JSON.stringify(parsedTemplates));
      }

      setOrders(parsedOrders);
      setTemplates(parsedTemplates);
      setCanImportLocalOrders(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setDataError('Supabase env belum dikonfigurasi. Isi .env dari .env.example.');
      setOrders([]);
      setTemplates(PREDEFINED_TEMPLATES.map((template) => ({ ...template, id: template.type })));
      return;
    }

    setIsDataLoading(true);
    setDataError(null);
    try {
      const [remoteOrders, remoteTemplates] = await Promise.all([
        fetchOrders(),
        seedTemplatesIfEmpty(user.id),
      ]);
      setOrders(remoteOrders);
      setTemplates(remoteTemplates);

      const localOrders = getSavedLocalOrders();
      const importedFlag =
        localStorage.getItem(getImportFlagKey(user.id)) ||
        localStorage.getItem(getLegacyImportFlagKey(user.id));
      setCanImportLocalOrders(Boolean(localOrders && !importedFlag && remoteOrders.length === 0));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to load Supabase data.');
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const addOrder = useCallback(async (orderData: OrderDraft) => {
    if (!user) throw new Error('Login required before creating orders.');
    const orderNumber = makeOrderNumber(orders);

    if (user.id === 'demo-user') {
      const nowStr = new Date().toISOString();
      const newOrder: Order = {
        id: `demo-order-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        orderNumber,
        customerName: orderData.customerName,
        whatsappNumber: orderData.whatsappNumber,
        productName: orderData.productName,
        quantity: orderData.quantity,
        totalPrice: orderData.totalPrice,
        notes: orderData.notes,
        status: orderData.status,
        trackingNumber: orderData.trackingNumber,
        invoiceSentAt: orderData.invoiceSentAt,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setOrders((prev) => {
        const next = [newOrder, ...prev];
        localStorage.setItem('warungify_demo_orders', JSON.stringify(next));
        return next;
      });
      return newOrder;
    }

    const newOrder = await createOrder(user.id, orderNumber, orderData);
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [orders, user]);

  const updateOrder = useCallback(async (id: string, updatedFields: Partial<OrderDraft>) => {
    if (user?.id === 'demo-user') {
      const target = orders.find(o => o.id === id);
      if (!target) throw new Error('Order not found.');
      const updatedOrder = {
        ...target,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === id ? updatedOrder : order));
        localStorage.setItem('warungify_demo_orders', JSON.stringify(next));
        return next;
      });
      return updatedOrder;
    }

    const updatedOrder = await updateOrderById(id, updatedFields);
    setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)));
    return updatedOrder;
  }, [orders, user]);

  const deleteOrder = useCallback(async (id: string) => {
    const order = orders.find((item) => item.id === id);
    const confirmed = window.confirm(`Are you sure you want to delete order ${order?.orderNumber || id}?`);
    if (!confirmed) return false;

    if (user?.id === 'demo-user') {
      setOrders((prev) => {
        const next = prev.filter((item) => item.id !== id);
        localStorage.setItem('warungify_demo_orders', JSON.stringify(next));
        return next;
      });
      return true;
    }

    await deleteOrderById(id);
    setOrders((prev) => prev.filter((item) => item.id !== id));
    return true;
  }, [orders, user]);

  const importLocalOrders = useCallback(async () => {
    if (!user) throw new Error('Login required before importing orders.');
    requireSupabaseConfig();
    const saved = getSavedLocalOrders();
    if (!saved) return [];

    const parsed = JSON.parse(saved) as Order[];
    const normalized = parsed.map(normalizeLocalOrder);
    const imported = await importOrders(user.id, normalized);
    localStorage.setItem(getImportFlagKey(user.id), 'true');
    setCanImportLocalOrders(false);
    setOrders((prev) => [...imported, ...prev].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ));

    await supabase.from('profiles').update({ local_orders_imported: true }).eq('id', user.id);
    return imported;
  }, [user]);

  const dismissLocalImport = useCallback(() => {
    if (!user) return;
    localStorage.setItem(getImportFlagKey(user.id), 'declined');
    setCanImportLocalOrders(false);
  }, [user]);

  const getStatusCount = useCallback((status: OrderStatus) => {
    return orders.filter((order) => order.status === status).length;
  }, [orders]);

  return {
    orders,
    customers,
    templates,
    isDataLoading,
    dataError,
    canImportLocalOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    importLocalOrders,
    dismissLocalImport,
    refreshData,
    getStatusCount,
  };
};

export type AppState = ReturnType<typeof useAppState>;
