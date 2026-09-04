-- CreateTable
CREATE TABLE `pay_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` VARCHAR(20) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `paid_at` BIGINT NULL,

    INDEX `pay_periods_year_month_idx`(`year`, `month`),
    UNIQUE INDEX `pay_periods_employee_id_year_month_key`(`employee_id`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
