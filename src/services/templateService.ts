import type { Template, TemplateRow, TemplateType } from '../types';
import { supabase, requireSupabaseConfig } from '../lib/supabaseClient';

export const PREDEFINED_TEMPLATES: Array<Omit<Template, 'id'>> = [
  {
    type: 'order_format',
    name: 'Order Format (Copy to Client)',
    body: 'Format Pesanan:\nNama: \nWhatsApp: \nProduk: \nJumlah: 1\nTotal Harga: \nCatatan: ',
  },
  {
    type: 'payment_confirmation',
    name: 'Payment Confirmation',
    body: 'Halo {nama},\n\nPesanan Anda sudah kami terima.\n\nTotal pembayaran: Rp {total}\n\nTerima kasih.',
  },
  {
    type: 'processing',
    name: 'Processing Order',
    body: 'Halo {nama},\n\nPesanan Anda sedang diproses.\n\nTerima kasih.',
  },
  {
    type: 'shipping',
    name: 'Shipping / Resi Alert',
    body: 'Halo {nama},\n\nPesanan Anda sudah dikirim dengan nomor resi {tracking}.\n\nTerima kasih.',
  },
];

const mapTemplateRow = (row: TemplateRow): Template => ({
  id: row.id,
  type: row.type,
  name: row.name,
  body: row.body,
});

export const fetchTemplates = async () => {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as TemplateRow[]).map(mapTemplateRow);
};

export const seedTemplatesIfEmpty = async (userId: string) => {
  requireSupabaseConfig();
  const current = await fetchTemplates();
  if (current.length > 0) return current;

  const rows = PREDEFINED_TEMPLATES.map((template) => ({
    user_id: userId,
    type: template.type as TemplateType,
    name: template.name,
    body: template.body,
  }));

  const { data, error } = await supabase.from('templates').insert(rows).select('*');
  if (error) throw error;
  return (data as TemplateRow[]).map(mapTemplateRow);
};
