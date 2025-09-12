-- CreateTable
CREATE TABLE `base_dados` (
    `id` VARCHAR(191) NOT NULL,
    `mes` VARCHAR(50) NOT NULL,
    `se` VARCHAR(50) NOT NULL,
    `lotacao` VARCHAR(100) NOT NULL,
    `municipio` VARCHAR(100) NOT NULL,
    `matricula` VARCHAR(50) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `sexo` VARCHAR(20) NOT NULL,
    `data_nasc` DATETIME(3) NOT NULL,
    `raca` VARCHAR(50) NOT NULL,
    `grau_instrucao` VARCHAR(100) NOT NULL,
    `data_admissao` DATETIME(3) NOT NULL,
    `cargo` VARCHAR(100) NOT NULL,
    `cargo_esp` VARCHAR(100) NULL,
    `cargo_nivel` VARCHAR(50) NULL,
    `funcao` VARCHAR(100) NULL,
    `jornada_trab` VARCHAR(50) NULL,
    `tipo_deficiencia` VARCHAR(100) NULL,
    `data_afast` DATETIME(3) NULL,
    `motivo_afast` VARCHAR(255) NULL,
    `base_sindical` VARCHAR(100) NOT NULL,
    `filiado` VARCHAR(10) NOT NULL,
    `valor_mensalidade` DECIMAL(10, 2) NULL,
    `id_empresa` VARCHAR(191) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL,

    INDEX `base_dados_id_empresa_fkey`(`id_empresa`),
    INDEX `base_dados_mes_idx`(`mes`),
    INDEX `base_dados_se_idx`(`se`),
    INDEX `base_dados_lotacao_idx`(`lotacao`),
    INDEX `base_dados_municipio_idx`(`municipio`),
    INDEX `base_dados_base_sindical_idx`(`base_sindical`),
    INDEX `base_dados_filiado_idx`(`filiado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `base_dados` ADD CONSTRAINT `base_dados_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;
