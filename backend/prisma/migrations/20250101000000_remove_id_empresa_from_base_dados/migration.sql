-- Remove o campo id_empresa da tabela base_dados
-- Esta migração remove a dependência da tabela empresas

-- Remove o índice da chave estrangeira (MySQL não suporta DROP INDEX IF EXISTS)
-- Primeiro verifica se o índice existe
SET @index_exists = (
  SELECT COUNT(1) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'base_dados' 
    AND index_name = 'base_dados_id_empresa_fkey'
);

SET @sql = IF(@index_exists > 0, 'DROP INDEX base_dados_id_empresa_fkey ON base_dados', 'SELECT "Index não existe" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remove a coluna id_empresa (MySQL não suporta DROP COLUMN IF EXISTS)
-- Primeiro verifica se a coluna existe
SET @column_exists = (
  SELECT COUNT(1) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'base_dados' 
    AND column_name = 'id_empresa'
);

SET @sql = IF(@column_exists > 0, 'ALTER TABLE base_dados DROP COLUMN id_empresa', 'SELECT "Coluna não existe" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verifica se a coluna foi removida
SELECT COUNT(*) as colunas_restantes FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'base_dados';
