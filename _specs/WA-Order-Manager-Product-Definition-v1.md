# WA Order Manager — Product Definition v1

## Overview

WA Order Manager adalah SaaS sederhana yang membantu seller WhatsApp, Instagram, dan TikTok mengelola pesanan tanpa Excel, catatan manual, atau pencarian chat yang berantakan.

Fokus utama produk adalah **tracking order setelah closing terjadi**, bukan menggantikan proses jualan atau percakapan dengan customer.

---

# Target Users

- Seller WhatsApp
- Seller Instagram
- Seller TikTok Shop
- Reseller
- UMKM kecil
- Penjual PO (pre-order)
- Penjual makanan rumahan
- Penjual fashion dan aksesoris

---

# Core Problem

Saat order mulai meningkat, seller biasanya mengalami:

- Order dicatat manual di catatan atau Excel
- Sulit mengetahui order mana yang sudah dibayar
- Sulit mengetahui order mana yang sedang dipacking
- Sulit mencari histori pelanggan
- Chat WhatsApp menjadi sumber data utama yang berantakan
- Risiko lupa follow-up atau update status

---

# Value Proposition

Kelola semua pesanan WhatsApp dalam satu dashboard sederhana.

Tidak perlu lagi:

- Mencari order di ratusan chat
- Rekap order manual setiap beberapa hari
- Bingung status pesanan pelanggan

---

# Product Positioning

Bukan:

- CRM kompleks
- ERP
- Marketplace
- Website toko online

Melainkan:

> Upgrade dari Excel dan catatan manual ke dashboard order yang lebih rapi dan mudah digunakan.

---

# MVP Scope (v1)

## Authentication

- Register
- Login
- Forgot Password
- Logout

---

## Dashboard

Menampilkan:

- Total Orders
- Pending Payment
- Paid
- Packing
- Shipped
- Done
- Revenue Overview

---

## Orders

Fitur:

- Create Order
- Edit Order
- Delete Order
- Search Order
- Filter by Status

Field:

- Customer Name
- Phone Number
- Product Name
- Quantity
- Total Price
- Notes
- Status

---

## Customers

Otomatis dibuat dari order.

Menampilkan:

- Nama Customer
- Nomor WhatsApp
- Total Orders
- Total Spending
- Riwayat Order

---

## Status Tracking

Default Status:

- Pending Payment
- Paid
- Packing
- Shipped
- Done
- Cancelled

---

## WhatsApp Templates

Contoh:

### Payment Confirmation

Halo {nama},

Pesanan Anda sudah kami terima.

Total pembayaran:
Rp {total}

Terima kasih.

---

### Processing

Halo {nama},

Pesanan Anda sedang diproses.

Terima kasih.

---

### Shipping

Halo {nama},

Pesanan Anda sudah dikirim.

Terima kasih.

---

# Out of Scope (NOT v1)

Jangan dibangun pada tahap awal:

- AI Features
- WhatsApp API Integration
- Payment Gateway
- Multi Store
- Multi Admin
- Inventory Management
- PDF Invoice
- Analytics Advanced
- Mobile App

---

# Suggested Tech Stack

Frontend:

- React
- Vite
- TypeScript
- React Router
- Shadcn UI
- Tailwind CSS

Backend:

- Supabase

Database:

- PostgreSQL (via Supabase)

Authentication:

- Supabase Auth

Hosting:

- Vercel

---

# Pricing Hypothesis

Free Trial:

- 14 Days
- No Credit Card Required

Starter Plan:

- Rp29.000 / month

Future Plan:

- Rp49.000 – Rp99.000 / month
- Added advanced features later

---

# Landing Page Messaging

## Hero

Kelola Pesanan WhatsApp Tanpa Excel

### Subheadline

Semua order, customer, dan status pesanan dalam satu dashboard sederhana.

### CTA

Coba Gratis 14 Hari

---

# Success Metrics

Tahap awal:

- 50 trial users
- 10 active users
- 3–5 paying users

Tujuan utama bukan revenue, tetapi validasi bahwa pengguna benar-benar memakai produk dalam aktivitas harian mereka.
