/*
  Warnings:

  - You are about to drop the column `customer` on the `job_cards` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `job_cards` table. All the data in the column will be lost.
  - You are about to drop the `customer_vehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `job_cards` DROP COLUMN `customer`,
    DROP COLUMN `phone`,
    ADD COLUMN `completed_at` BIGINT NULL,
    ADD COLUMN `mileage_at_end` INTEGER NULL,
    ADD COLUMN `mileage_at_start` INTEGER NULL;

-- DropTable
DROP TABLE `customer_vehicles`;

-- DropTable
DROP TABLE `vehicle_records`;

-- CreateTable
CREATE TABLE `vehicles` (
    `registration` VARCHAR(20) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NULL,
    `color` VARCHAR(191) NULL,
    `mileage` INTEGER NOT NULL DEFAULT 0,
    `fuel` INTEGER NULL,
    `health` INTEGER NULL,
    `nextServiceKm` INTEGER NULL,
    `nextServiceDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicles_customerId_idx`(`customerId`),
    PRIMARY KEY (`registration`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `customers_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `job_cards_completed_at_idx` ON `job_cards`(`completed_at`);

-- AddForeignKey
ALTER TABLE `job_cards` ADD CONSTRAINT `job_cards_registration_fkey` FOREIGN KEY (`registration`) REFERENCES `vehicles`(`registration`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
