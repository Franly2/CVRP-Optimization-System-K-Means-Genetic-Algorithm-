/*
  Warnings:

  - Added the required column `volume` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "lng" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "colorCode" TEXT,
ADD COLUMN     "polyline" TEXT,
ADD COLUMN     "totalVolume" DOUBLE PRECISION,
ADD COLUMN     "totalWeight" DOUBLE PRECISION;
