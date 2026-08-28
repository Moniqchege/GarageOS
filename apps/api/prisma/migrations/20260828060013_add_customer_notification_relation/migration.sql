/*
  Warnings:

  - Added the required column `customerId` to the `customer_notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer_notifications` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `customerId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `customer_notifications_customerId_idx` ON `customer_notifications`(`customerId`);

-- CreateIndex
CREATE INDEX `customer_notifications_customerId_read_idx` ON `customer_notifications`(`customerId`, `read`);

-- AddForeignKey
ALTER TABLE `customer_notifications` ADD CONSTRAINT `customer_notifications_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
