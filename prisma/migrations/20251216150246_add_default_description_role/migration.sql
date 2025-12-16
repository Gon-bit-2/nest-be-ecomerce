-- AlterTable
ALTER TABLE "public"."Role" ALTER COLUMN "description" SET DEFAULT '';
CREATE UNIQUE INDEX "Role_name_unique" ON "Role" (name) WHERE "deletedAt" IS NULL;