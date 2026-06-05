import type { Profile, ProfileRow } from '../types';
import { requireSupabaseConfig, supabase } from '../lib/supabaseClient';

const mapProfileRow = (row: ProfileRow): Profile => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  localOrdersImported: row.local_orders_imported,
  betaStatus: row.beta_status || 'pending',
  approvedBatch: row.approved_batch ?? undefined,
  approvedAt: row.approved_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchProfile = async (userId: string) => {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<ProfileRow>();

  if (error) throw error;
  return mapProfileRow(data);
};
