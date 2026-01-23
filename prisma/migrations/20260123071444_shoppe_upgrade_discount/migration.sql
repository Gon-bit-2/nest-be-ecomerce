/*
  Warnings:

  - You are about to drop the column `productId` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."DiscountType" ADD VALUE 'SHIPPING';
ALTER TYPE "public"."DiscountType" ADD VALUE 'COIN_CASHBACK';

-- DropForeignKey
ALTER TABLE "public"."Discount" DROP CONSTRAINT "Discount_productId_fkey";

-- DropIndex
DROP INDEX "public"."Discount_productId_idx";

-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "public"."DiscountsOnProducts" (
    "discountId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "DiscountsOnProducts_pkey" PRIMARY KEY ("discountId","productId")
);

-- CreateTable
CREATE TABLE "public"."DiscountsOnCategories" (
    "discountId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "DiscountsOnCategories_pkey" PRIMARY KEY ("discountId","categoryId")
);

-- AddForeignKey
ALTER TABLE "public"."DiscountsOnProducts" ADD CONSTRAINT "DiscountsOnProducts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountsOnProducts" ADD CONSTRAINT "DiscountsOnProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountsOnCategories" ADD CONSTRAINT "DiscountsOnCategories_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountsOnCategories" ADD CONSTRAINT "DiscountsOnCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
