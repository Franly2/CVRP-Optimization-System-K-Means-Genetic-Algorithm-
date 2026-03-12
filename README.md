# 🚚 CVRP Optimization System (K-Means + Genetic Algorithm)

Sistem optimasi rute pengiriman barang berbasis **Capacitated Vehicle Routing Problem (CVRP)**. Aplikasi ini dirancang untuk membagi wilayah pengiriman secara otomatis kepada kurir dan menentukan urutan jalan paling efisien.

## 🏗️ Project Structure

```
CVRP/
├── gui/
│   ├── mobile/              # React Native App (Expo) - Untuk Kurir
│   │   ├── app/             # App screens and navigation
│   │   ├── components/      # Reusable UI components
│   │   └── ...
│   └── web/                 # React Web Dashboard - Untuk Admin (Clustering View)
├── nest/
│   └── vrp-backend/         # NestJS backend server
│       ├── src/             # Logic Algoritma (K-Means, GA, OSRM)
│       ├── prisma/          # Database schema (PostgreSQL/MySQL)
│       └── ...
├── Docs/                    # Dokumentasi
└── README.md

```

## 🚀 Fitur Utama & Algoritma

### 1. Adaptive K-Means Clustering (Modified)

Tahap pengelompokan paket yang cerdas dengan mempertimbangkan dua aspek utama:

* **Capacity Constraint:** Menentukan jumlah cluster ($K$) awal berdasarkan rumus $\lceil Total Paket / Kapasitas Kurir \rceil$.
* **Spatial Radius Constraint:** Menggunakan **Haversine Formula** untuk menghitung radius cluster dalam satuan kilometer. Jika radius melebihi batas (misal > 7km), sistem akan melakukan *auto-increment* pada nilai $K$ untuk memecah wilayah yang terlalu luas agar beban kerja kurir tetap manusiawi.
* **Haversine Distance:** Digunakan untuk akurasi jarak di permukaan bumi yang bulat, mengompensasi penyempitan garis bujur (Longitude) saat menjauhi khatulistiwa.

### 2. Genetic Algorithm (Route Optimization)

Setelah paket terbagi per wilayah, GA bertugas mencari urutan kunjungan (Permutation) paling pendek:

* **Kromosom:** Representasi satu rute lengkap (Urutan ID Paket).
* **Populasi:** Kumpulan alternatif rute (Standard: 30-50 kromosom) untuk menjaga keragaman solusi.
* **Ordered Crossover (OX):** Teknik perkawinan silang khusus untuk memastikan tidak ada paket yang dikunjungi dua kali atau terlewat.
* **Fitness Function:** Mengukur kualitas rute berdasarkan jarak rute asli (Jalan Raya) yang ditarik dari API **OSRM**.

### 3. Multi-Platform Map Integration

Sistem menggunakan dua library peta berbeda untuk optimalisasi performa:

* **Mobile (Kurir):** Menggunakan **React Native Maps**. Memanfaatkan SDK Google Maps secara Native untuk akurasi GPS real-time dan pergerakan peta yang *smooth*.
* **Web (Admin):** Menggunakan **Leaflet.js**. Solusi ringan dan gratis untuk memvisualisasikan ratusan marker cluster di layar PC tanpa beban lisensi API Key yang besar.

---

## 📊 Alur Kerja Sistem (Setiap variabel dapat dirubah)

```mermaid
graph TD;
    A[Data Paket & Lokasi] --> B[K-Means Clustering];
    B -->|Hitung Radius| C{Radius > 7KM?};
    C -- Ya & Armada Tersedia --> B1[Increment K];
    B1 --> B;
    C -- Tidak --> D[Cluster Terbentuk];
    D --> E[Genetic Algorithm per Cluster];
    E --> F[Fitness Eval via OSRM];
    F --> G[Rute Optimal Terbentuk];

```

---

## ⚙️ Cara Menjalankan (Local Setup)

### 1. Persiapan Backend (NestJS)

1. Masuk ke folder: `cd nest/vrp-backend`
2. Install dependensi: `npm install`
3. Konfigurasi file `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

```

4. Jalankan migrasi database: `npx prisma migrate dev --name messagehere` 
5. Generate Prisma Client: `npx prisma generate` 
6. run seeder`npx prisma db seed` 
7. Jalankan server: `npm run start`

### 2. Persiapan Frontend (Mobile - Expo)

1. Masuk ke folder: `cd gui/mobile`
2. Install dependensi: `npm install`
3. Sesuaikan `API_URL` di konfigurasi dengan IP Local Laptop Anda.
4. Jalankan Expo: `npx expo start`
5. Buka di HP melalui aplikasi **Expo Go**.

### 3. Persiapan Dashboard Admin (Web)

1. Masuk ke folder: `cd gui/web` (atau folder dashboard Anda)
2. Install dependensi: `npm install`
3. Jalankan versi web: `npm run web` atau `npm run dev`

---

## 🛠️ Tech Stack

* **Backend:** NestJS, Prisma ORM, OSRM API (Routing).
* **Mobile:** React Native (Expo), React Native Maps.
* **Web Admin:** React, Leaflet.js.
* **Database:** PostgreSQL.
* **Tools:** Haversine Formula, Genetic Algorithm (Permutation-based), K-Means Clustering.

---
Franly Budi Pramana
