-- AlterTable
ALTER TABLE `employees` ADD COLUMN `commission_rate` INTEGER NULL,
    ADD COLUMN `pay_method` VARCHAR(30) NOT NULL DEFAULT 'Commission',
    ADD COLUMN `rate` INTEGER NULL;
