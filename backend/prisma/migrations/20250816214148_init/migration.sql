-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` VARCHAR(191) NOT NULL,
    `id_empresa` VARCHAR(191) NULL,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `perfil` VARCHAR(191) NOT NULL DEFAULT 'user',
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `uploadedBy` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `totalRecords` INTEGER NULL,
    `processedRecords` INTEGER NULL,

    INDEX `uploads_uploadedBy_fkey`(`uploadedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id_empresa` VARCHAR(191) NOT NULL,
    `razao_social` VARCHAR(255) NOT NULL,
    `nome_fantasia` VARCHAR(255) NULL,
    `cnpj` VARCHAR(18) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `cidade` VARCHAR(255) NOT NULL,
    `estado` VARCHAR(255) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `companies_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
