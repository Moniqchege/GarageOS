-- AlterTable
ALTER TABLE `inventory_items` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Uncategorized';

-- CreateIndex
CREATE INDEX `inventory_items_category_idx` ON `inventory_items`(`category`);
