-- =========================================
-- INIT APP USER + PERMISSIONS (RLS READY)
-- =========================================

-- 1. Buat role jika belum ada
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_roles WHERE rolname = 'app_user'
   ) THEN
      CREATE ROLE app_user LOGIN PASSWORD 'user';
   END IF;
END
$$;

-- 2. Pastikan tidak bisa bypass RLS
ALTER ROLE app_user NOBYPASSRLS;

-- 3. Izinkan akses ke database vrp
GRANT CONNECT ON DATABASE vrp TO app_user;

-- 5. Izinkan akses schema
GRANT USAGE ON SCHEMA public TO app_user;

-- 6. Akses ke semua tabel yang sudah ada
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO app_user;

-- 7. Akses ke semua sequence (auto increment)
GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO app_user;

-- 8. Default privilege untuk tabel baru
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- 9. Default privilege untuk sequence baru
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- =========================================
-- DONE
-- =========================================