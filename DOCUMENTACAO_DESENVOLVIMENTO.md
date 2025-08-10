# 📚 Documentação de Desenvolvimento - UniSafe

## 📋 Índice
1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Problemas Resolvidos](#problemas-resolvidos)
6. [Estado Atual do Sistema](#estado-atual-do-sistema)
7. [Configuração e Instalação](#configuração-e-instalação)
8. [Comandos Úteis](#comandos-úteis)
9. [Próximos Passos](#próximos-passos)
10. [Notas de Desenvolvimento](#notas-de-desenvolvimento)

---

## 🎯 Visão Geral do Projeto

**UniSafe** é um sistema web moderno para entidades sindicais gerenciarem informações dos empregados filiados através de upload de arquivos Excel.

### Objetivos Principais
- ✅ Upload e processamento de arquivos Excel/CSV
- ✅ Dashboard com análises estatísticas avançadas
- ✅ Gestão de filiados com busca e filtros
- ✅ Relatórios personalizados
- ✅ Autenticação JWT segura
- ✅ Interface responsiva e moderna

---

## 🏗️ Arquitetura e Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool ultra-rápido
- **React Router** - Navegação entre páginas
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **React Dropzone** - Upload de arquivos
- **Zod** - Validação de schemas
- **Recharts** - Gráficos e visualizações

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **XLSX** - Processamento de arquivos Excel

---

## 📁 Estrutura do Projeto

```
UniSafe/
├── frontend/                    # Aplicação React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Layout.tsx      # Layout principal
│   │   │   ├── Sidebar.tsx     # Menu lateral
│   │   │   ├── Header.tsx      # Cabeçalho
│   │   │   ├── ProtectedRoute.tsx # Rota protegida
│   │   │   └── LoginSidebar.tsx # Sidebar do login
│   │   ├── contexts/           # Contextos React
│   │   │   ├── AuthContext.tsx # Contexto de autenticação
│   │   │   └── DataContext.tsx # Contexto de dados
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Dashboard.tsx   # Dashboard principal
│   │   │   ├── Login.tsx       # Página de login
│   │   │   ├── Upload.tsx      # Upload de arquivos
│   │   │   ├── Employees.tsx   # Lista de funcionários
│   │   │   ├── Reports.tsx     # Relatórios
│   │   │   ├── Companies.tsx   # Gestão de empresas
│   │   │   ├── Profile.tsx     # Perfil do usuário
│   │   │   └── ForgotPassword.tsx # Recuperação de senha
│   │   ├── types/              # Tipos TypeScript
│   │   │   └── index.ts        # Definições de tipos
│   │   ├── App.tsx             # Componente principal
│   │   ├── main.tsx            # Ponto de entrada
│   │   └── index.css           # Estilos globais
│   ├── package.json            # Dependências do frontend
│   └── vite.config.ts          # Configuração do Vite
├── backend/                     # API Node.js
│   ├── src/
│   │   ├── routes/             # Rotas da API
│   │   │   ├── auth.ts         # Rotas de autenticação
│   │   │   ├── employees.ts    # Rotas de funcionários
│   │   │   ├── upload.ts       # Rotas de upload
│   │   │   ├── dashboard.ts    # Rotas do dashboard
│   │   │   └── companies.ts    # Rotas de empresas
│   │   ├── controllers/        # Controladores
│   │   │   ├── authController.ts # Controlador de autenticação
│   │   │   └── uploadController.ts # Controlador de upload
│   │   ├── middleware/         # Middlewares
│   │   │   ├── auth.ts         # Middleware de autenticação
│   │   │   └── errorHandler.ts # Tratamento de erros
│   │   ├── prisma/             # Configuração do Prisma
│   │   │   └── schema.prisma   # Schema do banco
│   │   ├── scripts/            # Scripts utilitários
│   │   │   ├── seed.ts         # Seed do banco de dados
│   │   │   └── check-user.ts   # Verificação de usuários
│   │   └── index.ts            # Servidor principal
│   ├── package.json            # Dependências do backend
│   └── .env                    # Variáveis de ambiente
├── package.json                # Scripts principais
└── README.md                   # Documentação principal
```

---

## 🚀 Funcionalidades Implementadas

### 1. Sistema de Autenticação
- ✅ Login com email e senha
- ✅ Autenticação JWT
- ✅ Proteção de rotas
- ✅ Contexto de autenticação
- ✅ Logout automático
- ✅ Recuperação de senha (estrutura implementada)

### 2. Upload e Processamento de Arquivos
- ✅ Upload de arquivos Excel (.xlsx, .xls) e CSV
- ✅ Validação de formato e conteúdo
- ✅ Processamento em tempo real
- ✅ Detecção automática de colunas
- ✅ Tratamento de erros robusto
- ✅ Status de processamento
- ✅ **Validação Avançada de Dados:**
  - Validação de CPF com algoritmo oficial brasileiro
  - Validação de email com regex flexível
  - Validação de telefone com suporte a formatos brasileiros
  - Tratamento inteligente de erros por linha
- ✅ **Formatação Inteligente de Campos:**
  - Campo MÊS formatado automaticamente de AAAAMM para MM/AAAA
  - Formatação de moeda brasileira (R$)
  - Formatação de datas brasileiras
  - Detecção automática de tipos de dados
  - Formatação de matrícula com zeros à esquerda
  - Conversão inteligente de números Excel para datas

### 3. Dashboard Avançado
- ✅ **Cards de Resumo:**
  - Total de registros
  - Distribuição por Gênero (baseado na coluna SEXO)
  - Distribuição por Raça (baseado na coluna RAÇA)
  - Mensalidade - MM/AAAA (com mês de referência automático)

- ✅ **Estatísticas por Departamento:**
  - Cards visuais com barras de progresso
  - Salário médio por departamento
  - Distribuição percentual

- ✅ **Estatísticas por SE (Sindicato/Entidade):**
  - Tabela completa com funcionários por SE
  - Filiação média
  - Barras de distribuição percentual

- ✅ **Análise por Municípios:**
  - Top 10 municípios com maior número de funcionários
  - Filiação média por cidade
  - Distribuição percentual

- ✅ **Análise por Unidades de Lotação:**
  - Top 10 unidades com maior número de funcionários
  - Filiação média por unidade
  - Distribuição percentual

- ✅ **Novas Estatísticas Implementadas:**
  
  - **Top 10 Estados:** Análise por estado com contagem de funcionários, filiação média e distribuição percentual
  - **Tempo de Filiação:** Distribuição por tempo de filiação sindical (Menos de 1 ano, 1-3 anos, 3-5 anos, 5-10 anos, 10-20 anos, Mais de 20 anos)
  - **Top 10 Cargos/Posições:** Análise por cargo com contagem de funcionários e distribuição percentual
  - **Faixa Etária:** Distribuição por faixas etárias baseada na data de admissão (18-25, 26-35, 36-45, 46-55, 56-65, Acima de 65 anos)

- ✅ **Gráficos Avançados:**
  - Gráfico de barras - Funcionários por Empresa
  - Gráfico de linha - Salário Médio por Departamento
  - **Novos Gráficos de Distribuição:**
    - Gráfico de barras - Distribuição por Gênero (cor #c9504c para Feminino)
    - Gráfico de barras - Distribuição por Raça
    - **Novos Gráficos Implementados:**
      
      - Gráfico de barras - Funcionários por Estado
      - Gráfico de linha - Tempo de Filiação
      - Gráfico de barras - Top 10 Cargos/Posições
      - Gráfico de pizza - Distribuição por Faixa Etária
    - Formatação brasileira com separação por milhar
    - Tooltips informativos e responsivos

- ✅ **Detecção Inteligente de Colunas:**
  - Detecta automaticamente colunas como SE, município, lotação, etc.
  - Processa valores de mensalidade de forma segura
  - Suporta diferentes formatos de dados
  - **Detecção de Colunas de Gênero e Raça:**
    - SEXO: detecta F/M e converte para Feminino/Masculino
    - RAÇA: detecta variações (raça, raca, race, cor, etnia)

- ✅ **Estatísticas de Gênero e Raça:**
  - Análise por sexo/gênero quando disponível
  - Análise por raça/etnia quando disponível
  - Percentuais calculados automaticamente
  - **Formatação Brasileira:**
    - Separação por milhar em todos os números
    - Tooltips em português
    - Eixos dos gráficos formatados adequadamente

### 4. Gestão de Filiados
- ✅ Listagem com paginação
- ✅ Busca e filtros avançados
- ✅ Visualização detalhada
- ✅ Exportação de dados
- ✅ **Validação de Dados em Tempo Real:**
  - Verificação de CPF duplicado
  - Validação de formato de dados
  - Tratamento de campos obrigatórios

### 5. Gestão de Empresas
- ✅ Visualização de empresas associadas
- ✅ Estatísticas por empresa
- ✅ Contagem de filiados por empresa
- ✅ Análise de departamentos por empresa

### 6. Relatórios
- ✅ Estrutura básica de relatórios implementada
- ✅ Relatórios de funcionários
- ✅ Estatísticas por departamento

- ✅ Tendências mensais
- ✅ **Formatos de Exportação:**
  - PDF (estrutura implementada)
  - Excel (estrutura implementada)
  - CSV (estrutura implementada)

### 7. Interface Responsiva
- ✅ Design moderno e limpo
- ✅ Responsivo para todos os dispositivos
- ✅ Navegação intuitiva
- ✅ Feedback visual em tempo real
- ✅ **Componentes Reutilizáveis:**
  - Layout responsivo
  - Sidebar adaptativo
  - Header com navegação
  - Componentes de formulário

### 8. Sistema de Versionamento
- ✅ Controle automático de versões com Git
- ✅ Scripts de versionamento automatizados
- ✅ Sistema de rollback para versões anteriores
- ✅ Atualização automática de documentação
- ✅ CHANGELOG automático e detalhado
- ✅ Backup automático de versões
- ✅ Tags Git para cada release

#### Scripts Disponíveis
- **`./scripts/version.sh`** - Criar nova versão (patch/minor/major)
- **`./scripts/rollback.sh`** - Fazer rollback para versão anterior
- **`./scripts/version-status.sh`** - Ver status atual das versões
- **`./scripts/install-versioning.sh`** - Instalar sistema de versionamento

#### Como Usar
```bash
# Ver status atual
./scripts/version-status.sh

# Criar nova versão patch (1.0.0 → 1.0.1)
./scripts/version.sh patch "Correções de bugs"

# Criar nova versão minor (1.0.0 → 1.1.0)
./scripts/version.sh minor "Novas funcionalidades"

# Criar nova versão major (1.0.0 → 2.0.0)
./scripts/version.sh major "Mudanças incompatíveis"

# Fazer rollback para versão anterior
./scripts/rollback.sh 1.0.0
```

---

## 🔧 Problemas Resolvidos

### 1. Problema da Tela Branca no Dashboard
**Problema:** Dashboard apresentava tela branca após implementação do gráfico de VALOR MENSALIDADE.

**Causa:** Gráfico complexo de VALOR MENSALIDADE estava causando erro de renderização.

**Solução:**
- Implementação de processamento seguro de dados de mensalidade
- Detecção dinâmica de colunas
- Tratamento robusto de diferentes formatos de valores
- Validação de dados antes da renderização

### 2. Problemas de Inicialização do Sistema
**Problema:** Comando `npm run dev` não funcionava corretamente.

**Solução:**
- Inicialização manual do backend e frontend em processos separados
- Uso do `concurrently` para execução simultânea
- Verificação de dependências e configurações

### 3. Problemas de Formatação de Dados
**Problema:** Campo MÊS sendo exibido como valor monetário na prévia de upload.

**Causa:** Lógica genérica de formatação aplicando formatação de moeda a campos de data.

**Solução:**
- Implementação de função `formatMonthYear` específica
- Detecção automática de colunas de mês/ano
- Priorização de formatação de data sobre formatação monetária

### 4. Problemas de TypeScript e Linting
**Problema:** 26 erros de TypeScript e problemas de ESLint.

**Causa:** Imports não utilizados, variáveis não utilizadas e valores potencialmente undefined.

**Solução:**
- Remoção sistemática de imports não utilizados
- Adição de verificações de null/undefined
- Implementação de coalescência nula (??)
- Correção de tipos em funções de callback

### 5. Problemas de Hot Reload
**Problema:** Vite apresentava problemas de Fast Refresh.

**Solução:**
- Remoção do `React.StrictMode` temporariamente
- Configuração adequada do Vite
- Reinicialização do servidor quando necessário

### 6. Problemas de Validação de Dados
**Problema:** Validação inadequada de CPF e outros campos.

**Solução:**
- Implementação de validação de CPF com algoritmo oficial brasileiro
- Validação robusta de email e telefone
- Tratamento inteligente de erros por linha
- Feedback visual detalhado para o usuário

---

## 📊 Estado Atual do Sistema

### ✅ Funcionalidades Operacionais
1. **Sistema de Autenticação** - 100% funcional
2. **Upload de Arquivos** - 100% funcional
3. **Dashboard Principal** - 100% funcional
4. **Processamento de Dados** - 100% funcional
5. **Gráficos e Visualizações** - 100% funcional
6. **Interface Responsiva** - 100% funcional
7. **Validação de Dados** - 100% funcional
8. **Gestão de Empresas** - 100% funcional
9. **Sistema de Relatórios** - Estrutura básica implementada

### 🔄 Funcionalidades em Desenvolvimento
- Relatórios avançados (estrutura básica implementada)
- Exportação de dados (estrutura básica implementada)
- Recuperação de senha (estrutura básica implementada)

### ❌ Funcionalidades Removidas Temporariamente
- **Aniversariantes do Mês e da Semana** - Removidas conforme solicitação do usuário para implementação futura

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- Git instalado (para versionamento)
- MySQL 8.0+
- npm ou yarn

### Instalação
```bash
# 1. Clone o repositório
git clone <repository-url>
cd UniSafe

# 2. Instale todas as dependências
npm run install:all

# 3. Configure as variáveis de ambiente
cp backend/env.example backend/.env
# Edite backend/.env com suas configurações

# 4. Configure o banco de dados
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed

# 5. Inicie o sistema
cd ..
npm run dev
```

### Variáveis de Ambiente (backend/.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/unisafe"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

### Credenciais de Acesso
- **Email:** admin@unisafe.com
- **Senha:** admin123
- **Role:** admin

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Iniciar sistema completo
npm run dev

# Iniciar apenas frontend
npm run dev:frontend

# Iniciar apenas backend
npm run dev:backend

# Build do projeto
npm run build

# Instalar todas as dependências
npm run install:all
```

### Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Resetar banco de dados
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Seed do banco
npm run db:seed
```

### Linting e Testes
```bash
# Lint do projeto completo
npm run lint

# Lint apenas frontend
npm run lint:frontend

# Lint apenas backend
npm run lint:backend

# Testes do projeto completo
npm run test
```

---

## 🎯 Próximos Passos

### Prioridade Alta
1. **Implementação de Aniversariantes** - Conforme solicitação futura do usuário
2. **Relatórios Avançados** - Completar funcionalidades de exportação
3. **Testes Automatizados** - Implementar suite de testes
4. **Otimização de Performance** - Melhorar carregamento de dados

### Prioridade Média
1. **Notificações** - Sistema de alertas e notificações
2. **Auditoria** - Log de ações dos usuários
3. **Backup Automático** - Sistema de backup dos dados
4. **API Documentation** - Documentação da API
5. **Recuperação de Senha** - Completar funcionalidade

### Prioridade Baixa
1. **Temas** - Sistema de temas claro/escuro
2. **Internacionalização** - Suporte a múltiplos idiomas
3. **PWA** - Progressive Web App
4. **Mobile App** - Aplicativo móvel nativo

---

## 📝 Notas de Desenvolvimento

### Decisões Técnicas Importantes
1. **Uso do Prisma ORM** - Escolhido por sua tipagem forte e facilidade de uso
2. **MySQL como Banco** - Escolhido por estabilidade e performance
3. **Vite como Build Tool** - Escolhido por velocidade e modernidade
4. **Tailwind CSS** - Escolhido por produtividade e consistência
5. **Recharts para Gráficos** - Escolhido por flexibilidade e performance

### Padrões de Código
- **TypeScript** em todo o projeto
- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para commits
- **Componentes Funcionais** com hooks
- **Context API** para gerenciamento de estado

### Estrutura de Dados
```typescript
// Exemplo de estrutura de dados processados
interface ProcessedData {
  employees: Employee[];
  columns: string[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    companies: string[];
    departments: string[];
    averageSalary: number;
  };
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  uploadedAt: string;
  fileName: string;
}

interface Employee {
  id: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  position?: string;
  department?: string;
  company?: string;
  admissionDate?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'pending';
  unionMemberSince?: string;
  lastUpdate: string;
  [key: string]: any; // Para colunas dinâmicas
}
```

### Performance
- **Lazy Loading** de componentes
- **Memoização** de cálculos pesados
- **Debounce** em buscas
- **Pagination** em listas grandes
- **Virtual Scrolling** para grandes datasets

### Segurança
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Validação** de entrada de dados
- **Sanitização** de dados
- **CORS** configurado adequadamente

---

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Tela Branca no Dashboard
**Sintomas:** Dashboard não carrega, tela branca
**Solução:** Verificar console do navegador, reiniciar servidor frontend

#### 2. Erro de Conexão com Banco
**Sintomas:** Erro 500, problemas de autenticação
**Solução:** Verificar DATABASE_URL, status do MySQL

#### 3. Problemas de Upload
**Sintomas:** Arquivo não processa, erro de formato
**Solução:** Verificar formato do arquivo, tamanho máximo

#### 4. Hot Reload Não Funciona
**Sintomas:** Mudanças não aparecem automaticamente
**Solução:** Reiniciar servidor Vite, verificar configurações

#### 5. Problemas de Validação
**Sintomas:** Dados não são validados corretamente
**Solução:** Verificar formato dos dados, console de erros

### Logs Úteis
```bash
# Logs do frontend
cd frontend && npm run dev

# Logs do backend
cd backend && npm run dev

# Logs do banco
npx prisma studio
```

---

## 📞 Suporte

Para problemas técnicos ou dúvidas sobre o desenvolvimento:

1. **Verificar esta documentação** primeiro
2. **Consultar logs** do sistema
3. **Verificar configurações** de ambiente
4. **Testar em ambiente limpo** se necessário

---

**Última Atualização:** 10/08/2025  
**Versão do Sistema:** 1.0.1  
**Status:** Sistema estável com funcionalidades avançadas implementadas
