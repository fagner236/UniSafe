-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id_empresa`) ON DELETE SET NULL ON UPDATE CASCADE;
