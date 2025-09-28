/*
  Warnings:

  - The primary key for the `base_dados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `base_dados` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `empregados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `empregados` table. All the data in the column will be lost.
  - You are about to drop the column `id_empregado` on the `empregados` table. All the data in the column will be lost.
  - You are about to alter the column `matricula` on the `empregados` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(8)`.
  - A unique constraint covering the columns `[e-mail]` on the table `empregados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[celular]` on the table `empregados` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_empregados` to the `empregados` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `empregados` DROP FOREIGN KEY `empregados_id_usuario_fkey`;

-- AlterTable
ALTER TABLE `base_dados` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `filiado` VARCHAR(15) NOT NULL,
    MODIFY `data_atualizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `empregados` DROP PRIMARY KEY,
    DROP COLUMN `email`,
    DROP COLUMN `id_empregado`,
    ADD COLUMN `e-mail` VARCHAR(200) NULL,
    ADD COLUMN `id_empregados` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `matricula` VARCHAR(8) NOT NULL,
    MODIFY `foto` VARCHAR(255) NULL,
    MODIFY `data_criacao` DATETIME(3) NULL,
    MODIFY `data_atualizacao` DATETIME(3) NULL,
    ADD PRIMARY KEY (`id_empregados`);

-- AlterTable
ALTER TABLE `uploads` MODIFY `path` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `perfil` VARCHAR(191) NOT NULL DEFAULT 'guest';

-- CreateIndex
CREATE UNIQUE INDEX `empregados_e-mail_key` ON `empregados`(`e-mail`);

-- CreateIndex
CREATE UNIQUE INDEX `empregados_celular_key` ON `empregados`(`celular`);

-- CreateIndex
CREATE INDEX `empregados_matricula_idx` ON `empregados`(`matricula`);
