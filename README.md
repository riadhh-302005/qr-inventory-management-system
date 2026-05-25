# QR-Based Inventory Management System

A modern full-stack **QR-Based Inventory Management System** built using **React, TypeScript, Laravel, and MongoDB** to improve inventory tracking and streamline stock management through QR code technology.

---

# 📌 Problem Statement

Traditional inventory management systems often lack efficient tracking methods, leading to:

- Inaccurate stock records
- Manual tracking errors
- Slow inventory updates
- Difficulty managing products efficiently

This project solves these issues by introducing a **QR-based inventory management system** that enables fast product identification, real-time inventory monitoring, and simplified stock management.

---

# 🚀 Features

## 📦 Product Management
- Add new products
- Edit product details
- Delete products
- Search and filter products
- Product categories
- Product image support

---

## 📷 QR Code Integration
- Automatic QR code generation for every product
- Live webcam QR scanning
- Scan QR codes to quickly access product details
- Printable QR inventory labels

---

## 📊 Dashboard
- Total products overview
- Total inventory value
- Low stock alerts
- Recent product additions
- Category-based insights

---

## ⚠️ Inventory Alerts
- Automatic low-stock detection
- Quick identification of products needing attention

---

## 🖼️ Product Images
- Add product image URLs
- Product image preview
- Images displayed in inventory labels and product pages

---

## 📱 Responsive UI
- Mobile-friendly design
- Modern dashboard layout
- Clean inventory management interface

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI

## Backend
- Laravel
- PHP

## Database
- MongoDB

## QR & Scanner Libraries
- ZXing Browser
- chillerlan/php-qrcode

---

# 📂 Project Structure

```bash
Stock-Manager/
│
├── artifacts/
│   ├── inventory-app/     # React Frontend
│   └── laravel-api/       # Laravel Backend
│
├── public/
├── src/
└── README.md
```

---

# ⚙️ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/riadhh-302005/qr-inventory-management-system.git
```

---

# 2️⃣ Frontend Setup

```bash
cd artifacts/inventory-app
pnpm install
pnpm dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 3️⃣ Backend Setup

```bash
cd artifacts/laravel-api
composer install
php artisan serve
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

# 4️⃣ MongoDB Setup

Update your `.env` file in Laravel backend:

```env
DB_CONNECTION=mongodb
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=inventory_management
```

---

# 📷 QR Scanner Usage

1. Open the Scanner page
2. Allow camera access
3. Point webcam at QR code
4. Product details load automatically

---

# 🖼️ Product Images Usage

1. Edit a product
2. Paste image URL in:
   Product Image URL
3. Save changes
4. Image appears in product details and labels

---

# 📊 Dashboard Features

- Inventory statistics
- Product count
- Total inventory value
- Low stock notifications
- Recent additions list

---

# 🎯 Future Improvements

- User authentication
- Role-based access
- Export inventory reports
- Sales tracking
- Barcode support
- Cloud image uploads
- Email notifications
- Inventory transaction history

---

# 💡 Key Highlights

✔ Full-stack architecture  
✔ Real-time QR code scanning  
✔ MongoDB integration  
✔ Responsive modern UI  
✔ Inventory analytics dashboard  
✔ Product image management  
✔ Low-stock monitoring system  

---

# 👩‍💻 Authors

## Ria Dhawan

GitHub:  
https://github.com/riadhh-302005

### Co-Authors
- Sanvi Kumari
- Dolly Kumari

---
