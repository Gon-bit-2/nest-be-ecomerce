-- AlterTable
ALTER TABLE "public"."ShopVideo" ADD COLUMN     "deletedById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."ShopVideo" ADD CONSTRAINT "ShopVideo_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
