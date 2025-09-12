-- AlterTable
ALTER TABLE `uploads` ADD COLUMN `id_empresa` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `uploads_id_empresa_fkey` ON `uploads`(`id_empresa`);

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id_empresa`) ON DELETE SET NULL ON UPDATE CASCADE;
