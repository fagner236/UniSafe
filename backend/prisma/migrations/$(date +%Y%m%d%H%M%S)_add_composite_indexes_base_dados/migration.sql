-- CreateIndex
CREATE INDEX `base_sindical_mes_idx` ON `base_dados`(`base_sindical`, `mes`);

-- CreateIndex
CREATE INDEX `base_mes_filiado_idx` ON `base_dados`(`base_sindical`, `mes`, `filiado`);

