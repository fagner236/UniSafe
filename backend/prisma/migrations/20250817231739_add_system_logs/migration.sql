-- AlterTable
ALTER TABLE `usuarios` MODIFY `perfil` VARCHAR(191) NOT NULL DEFAULT 'ghost';

-- CreateTable
CREATE TABLE `system_logs` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` VARCHAR(10) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `user_email` VARCHAR(255) NULL,
    `user_profile` VARCHAR(50) NULL,
    `company_id` VARCHAR(191) NULL,
    `company_name` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `session_id` VARCHAR(255) NULL,
    `action` VARCHAR(100) NULL,
    `resource` VARCHAR(255) NULL,
    `details` JSON NULL,

    INDEX `system_logs_timestamp_idx`(`timestamp`),
    INDEX `system_logs_level_idx`(`level`),
    INDEX `system_logs_category_idx`(`category`),
    INDEX `system_logs_user_id_idx`(`user_id`),
    INDEX `system_logs_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `empresas`(`id_empresa`) ON DELETE SET NULL ON UPDATE CASCADE;
