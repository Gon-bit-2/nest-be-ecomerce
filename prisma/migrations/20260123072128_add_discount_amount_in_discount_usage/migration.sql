/*
  Warnings:

  - Added the required column `discountAmount` to the `DiscountUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DiscountUsage" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL;
