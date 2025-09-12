# Importação para Base de Dados - UniSafe

## Visão Geral

O sistema UniSafe agora inclui uma funcionalidade completa para importar dados de arquivos Excel/CSV diretamente para a tabela `base_dados` do banco de dados. Esta funcionalidade permite que administradores do sistema carreguem dados estruturados e os disponibilizem para análise completa no dashboard.

## Funcionalidades Implementadas

### 1. Upload e Processamento de Arquivos
- **Formatos Suportados**: Excel (.xlsx, .xls) e CSV
- **Validação Automática**: Verificação de estrutura e qualidade dos dados
- **Processamento Inteligente**: Conversão automática de datas e formatação de valores

### 2. Importação para Base de Dados
- **Mapeamento Automático**: Sistema identifica e mapeia colunas automaticamente
- **Validação de Dados**: Verificação de campos obrigatórios e formatos
- **Tratamento de Erros**: Relatório detalhado de problemas encontrados

### 3. Interface de Progresso
- **Monitoramento em Tempo Real**: Barra de progresso com porcentagem
- **Status Detalhado**: Informações sobre registros processados e erros
- **Relatório Final**: Resumo completo da importação

## Estrutura da Tabela base_dados

A tabela `base_dados` contém os seguintes campos:

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `mes` | VARCHAR(50) | Mês de referência | Sim |
| `se` | VARCHAR(50) | Superintendência | Sim |
| `lotacao` | VARCHAR(100) | Lotação/Setor | Sim |
| `municipio` | VARCHAR(100) | Município | Sim |
| `matricula` | VARCHAR(50) | Matrícula do funcionário | Sim |
| `nome` | VARCHAR(255) | Nome completo | Sim |
| `sexo` | VARCHAR(20) | Sexo | Sim |
| `data_nasc` | DATETIME | Data de nascimento | Sim |
| `raca` | VARCHAR(50) | Raça/Etnia | Sim |
| `grau_instrucao` | VARCHAR(100) | Grau de instrução | Sim |
| `data_admissao` | DATETIME | Data de admissão | Sim |
| `cargo` | VARCHAR(100) | Cargo | Sim |
| `cargo_esp` | VARCHAR(100) | Cargo específico | Não |
| `cargo_nivel` | VARCHAR(50) | Nível do cargo | Não |
| `funcao` | VARCHAR(100) | Função | Não |
| `jornada_trab` | VARCHAR(50) | Jornada de trabalho | Não |
| `tipo_deficiencia` | VARCHAR(100) | Tipo de deficiência | Não |
| `data_afast` | DATETIME | Data de afastamento | Não |
| `motivo_afast` | VARCHAR(255) | Motivo do afastamento | Não |
| `base_sindical` | VARCHAR(100) | Base sindical | Sim |
| `filiado` | VARCHAR(10) | Status de filiado | Sim |
| `valor_mensalidade` | DECIMAL(10,2) | Valor da mensalidade | Não |

## Mapeamento Automático de Colunas

O sistema identifica automaticamente as colunas do arquivo e as mapeia para os campos da tabela `base_dados`:

### Campos Obrigatórios
- **Nome**: `Nome`, `Name`, `NOME`, `NAME`, `Funcionário`, `FUNCIONARIO`, `Employee`, `EMPLOYEE`
- **Matrícula**: `Matrícula`, `MATRICULA`, `matricula`, `Matricula`, `Registration`, `REGISTRATION`
- **Data de Nascimento**: `Data Nascimento`, `DATA NASCIMENTO`, `DataNascimento`, `Birth Date`, `BIRTH DATE`
- **Data de Admissão**: `Data Admissao`, `DATA ADMISSAO`, `DataAdmissao`, `Admission Date`, `ADMISSION DATE`

### Campos Opcionais
- **SE**: `SE`, `se`, `Se`, `Superintendência`, `SUPERINTENDENCIA`, `Superintendencia`
- **Lotação**: `Lotacao`, `LOTACAO`, `Lotação`, `LOTAÇÃO`, `Lot`, `LOT`, `Setor`, `SETOR`
- **Município**: `Municipio`, `MUNICIPIO`, `Município`, `MUNICÍPIO`, `Cidade`, `CIDADE`, `City`, `CITY`

## Como Usar

### 1. Fazer Upload do Arquivo
1. Acesse a página de Upload
2. Arraste e solte ou selecione um arquivo Excel/CSV
3. Aguarde o processamento automático

### 2. Revisar Dados Processados
1. Visualize a prévia dos primeiros 5 registros
2. Verifique se as colunas foram mapeadas corretamente
3. Analise os erros encontrados (se houver)

### 3. Importar para Base de Dados
1. Clique no botão "Importar para Base de Dados"
2. Acompanhe o progresso da importação
3. Verifique o relatório final

### 4. Acessar Dashboard
1. Após a importação, os dados estarão disponíveis no dashboard
2. Visualize estatísticas e análises completas
3. Gere relatórios baseados nos dados importados

## Fluxo de Importação

```
Arquivo Excel/CSV → Upload → Processamento → Validação → Importação → Base de Dados
     ↓                    ↓           ↓           ↓           ↓           ↓
  Seleção            Armazenamento  Conversão   Verificação  Mapeamento  Persistência
  do arquivo         temporário     de datas    de campos    de colunas  no banco
```

## Tratamento de Erros

### Tipos de Erro
1. **Erros de Formato**: Datas inválidas, valores monetários incorretos
2. **Erros de Validação**: Campos obrigatórios vazios
3. **Erros de Banco**: Problemas de conexão ou constraints

### Relatório de Erros
- Lista detalhada de problemas encontrados
- Linha específica onde ocorreu cada erro
- Sugestões de correção

## Configurações e Limites

### Limites de Arquivo
- **Tamanho Máximo**: 10MB (configurável)
- **Formatos Suportados**: .xlsx, .xls, .csv
- **Registros por Upload**: Ilimitado (depende da memória disponível)

### Performance
- **Processamento**: Assíncrono com progresso em tempo real
- **Validação**: Em lote para melhor performance
- **Importação**: Transacional com rollback em caso de erro

## Segurança e Permissões

### Controle de Acesso
- **Apenas Administradores**: Apenas usuários com perfil 'admin' podem importar
- **Validação de Empresa**: Dados são importados apenas para a empresa do usuário
- **Log de Auditoria**: Todas as operações são registradas no sistema

### Validação de Dados
- **Sanitização**: Remoção de caracteres perigosos
- **Validação de Tipos**: Verificação de formatos de data, números, etc.
- **Integridade Referencial**: Manutenção de relacionamentos entre tabelas

## Monitoramento e Logs

### Logs de Sistema
- **Upload**: Registro de arquivos enviados
- **Processamento**: Status de cada etapa
- **Importação**: Resultado final com estatísticas

### Métricas de Performance
- **Tempo de Processamento**: Duração de cada etapa
- **Taxa de Sucesso**: Percentual de registros importados
- **Erros por Tipo**: Categorização de problemas encontrados

## Troubleshooting

### Problemas Comuns

#### 1. Arquivo não é processado
- Verificar formato do arquivo
- Confirmar tamanho (máximo 10MB)
- Verificar permissões de usuário

#### 2. Erros de mapeamento de colunas
- Verificar nomes das colunas no arquivo
- Usar nomes padrão quando possível
- Revisar estrutura do arquivo

#### 3. Falhas na importação
- Verificar conectividade com banco de dados
- Confirmar espaço disponível
- Revisar logs de erro

### Soluções Recomendadas

#### 1. Para arquivos grandes
- Dividir em arquivos menores
- Usar formato CSV para melhor performance
- Processar em horários de menor movimento

#### 2. Para problemas de mapeamento
- Padronizar nomes de colunas
- Usar template de exemplo
- Revisar documentação de campos

#### 3. Para erros de validação
- Verificar dados de origem
- Corrigir formatos antes do upload
- Usar validação em lote

## Próximas Melhorias

### Funcionalidades Planejadas
1. **Mapeamento Manual**: Interface para definir mapeamentos personalizados
2. **Validação Customizada**: Regras de validação específicas por empresa
3. **Importação Incremental**: Atualização de dados existentes
4. **Agendamento**: Importação automática em horários específicos
5. **Backup Automático**: Criação de backups antes da importação

### Melhorias de Performance
1. **Processamento Paralelo**: Múltiplas threads para arquivos grandes
2. **Cache Inteligente**: Armazenamento em memória para validações
3. **Compressão**: Suporte a arquivos compactados
4. **Streaming**: Processamento de arquivos muito grandes

## Suporte e Contato

Para dúvidas ou problemas com a funcionalidade de importação:

1. **Verificar Logs**: Consultar logs do sistema para detalhes de erro
2. **Documentação**: Revisar este documento e outros relacionados
3. **Administrador**: Contatar administrador do sistema
4. **Desenvolvimento**: Abrir issue no repositório do projeto

---

**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Desenvolvido por**: Equipe UniSafe
