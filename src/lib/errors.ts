export const getFriendlyErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const message = rawMessage.toLowerCase();

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Koneksi ke database terputus. Cek internet Anda lalu coba lagi.';
  }
  if (message.includes('invalid login credentials')) {
    return 'Email atau password belum cocok. Cek kembali lalu coba lagi.';
  }
  if (message.includes('email not confirmed')) {
    return 'Email belum diverifikasi. Buka inbox Anda dan klik link verifikasi terlebih dahulu.';
  }
  if (message.includes('user already registered')) {
    return 'Email ini sudah terdaftar. Silakan login atau gunakan reset password.';
  }
  if (message.includes('jwt') || message.includes('session') || message.includes('auth')) {
    return 'Sesi login bermasalah. Silakan logout lalu login ulang.';
  }
  if (message.includes('row-level security') || message.includes('permission') || message.includes('policy')) {
    return 'Akses database ditolak. Pastikan akun ini punya izin workspace yang benar.';
  }
  if (message.includes('invoice_sent_at') || message.includes('column')) {
    return 'Database perlu di-update. Jalankan schema Supabase terbaru, lalu coba lagi.';
  }
  if (message.includes('duplicate') || message.includes('unique')) {
    return 'Data yang sama sudah ada. Refresh halaman lalu coba lagi.';
  }

  return rawMessage || fallback;
};
