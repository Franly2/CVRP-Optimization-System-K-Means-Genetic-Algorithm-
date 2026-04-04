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

npm run start:dev


<!-- add new /src -->
npx nest g resource catalog
npm i --legacy-peer-deps



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



CREATE ROLE app_user LOGIN PASSWORD 'user';

ALTER ROLE app_user NOBYPASSRLS;

-- schema
GRANT USAGE ON SCHEMA public TO app_user;

-- tables
GRANT SELECT, INSERT, UPDATE, DELETE 
ON ALL TABLES IN SCHEMA public 
TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;


buat update grant
-- 1. Berikan kembali akses ke skema public yang baru dibuat ulang oleh Prisma
GRANT USAGE ON SCHEMA public TO app_user;

-- 2. Berikan akses ke semua tabel yang ada saat ini
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- 3. Berikan akses ke sequence (penting untuk UUID / Auto Increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;



DO $$ 
DECLARE 
    tenant_tables text[] := ARRAY[
        'DriverLocation',
        'Vehicle',
        'Package',
        'Route',
        'User',
        'Product',
        'ProductImage',
        'Order',
        'OrderItem',
        'DeliveryShift',
        'Subscription',
        'ProductSchedule',
        'CartItem',
        'Depot'
    ];
    t_name text;
BEGIN 
    FOREACH t_name IN ARRAY tenant_tables 
    LOOP 
        -- 1. Mengaktifkan RLS (Tanda kutip di sekitar %I dihapus)
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- 2. Memaksa RLS berlaku untuk Table Owner (app_user)
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t_name);
        
        -- 3. Hapus policy lama jika sudah ada
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', t_name);
        
        -- 4. Buat Policy baru khusus ditargetkan ke app_user
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I 
             FOR ALL 
             TO app_user 
             USING ("companyId"::text = current_setting(''app.current_tenant_id'', true));', 
            t_name
        );
    END LOOP; 
END $$;