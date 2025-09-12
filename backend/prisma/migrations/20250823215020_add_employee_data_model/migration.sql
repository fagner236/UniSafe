-- CreateTable
CREATE TABLE `employee_data` (
    `id` VARCHAR(191) NOT NULL,
    `upload_id` VARCHAR(191) NOT NULL,
    `id_empresa` VARCHAR(191) NOT NULL,
    `employee_data` JSON NOT NULL,
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `employee_data_id_empresa_fkey`(`id_empresa`),
    INDEX `employee_data_upload_id_fkey`(`upload_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_data` ADD CONSTRAINT `employee_data_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_data` ADD CONSTRAINT `employee_data_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;
