-- CreateTable
CREATE TABLE `compensation_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` VARCHAR(20) NOT NULL,
    `pay_method` VARCHAR(30) NOT NULL,
    `rate` INTEGER NULL,
    `commission_rate` INTEGER NULL,
    `effective_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `compensation_history_employee_id_idx`(`employee_id`),
    INDEX `compensation_history_employee_id_effective_at_idx`(`employee_id`, `effective_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compensation_history` ADD CONSTRAINT `compensation_history_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
