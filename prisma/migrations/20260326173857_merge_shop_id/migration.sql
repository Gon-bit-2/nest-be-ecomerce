/*
  Warnings:

  - You are about to drop the column `userId` on the `Shop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Shop" DROP CONSTRAINT "Shop_userId_fkey";

-- DropIndex
DROP INDEX "public"."Shop_userId_key";

-- AlterTable
ALTER TABLE "public"."Shop" DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Shop_id_seq";

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
