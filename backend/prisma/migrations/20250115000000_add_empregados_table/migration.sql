-- CreateTable
CREATE TABLE `empregados` (
    `id_empregado` INTEGER NOT NULL AUTO_INCREMENT,
    `matricula` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NULL,
    `celular` VARCHAR(20) NULL,
    `foto` TEXT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empregados_matricula_key`(`matricula`),
    INDEX `empregados_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_empregado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `empregados` ADD CONSTRAINT `empregados_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
