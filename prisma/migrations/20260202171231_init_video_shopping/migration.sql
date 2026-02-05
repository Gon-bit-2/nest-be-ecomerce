/*
  Warnings:

  - The values [IMAGE] on the enum `MediaType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."VideoStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'HIDDEN');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MediaType_new" AS ENUM ('VIDEO');
ALTER TABLE "public"."ReviewMedia" ALTER COLUMN "type" TYPE "public"."MediaType_new" USING ("type"::text::"public"."MediaType_new");
ALTER TYPE "public"."MediaType" RENAME TO "MediaType_old";
ALTER TYPE "public"."MediaType_new" RENAME TO "MediaType";
DROP TYPE "public"."MediaType_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."ShopVideo" (
    "id" SERIAL NOT NULL,
    "caption" VARCHAR(2000),
    "videoUrl" VARCHAR(1000) NOT NULL,
    "thumbnailUrl" VARCHAR(1000),
    "status" "public"."VideoStatus" NOT NULL DEFAULT 'ACTIVE',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "shopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ShopVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopVideoProduct" (
    "videoId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopVideoProduct_pkey" PRIMARY KEY ("videoId","productId")
);

-- CreateTable
CREATE TABLE "public"."ShopVideoLike" (
    "id" SERIAL NOT NULL,
    "videoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopVideoLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopVideoComment" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "videoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopVideoComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopVideo_shopId_idx" ON "public"."ShopVideo"("shopId");

-- CreateIndex
CREATE INDEX "ShopVideo_status_createdAt_idx" ON "public"."ShopVideo"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ShopVideoProduct_productId_idx" ON "public"."ShopVideoProduct"("productId");

-- CreateIndex
CREATE INDEX "ShopVideoLike_userId_idx" ON "public"."ShopVideoLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopVideoLike_videoId_userId_key" ON "public"."ShopVideoLike"("videoId", "userId");

-- CreateIndex
CREATE INDEX "ShopVideoComment_videoId_idx" ON "public"."ShopVideoComment"("videoId");

-- AddForeignKey
ALTER TABLE "public"."ShopVideo" ADD CONSTRAINT "ShopVideo_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoProduct" ADD CONSTRAINT "ShopVideoProduct_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."ShopVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoProduct" ADD CONSTRAINT "ShopVideoProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoLike" ADD CONSTRAINT "ShopVideoLike_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."ShopVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoLike" ADD CONSTRAINT "ShopVideoLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoComment" ADD CONSTRAINT "ShopVideoComment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."ShopVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoComment" ADD CONSTRAINT "ShopVideoComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopVideoComment" ADD CONSTRAINT "ShopVideoComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ShopVideoComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
