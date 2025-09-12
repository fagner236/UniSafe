/*
  Warnings:

  - You are about to drop the column `id_empresa` on the `base_dados` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `base_dados` DROP FOREIGN KEY `base_dados_id_empresa_fkey`;

-- DropIndex
DROP INDEX `base_dados_id_empresa_fkey` ON `base_dados`;

-- AlterTable
ALTER TABLE `base_dados` DROP COLUMN `id_empresa`,
    MODIFY `data_nasc` DATE NOT NULL,
    MODIFY `data_admissao` DATE NOT NULL,
    MODIFY `data_afast` DATE NULL;
