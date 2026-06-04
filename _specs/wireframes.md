# WA Order Manager — Low-Fidelity Wireframes (Revised MVP v1)

This document contains the revised low-fidelity wireframe layouts for WA Order Manager, optimized for high information density, fast scanning, and maximum operational efficiency.

---

## 1. Sign In & Sign Up Screen (Split-Pane View)

### Layout & Hierarchy
* **Desktop**: 50% left pane (Hero/USP text), 50% right pane (Sign in / Sign up form).
* **Mobile**: Single column stacking the form on top.

```
+------------------------------------------+------------------------------------------+
|                                          |                                          |
|  WA ORDER MANAGER                        |  [ Sign In ]   Register                  |
|                                          |                                          |
|  Kelola Pesanan WhatsApp Tanpa Excel.    |  Email Address                           |
|                                          |  [ input: email@example.com           ]  |
|  Semua order, customer, dan status       |                                          |
|  pesanan dalam satu dashboard            |  Password                                |
|  sederhana.                              |  [ input: **********                  ]  |
|                                          |                                          |
|  * 14-Day Free Trial                     |  [x] Remember me    Forgot Password?     |
|  * No Credit Card Required               |                                          |
|                                          |  [ BUTTON: SIGN IN                    ]  |
|                                          |                                          |
|                                          |  Don't have an account? Sign Up          |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

---

## 2. Main App Shell (Navigation & Layout Grid)

All screens below (3 to 6) share this common layout grid:
* **Sidebar (Desktop)**: Left-aligned list of navigation links, collapsible.
* **Header**: Shows current page title, simple user profile dropdown, and a global "Create Order" CTA.
* **Content Area**: Dynamic central area where the selected screen renders.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  Page Title                    [+ Create Order]  [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |                                                         |
| (O) Orders                |                                                         |
| (C) Customers             |                      CONTENT AREA                       |
| (T) WA Templates (Sys)    |                                                         |
|                           |                                                         |
| -----------------         |                                                         |
| [ Trial: 12 Days Left ]   |                                                         |
+---------------------------+---------------------------------------------------------+
```

---

## 3. Dashboard Screen (Operational Layout)

### Layout & Hierarchy
* **Top Row**: 6 Status Cards displaying the quantity of orders in each stage.
* **Left Panel**: **Need Attention** widget prioritizing bottlenecks.
* **Right Panel**: **Recent Orders** widget tracking real-time status.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  Dashboard                     [+ Create Order]  [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |                                                         |
| (O) Orders                |  [ Pending Pay ] [ Paid ]  [ Packing ] [ Shipped ] done |
| (C) Customers             |  | 12 orders   | | 8    |  | 5       | | 14      | 88   |
| (T) WA Templates (Sys)    |  +------------+ +------+  +---------+ +---------+ ----+
|                           |                                                         |
|                           |  +---------------------------+ +----------------------+ |
|                           |  | NEED ATTENTION            | | RECENT ORDERS        | |
|                           |  |                           | |                      | |
|                           |  | [!] Pending Pay > 24h     | | * #088 - Budi        | |
|                           |  |     - Budi (#023)         | |   [ Paid ] - 2m ago  | |
|                           |  |                           | |                      | |
|                           |  | [!] Stuck in Packing > 2d | | * #087 - Andi        | |
|                           |  |     - Adi (#011)          | |   [ Shipped ] - 15m  | |
|                           |  |                           | |                      | |
|                           |  | [!] Missing Tracking No.  | | * #086 - Rian        | |
|                           |  |     - Rian (#003)         | |   [ Packing ] - 1h   | |
|                           |  +---------------------------+ +----------------------+ |
+---------------------------+---------------------------------------------------------+
```

---

## 4. Order List Screen (High Density)

### Layout & Hierarchy
* **Toolbar**: Search input, Status filter dropdown, Date range filter, and "Create Order" button.
* **Table**: High information density showing Order ID, Date, Customer Name (with WA badge), Product details (Name, Qty, Price), Current Status, and Quick Actions directly inside the row.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  Orders                        [+ Create Order]  [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |                                                         |
| (O) Orders                |  [ Search Orders...  ] [ Filter: Status v ] [ Date v ]  |
| (C) Customers             |                                                         |
| (T) WA Templates (Sys)    |  +----------------------------------------------------+ |
|                           |  | ID   | Customer (WA) | Product (Qty) | Total | Status  | ACTIONS | |
|                           |  |------+---------------+---------------+-------+--------+---------| |
|                           |  | #001 | Nur (0812..)  | Nastar Box (2)| 180rb | Paid v | [WA][E][D] | |
|                           |  | #002 | Adi (0856..)  | Kastengel (1) |  95rb | Pend v | [WA][E][D] | |
|                           |  | #003 | Rian (0878..) | Nastar Box (1)|  90rb | Ship v | [WA][E][D] | |
|                           |  +----------------------------------------------------+ |
|                           |  Showing 1-3 of 88 orders               [ Prev ] [ Next ] |
+---------------------------+---------------------------------------------------------+
```
*(Row Actions: `[WA]` copies the relevant status message template and launches WhatsApp link, `[E]` redirects to the Full-Page Edit Form, `[D]` triggers the delete confirmation alert).*

---

## 5. Full-Page Order Form Screen

### Layout & Hierarchy
* Replacing the modal window with a dedicated workspace designed for scalable, future field expansion.
* Dual column layouts on desktop screens.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  Create Order                                    [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |  [ Back to Orders ]                                     |
| (O) Orders                |                                                         |
| (C) Customers             |  CUSTOMER INFORMATION          ORDER INFORMATION        |
| (T) WA Templates (Sys)    |  Customer Name                 Product Name             |
|                           |  [ input: Adi Wijaya        ]  [ input: Kastengel Box  ]  |
|                           |                                                         |
|                           |  WhatsApp Number               Quantity                 |
|                           |  [ input: 08567890123       ]  [ input: 1              ]  |
|                           |                                                         |
|                           |  Notes / Address               Total Price              |
|                           |  [ textarea: Jl. Mangga 12 ]  [ input: 95000          ]  |
|                           |                                                         |
|                           |                                Order Status             |
|                           |                                [ Dropdown: Paid v ]     |
|                           |                                                         |
|                           |                                Tracking Number (Opt)    |
|                           |                                [ input: JNE123456789 ]  |
|                           |                                                         |
|                           |  [ CANCEL ]                                 [ SAVE ORDER ] |
+---------------------------+---------------------------------------------------------+
```

---

## 6. Customer Directory Screen & Detail Drawer

### Layout & Hierarchy
* Unique customer table view. Clicking a row slides a full drawer from the right screen edge.
* Customer Detail Drawer incorporates a new top-level customer summary overview.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  Customers                                       [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |  [ Search by name or phone...                     ]     |
| (O) Orders                |  +----------------------------------------------------+ |
| (C) Customers             |  | Customer Name | WhatsApp    | Total Orders | Spent | |
| (T) WA Templates (Sys)    |  |---------------+-------------+--------------+-------| |
|                           |  | Nur Aini      | 08123456789 | 4 orders     | 720rb | |
|                           |  | Adi Wijaya    | 08567890123 | 1 order      |  95rb | |
|                           |  +----------------------------------------------------+ |
+---------------------------+---------------------------------------------------------+

[==================== SLIDES FROM RIGHT ON ROW CLICK ====================]
|                                                    Customer Details (X) |
|                                                    -------------------- |
|                                                    Adi Wijaya           |
|                                                    WA: 08567890123      |
|                                                                         |
|                                                    SUMMARY              |
|                                                    * Total Orders: 1    |
|                                                    * Total Spent: 95rb  |
|                                                    * Last Order: 03 Jun |
|                                                    -------------------- |
|                                                    ORDER HISTORY        |
|                                                    #002 - 03 Jun 2026   |
|                                                    Kastengel (1) - 95rb |
|                                                    Status: Pending      |
[========================================================================]
```

---

## 7. WhatsApp Predefined Templates Screen (Read-Only)

### Layout & Hierarchy
* Shows preview boards for each of the three predefined system templates. No editor panel is available.

```
+-------------------------------------------------------------------------------------+
| [LOGO] WA Order Manager   |  WhatsApp System Templates                       [User] |
+---------------------------+---------------------------------------------------------+
| (D) Dashboard             |                                                         |
| (O) Orders                |  PREDEFINED SYSTEM TEMPLATES (READ-ONLY)                |
| (C) Customers             |                                                         |
| (T) WA Templates (Sys)    |  [ Payment Confirmation Template ]                      |
|                           |  Halo {nama}, Pesanan Anda sudah kami terima.           |
|                           |  Total Pembayaran: Rp {total}. Terima kasih!            |
|                           |                                                         |
|                           |  [ Processing Alert Template ]                          |
|                           |  Halo {nama}, Pesanan Anda sedang diproses. Terima kasih!|
|                           |                                                         |
|                           |  [ Shipping Alert Template ]                            |
|                           |  Halo {nama}, Pesanan Anda sudah dikirim dengan nomor   |
|                           |  resi {tracking}. Terima kasih!                         |
+---------------------------+---------------------------------------------------------+
```
