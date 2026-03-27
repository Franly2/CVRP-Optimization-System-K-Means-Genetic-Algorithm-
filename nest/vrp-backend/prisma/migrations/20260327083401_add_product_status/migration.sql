-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'AVAILABLE', 'UNAVAILABLE', 'DELETED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'PENDING';
