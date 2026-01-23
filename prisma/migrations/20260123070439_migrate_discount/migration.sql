/*
  Warnings:

  - Added the required column `name` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "name" VARCHAR(500) NOT NULL,
ADD COLUMN     "updatedById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
