-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `last_service_date` DATETIME(3) NULL,
    ADD COLUMN `last_service_km` INTEGER NULL;
