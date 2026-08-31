/*
  Warnings:

  - You are about to drop the column `last_service_date` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `nextServiceDate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `nextServiceKm` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vehicles` DROP COLUMN `last_service_date`,
    DROP COLUMN `nextServiceDate`,
    DROP COLUMN `nextServiceKm`,
    ADD COLUMN `next_service_km` INTEGER NULL,
    ADD COLUMN `service_interval_km` INTEGER NULL;
