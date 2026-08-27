-- CreateTable
CREATE TABLE `employees` (
    `id` VARCHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `pin` VARCHAR(4) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `last_login` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `sku` VARCHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fits` VARCHAR(191) NOT NULL,
    `cost` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `low` INTEGER NOT NULL,
    `added` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `labor_charges` (
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_cards` (
    `id` VARCHAR(20) NOT NULL,
    `registration` VARCHAR(20) NOT NULL,
    `customer` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `mechanic` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(20) NOT NULL DEFAULT 'diagnostics',
    `started_at` BIGINT NOT NULL,
    `faults` TEXT NOT NULL,
    `diagnosis_notes` TEXT NULL,
    `diagnosis_findings` JSON NULL,

    INDEX `job_cards_registration_idx`(`registration`),
    INDEX `job_cards_stage_idx`(`stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_id` VARCHAR(20) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `sku` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `job_lines_job_id_idx`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_records` (
    `registration` VARCHAR(20) NOT NULL,
    `customer` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `mileage` INTEGER NOT NULL,
    `last_service` VARCHAR(20) NOT NULL,
    `next_service_km` INTEGER NOT NULL,
    `next_service_date` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`registration`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_vehicles` (
    `registration` VARCHAR(20) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `mileage` INTEGER NOT NULL,
    `health` INTEGER NOT NULL,
    `fuel` INTEGER NOT NULL,
    `last_service` VARCHAR(20) NOT NULL,
    `next_service_date` VARCHAR(20) NOT NULL,
    `next_service_km` INTEGER NOT NULL,
    `active_job` JSON NULL,
    `diagnostics` JSON NOT NULL,
    `history` JSON NOT NULL,

    PRIMARY KEY (`registration`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(20) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `time` VARCHAR(40) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `name` VARCHAR(191) NOT NULL,
    `kra` VARCHAR(20) NOT NULL,
    `vat_rate` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job_lines` ADD CONSTRAINT `job_lines_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
