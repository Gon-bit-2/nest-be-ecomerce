-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "maxDiscountValue" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
