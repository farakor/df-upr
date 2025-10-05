/*
  Warnings:

  - You are about to drop the `warehouse_menu_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "warehouse_menu_items" DROP CONSTRAINT "warehouse_menu_items_menu_item_id_fkey";

-- DropForeignKey
ALTER TABLE "warehouse_menu_items" DROP CONSTRAINT "warehouse_menu_items_warehouse_id_fkey";

-- DropTable
DROP TABLE "warehouse_menu_items";

-- CreateTable
CREATE TABLE "warehouse_menus" (
    "id" SERIAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_menus_warehouse_id_menu_id_key" ON "warehouse_menus"("warehouse_id", "menu_id");

-- AddForeignKey
ALTER TABLE "warehouse_menus" ADD CONSTRAINT "warehouse_menus_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_menus" ADD CONSTRAINT "warehouse_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
