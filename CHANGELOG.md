# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Sistema de versionamento automático
- Scripts de release automatizados
- Controle de versões com Git tags

## [1.0.1] - 2025-08-10

### Adicionado
- **Novas Estatísticas do Dashboard:**
  - Top 10 Estados com análise por estado
  - Tempo de Filiação com distribuição sindical
  - Top 10 Cargos/Posições com análise por cargo
  - Faixa Etária baseada na data de admissão
- **Validação Avançada de Dados:**
  - Validação de CPF com algoritmo oficial brasileiro
  - Validação de email com regex flexível
  - Validação de telefone com formatos brasileiros
  - Tratamento inteligente de erros por linha
- **Formatação Inteligente de Campos:**
  - Conversão automática de números Excel para datas
  - Formatação brasileira de moeda e datas
  - Detecção automática de colunas
- **Gestão de Empresas:**
  - Visualização de empresas associadas
  - Estatísticas por empresa
  - Análise de departamentos por empresa
- **Sistema de Relatórios:**
  - Estrutura básica implementada
  - Relatórios de funcionários
  - Estatísticas por departamento
  - Tendências mensais
- **Recuperação de Senha:**
  - Estrutura básica implementada

### Alterado
- Dashboard aprimorado com novas estatísticas
- Sistema de validação mais robusto
- Interface de usuário melhorada
- Processamento de dados mais inteligente

### Removido
- Estatísticas de Faixa Salarial (sem dados disponíveis)

### Corrigido
- Problemas de validação de dados
- Erros de formatação brasileira
- Problemas de hot reload
- Inconsistências de tipos TypeScript

## [1.0.0] - 2025-08-09

### Adicionado
- **Sistema Base:**
  - Autenticação JWT
  - Upload e processamento de arquivos Excel/CSV
  - Dashboard com estatísticas básicas
  - Gestão de filiados
  - Interface responsiva
- **Funcionalidades Core:**
  - Cards de resumo (Total, Válidos, Erros, Mensalidade)
  - Estatísticas por Departamento
  - Estatísticas por SE (Sindicato/Entidade)
  - Análise por Municípios (Top 10)
  - Análise por Unidades de Lotação (Top 10)
  - Gráficos (Barras, Linha, Pizza)
- **Tecnologias:**
  - Frontend: React 18, TypeScript, Tailwind CSS
  - Backend: Node.js, Express, TypeScript, Prisma
  - Banco de dados: MySQL
  - Autenticação: JWT, bcrypt

### Alterado
- Sistema inicial funcional

### Removido
- N/A

### Corrigido
- N/A

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Deprecado** para funcionalidades que serão removidas em breve
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para correções de vulnerabilidades
