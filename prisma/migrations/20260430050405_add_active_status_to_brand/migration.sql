-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "is_printed" BOOLEAN NOT NULL DEFAULT false;
