-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "ProductTranslation_name_idx" ON "public"."ProductTranslation" USING GIN ("name" gin_trgm_ops);
