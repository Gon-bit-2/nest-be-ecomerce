-- CreateTable
CREATE TABLE "public"."UserSavedDiscount" (
    "userId" INTEGER NOT NULL,
    "discountId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSavedDiscount_pkey" PRIMARY KEY ("userId","discountId")
);

-- AddForeignKey
ALTER TABLE "public"."UserSavedDiscount" ADD CONSTRAINT "UserSavedDiscount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSavedDiscount" ADD CONSTRAINT "UserSavedDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
