npm i
# 1. Bersihkan database dan buat tabel baru
npx prisma db push --force-reset

# 2. Update intellisense TypeScript di node_modules
npx prisma generate
# 3. data
npx prisma db seed


<!-- buat sql baru -->
# 2. Update 'kamus' TypeScript di node_modules
npx prisma migrate dev --name messagehere

