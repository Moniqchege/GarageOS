/*
  Warnings:

  - Added the required column `type` to the `compensation_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `compensation_history` ADD COLUMN `month` INTEGER NULL,
    ADD COLUMN `paid` BOOLEAN NULL,
    ADD COLUMN `type` VARCHAR(30) NOT NULL,
    ADD COLUMN `year` INTEGER NULL,
    MODIFY `pay_method` VARCHAR(30) NULL;
