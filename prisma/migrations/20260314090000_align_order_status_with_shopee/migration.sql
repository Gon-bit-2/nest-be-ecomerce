-- Rename legacy order statuses to Shopee-aligned statuses while preserving existing data.
ALTER TYPE "public"."OrderStatus" RENAME VALUE 'PENDING_PAYMENT' TO 'UNPAID';
ALTER TYPE "public"."OrderStatus" RENAME VALUE 'PENDING_PICKUP' TO 'READY_TO_SHIP';
ALTER TYPE "public"."OrderStatus" RENAME VALUE 'PENDING_DELIVERY' TO 'SHIPPED';
ALTER TYPE "public"."OrderStatus" RENAME VALUE 'DELIVERED' TO 'COMPLETED';
ALTER TYPE "public"."OrderStatus" RENAME VALUE 'RETURNED' TO 'TO_RETURN';
