# Changelog - UniSafe

## [1.7.1] - 2025-08-18

### 🔧 **Corrigido**
- **Separação de responsabilidades entre Configurações e Gestão de Usuários**
  - **Configurações** (menu do usuário): mostra apenas usuários da própria empresa
  - **Gestão de Usuários** (link Sistema): mostra todos os usuários de todas as empresas
- **Controle de acesso corrigido**
  - Rota `/api/users/company`: usuários da própria empresa
  - Rota `/api/users/system`: todos os usuários (apenas para Admins)
- **Segurança mantida** com auditoria de todas as ações

### 🎯 **Funcionalidades**
- Usuários Admin podem gerenciar usuários da própria empresa em Configurações
- Usuários Admin podem gerenciar todos os usuários do sistema em Gestão de Usuários
- Filtros funcionam corretamente para cada contexto
- Interface adaptativa baseada no tipo de acesso

### 🔒 **Segurança**
- Todas as ações são registradas para auditoria
- Controle de acesso baseado em perfil Admin
- Separação clara entre escopo de empresa e escopo de sistema

---

## [1.7.0] - 2025-08-17

### 🆕 **Adicionado**
- Sistema de controle de acesso por empresa
- Perfis de usuário (admin, user, ghost)
- Validação de CNPJ para empresas
- Sistema de logs para auditoria
- Middleware de segurança aprimorado

### 🔧 **Corrigido**
- Relacionamentos entre usuários e empresas
- Validações de segurança
- Tratamento de erros

### 🎯 **Funcionalidades**
- Gestão de usuários por empresa
- Controle de acesso baseado em perfil
- Sistema de auditoria completo
- Validação de dados de entrada

---

## [1.6.2] - 2025-08-16

### 🔧 **Corrigido**
- Problemas de autenticação
- Validações de formulário
- Tratamento de erros

---

## [1.6.0] - 2025-08-15

### 🆕 **Adicionado**
- Sistema de upload de arquivos
- Dashboard interativo
- Tabela de aniversariantes
- Sistema de notificações

---

## [1.5.0] - 2025-08-14

### 🆕 **Adicionado**
- Sistema de gestão de funcionários
- Relatórios básicos
- Filtros de busca

---

## [1.4.0] - 2025-08-13

### 🆕 **Adicionado**
- Sistema de motivos de afastamento
- Gestão de empresas
- Validações de dados

---

## [1.3.0] - 2025-08-12

### 🆕 **Adicionado**
- Dashboard interativo
- Gráficos e estatísticas
- Sistema de métricas

---

## [1.2.0] - 2025-08-11

### 🆕 **Adicionado**
- Tabela de aniversariantes
- Sistema de notificações
- Melhorias na interface

---

## [1.1.0] - 2025-08-10

### 🆕 **Adicionado**
- Sistema de autenticação
- Gestão de usuários
- Interface básica

---

## [1.0.0] - 2025-08-09

### 🎉 **Lançamento Inicial**
- Sistema base de gestão
- Estrutura de banco de dados
- Interface de usuário básica
