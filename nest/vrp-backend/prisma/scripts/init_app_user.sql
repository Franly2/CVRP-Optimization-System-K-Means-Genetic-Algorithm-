-- ==============================================================================
-- 1. MEMBUAT USER (Abaikan error jika user sudah ada, kita pakai blok aman)
-- ==============================================================================
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_user') THEN
      CREATE ROLE app_user LOGIN PASSWORD 'user';
   END IF;
END
$do$;

-- Memastikan password dan hak loginnya benar (jaga-jaga kalau user sudah ada sebelumnya)
ALTER ROLE app_user WITH LOGIN PASSWORD 'user';

-- ==============================================================================
-- 2. MEMBERIKAN IZIN KONEKSI KE DATABASE VRP
-- ==============================================================================
GRANT CONNECT ON DATABASE vrp TO app_user;

-- ==============================================================================
-- 3. MEMBERIKAN IZIN KE SCHEMA PUBLIC DI DALAM DATABASE VRP
-- ==============================================================================
GRANT USAGE, CREATE ON SCHEMA public TO app_user;

-- ==============================================================================
-- 4. MEMBERIKAN HAK AKSES PENUH KE TABEL & SEQUENCE YANG SUDAH ADA
-- ==============================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ==============================================================================
-- 5. MEMBERIKAN HAK AKSES OTOMATIS UNTUK TABEL YANG AKAN DIBUAT PRISMA NANTI
-- ==============================================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;

-- ==============================================================================
-- SELESAI! 🚀
-- ==============================================================================