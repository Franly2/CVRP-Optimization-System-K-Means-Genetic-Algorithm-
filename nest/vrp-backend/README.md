npm i
# 1. Bersihkan database dan buat tabel baru
npx prisma db push --force-reset (kalau mau hapus, gausah force reset kalo ga perlu)

# 2. Update intellisense TypeScript di node_modules
npx prisma generate
# 3. data
npx prisma db seed


<!-- buat sql baru -->
# 2. Update 'kamus' TypeScript di node_modules
npx prisma migrate dev --name messagehere



<!-- add new /src -->
npx nest g resource catalog


. /tenant (Khusus Manajemen Akun Perusahaan SaaS)

    Fungsi: Hanya untuk mengurus tabel Company.

    Isi: Pendaftaran Katering baru, ganti logo perusahaan, upgrade batas maksimal paket (PlanTier Starter/Pro).

2. /iam atau /users (Khusus Manajemen Manusia)

    Fungsi: Mengurus tabel User dan Role.

    Isi: Owner membuat akun Admin, Admin membuat akun Driver, atur password, dsb.

3. /facility atau /depot (Khusus Manajemen Gudang)

    Fungsi: Mengurus tabel Depot.

    Isi: Tambah cabang gudang, atur titik koordinat (lat/lng) gudang untuk awalan rute algoritma K-Means.

4. /catalog (Khusus Manajemen Produk)

    Fungsi: Mengurus Product, ProductImage, ProductSchedule, dan DeliveryShift.

    Isi: Admin menambah menu, upload foto ke Cloudinary, atur jadwal shift pengiriman.

5. /analytics atau /dashboard (Khusus Tarik Data Report)

    Fungsi: Menarik data dari tabel Order dan Package untuk dihitung.

    Isi: Menampilkan total pendapatan hari ini, jumlah pesanan sukses vs gagal, dsb.
