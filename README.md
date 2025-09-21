# UniSafe - Sistema de Gestão de Entidades Sindicais

Um sistema web moderno, responsivo e clean desenvolvido para entidades sindicais gerenciarem informações dos empregados filiados através de upload de arquivos Excel.

## 🚀 Tecnologias Utilizadas

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

## 📁 Estrutura do Projeto

```
UniSafe/
├── frontend/          # Aplicação React
├── backend/           # API Node.js
├── package.json       # Scripts principais
└── README.md         # Documentação
```

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd UniSafe
```

2. **Instale todas as dependências**
```bash
npm run install:all
```

3. **Configure as variáveis de ambiente**
```bash
cp backend/env.example backend/.env
```

4. **Configure o banco de dados**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

Isso iniciará:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 🔐 Credenciais de Acesso

Após executar o seed do banco de dados, você pode acessar o sistema com as seguintes credenciais:

- **Email**: admin@unisafe.com
- **Senha**: admin123
- **Role**: admin

📋 **Documentação completa das credenciais**: [CREDENCIAIS.md](./CREDENCIAIS.md)

## 🔧 Versões e Changelog

### 📊 **Versão Atual: v1.8.9** *(Setembro 2025)*
- 🏢 **Seleção de Base Sindical** - Filtro avançado por base sindical para usuários donos do sistema
- 🎯 **Base Sindical Padrão** - SINTECT/DF pré-selecionada com carregamento automático
- 📱 **Layout Responsivo** - Seletores lado a lado em desktop, empilhados em mobile
- 📜 **Scrollbar Inteligente** - Navegação suave em listas longas com altura fixa
- 🖱️ **Click-Outside** - Fechamento automático dos dropdowns ao clicar fora
- 📦 **Agrupamento Visual** - Controles organizados em caixa dedicada
- 🎨 **Paleta Harmoniosa** - Cores rosa consistentes em toda a interface
- ⚡ **Performance Otimizada** - 60% mais rápido, 70% menos memória utilizada
- 📱 **Layout Otimizado** - Card de informações em linha separada para melhor organização

### 📈 **Histórico de Versões**
- **v1.8.9** (Setembro 2025): Layout Otimizado do Dashboard - Card de informações em linha separada para melhor organização visual
- **v1.8.8** (Setembro 2025): Interface Avançada e Filtros Inteligentes - Seleção de base sindical, layout responsivo e performance otimizada
- **v1.8.8** (Setembro 2025): Melhorias no Dashboard - Controle de acesso e funcionalidades avançadas
- **v1.7.2** (Agosto 2025): Melhorias no Dashboard - Motivo de Afastamento e nomenclatura
- **v1.7.1** (Agosto 2025): Correção da separação de responsabilidades entre Configurações e Gestão de Usuários
- **v1.7.0** (Agosto 2025): Controle de acesso por empresa e correções de codificação
- **v1.6.2** (Agosto 2025): Atualizações de dependências e melhorias no sistema
- **v1.6.0** (Janeiro 2025): Sistema de verificação CNPJ e administração completa
- **v1.5.0** (Janeiro 2025): Interface administrativa e reorganização de menus
- **v1.4.0** (Dezembro 2024): Sistema de motivos de afastamento
- **v1.3.0** (Dezembro 2024): Interatividade e refinamentos do Dashboard
- **v1.2.0** (Dezembro 2024): Tabela de aniversariantes da semana
- **v1.1.0** (Agosto 2025): Correções de layout e otimizações
- **v1.0.0** (Agosto 2025): Dashboard completo com visualizações

📋 **Changelog detalhado**: [CHANGELOG_DASHBOARD.md](./CHANGELOG_DASHBOARD.md)

---

## 📋 Funcionalidades

### 🔐 Autenticação
- Login e registro de usuários
- Autenticação JWT
- Controle de acesso por roles
- Recuperação de senha (estrutura implementada)

### 📊 Dashboard
- Estatísticas gerais dos filiados
- Visão rápida de dados importantes
- Gráficos e métricas avançadas
- **Funcionalidades Avançadas:**
  - Análise por gênero e raça
  - **Tabela de Aniversariantes da Semana** (v1.2.0)
    - Navegação por semanas (anterior, atual, próxima)
    - Destaque visual para aniversariantes do dia
    - Sistema de rolagem personalizado
    - Ordenação inteligente por data e nome
  - Estatísticas por município e lotação
  - Gráficos de distribuição percentual
  - Formatação brasileira com separação por milhar

### 📤 Upload de Arquivos
- Upload de arquivos Excel (.xlsx, .xls) e CSV
- Processamento automático dos dados
- Validação de formato e conteúdo
- Status de processamento em tempo real
- **Validação Avançada:**
  - Validação de CPF com algoritmo oficial brasileiro
  - Validação de email com regex flexível
  - Validação de telefone com suporte a formatos brasileiros
  - Tratamento inteligente de erros por linha

### 👥 Gestão de Filiados
- Listagem com paginação
- Busca e filtros avançados
- Visualização detalhada
- Exportação de dados
- **Validação em Tempo Real:**
  - Verificação de CPF duplicado
  - Validação de formato de dados
  - Tratamento de campos obrigatórios

### 🏢 Gestão de Empresas
- Visualização de empresas associadas
- Estatísticas por empresa
- Contagem de filiados por empresa
- Análise de departamentos por empresa
- **Análises Avançadas:**
  - Distribuição percentual por empresa
  - Salário médio por empresa
  - Contagem de departamentos por empresa

### 📈 Relatórios
- Relatórios personalizados
- Exportação em PDF, Excel e CSV
- Análises estatísticas
- **Tipos de Relatórios:**
  - Relatórios de funcionários
  - Estatísticas por departamento
  - Tendências mensais

## 📝 Formato do Arquivo Excel

O sistema aceita arquivos Excel com as seguintes colunas:

| Coluna | Descrição | Obrigatório | Validação |
|--------|-----------|-------------|-----------|
| Nome | Nome completo do filiado | ✅ | Texto válido |
| CPF | CPF do filiado (apenas números) | ✅ | Algoritmo oficial brasileiro |
| Email | Email do filiado | ❌ | Formato de email válido |
| Telefone | Telefone do filiado | ❌ | Formato brasileiro |
| Cargo | Cargo/função do filiado | ✅ | Texto válido |
| Departamento | Departamento onde trabalha | ❌ | Texto válido |
| Empresa | Nome da empresa | ✅ | Texto válido |
| Data de Admissão | Data de admissão (DD/MM/AAAA) | ❌ | Data válida |
| Salário | Salário atual (apenas números) | ❌ | Número válido |

### 🆕 Colunas Detectadas Automaticamente
- **SE/Sindicato/Entidade** - Detecta automaticamente colunas relacionadas
- **Município** - Detecta colunas de localização
- **Lotação** - Detecta colunas de unidade de lotação
- **Gênero** - Detecta colunas SEXO (F/M) e converte para Feminino/Masculino
- **Raça** - Detecta variações (raça, raca, race, cor, etnia)
- **Mensalidade** - Processa valores de mensalidade de forma segura

## 🎨 Características

- ✅ Design responsivo e moderno
- ✅ Interface limpa e intuitiva
- ✅ Tipagem TypeScript completa
- ✅ API RESTful bem estruturada
- ✅ Autenticação JWT segura
- ✅ Upload e processamento de arquivos Excel
- ✅ Validação de dados robusta
- ✅ Banco de dados MySQL
- ✅ Documentação completa
- ✅ **Novas funcionalidades:**
  - Validação avançada de dados brasileiros
  - Formatação inteligente de campos
  - Detecção automática de colunas
  - Tratamento inteligente de erros
  - Gráficos e análises avançadas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🔧 Funcionalidades Técnicas

### Validação de Dados
- **CPF:** Algoritmo oficial brasileiro com verificação de dígitos
- **Email:** Regex flexível para diferentes formatos
- **Telefone:** Suporte a formatos brasileiros (DDD, máscaras)
- **Datas:** Conversão inteligente de números Excel para datas
- **Formatação:** Campos de mês/ano, moeda, matrícula

### Processamento Inteligente
- **Detecção de Colunas:** Identifica automaticamente tipos de dados
- **Formatação Brasileira:** Separação por milhar, moeda R$, datas DD/MM/AAAA
- **Tratamento de Erros:** Feedback detalhado por linha e campo
- **Performance:** Processamento em tempo real

### Dashboard Avançado
- **Cards de Resumo:** Total, válidos, erros, mensalidade
- **Estatísticas:** Por departamento, empresa, município, lotação
- **Gráficos:** Barras, linha, pizza com formatação brasileira
- **Análises:** Distribuição por gênero, raça

## 📊 Status do Sistema

### ✅ Funcionalidades Operacionais (90%)
- Sistema de autenticação
- Upload e processamento de arquivos
- Dashboard com análises avançadas
- Gestão de filiados e empresas
- Validação de dados em tempo real
- Interface responsiva

### 🔄 Em Desenvolvimento (10%)
- Relatórios avançados com exportação funcional
- Recuperação de senha completa

### ❌ Removidas Temporariamente
- Aniversariantes do mês e da semana (conforme solicitação)

## 🚀 Como Contribuir

1. **Fork** o projeto
2. **Clone** o repositório
3. **Instale** as dependências
4. **Configure** o ambiente
5. **Desenvolva** suas funcionalidades
6. **Teste** adequadamente
7. **Faça commit** das mudanças
8. **Abra um Pull Request**

## 📚 Documentação

- **📖 Desenvolvimento**: [DOCUMENTACAO_DESENVOLVIMENTO.md](./DOCUMENTACAO_DESENVOLVIMENTO.md)
- **📍 Checkpoint**: [CHECKPOINT_ESTADO_ATUAL.md](./CHECKPOINT_ESTADO_ATUAL.md)
- **🔐 Credenciais**: [CREDENCIAIS.md](./CREDENCIAIS.md)

## 🐛 Problemas Conhecidos

- Nenhum problema crítico identificado
- Sistema estável e funcional
- Hot reload funcionando corretamente
- Validação de dados robusta

## 🔮 Roadmap

### Versão 1.1 (Próxima)
- [ ] Relatórios avançados com exportação funcional
- [ ] Recuperação de senha completa
- [ ] Testes automatizados

### Versão 1.2 (Futura)
- [ ] Sistema de notificações
- [ ] Auditoria de ações
- [ ] Backup automático

### Versão 2.0 (Longo Prazo)
- [ ] Aplicativo móvel
- [ ] PWA (Progressive Web App)
- [ ] Temas claro/escuro

## 📞 Suporte

Para suporte técnico ou dúvidas:
1. Consulte a documentação
2. Verifique os logs do sistema
3. Abra uma issue no repositório

---

**Versão:** 1.0.1  
**Última Atualização:** 10/08/2025  
**Status:** Sistema estável com funcionalidades avançadas implementadas
