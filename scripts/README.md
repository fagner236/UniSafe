# 🏷️ Sistema de Versionamento - UniSafe

Este diretório contém todos os scripts e configurações para o sistema de versionamento automatizado do UniSafe.

## 📋 Visão Geral

O sistema de versionamento UniSafe oferece controle completo e automatizado de versões, incluindo:
- **Versionamento automático** com Semantic Versioning
- **Scripts de rollback** para reverter mudanças
- **Atualização automática** de documentação
- **CHANGELOG automático** com histórico detalhado
- **Backup automático** de versões anteriores
- **Tags Git** para cada release

## 🛠️ Scripts Disponíveis

### 1. **`version.sh`** - Criar Nova Versão
Cria uma nova versão do sistema automaticamente.

```bash
# Uso básico
./scripts/version.sh [tipo] [mensagem]

# Exemplos
./scripts/version.sh patch "Correções de bugs"
./scripts/version.sh minor "Novas funcionalidades"
./scripts/version.sh major "Mudanças incompatíveis"
```

**Tipos de Versão:**
- **`patch`** (1.0.0 → 1.0.1): Correções de bugs e melhorias menores
- **`minor`** (1.0.0 → 1.1.0): Novas funcionalidades compatíveis
- **`major`** (1.0.0 → 2.0.0): Mudanças incompatíveis e refatorações

### 2. **`rollback.sh`** - Fazer Rollback
Reverte o sistema para uma versão anterior.

```bash
# Uso básico
./scripts/rollback.sh [versão]

# Exemplo
./scripts/rollback.sh 1.0.0
```

**Recursos de Segurança:**
- Cria branch de backup da versão atual
- Confirmação antes do rollback
- Stash automático de mudanças não commitadas

### 3. **`version-status.sh`** - Status das Versões
Mostra o status atual do sistema de versionamento.

```bash
./scripts/version-status.sh
```

**Informações Exibidas:**
- Versão atual do projeto
- Status do repositório Git
- Histórico de versões e tags
- Status da documentação
- Scripts disponíveis
- Recomendações

### 4. **`install-versioning.sh`** - Instalação
Instala e configura o sistema de versionamento.

```bash
./scripts/install-versioning.sh
```

**Verificações Automáticas:**
- Git instalado e configurado
- Node.js disponível
- Permissões de scripts
- Arquivos necessários
- Configuração do usuário

## ⚙️ Configuração

### Arquivo de Configuração Principal (`version.config`)
Contém as configurações padrão do sistema:

```bash
# Configurações do Projeto
PROJECT_NAME="UniSafe"
MAIN_BRANCH="main"
BACKUP_BRANCH_PREFIX="backup-v"

# Configurações de Documentação
DOC_FILES=(
    "DOCUMENTACAO_DESENVOLVIMENTO.md"
    "CHECKPOINT_ESTADO_ATUAL.md"
    "README.md"
)

# Configurações de Git
GIT_COMMIT_PREFIX="Release v"
GIT_TAG_PREFIX="v"
```

### Arquivo de Configuração do Usuário (`user.config`)
Configurações personalizáveis criadas automaticamente:

```bash
# Configurações do usuário
USER_NAME="Seu Nome"
USER_EMAIL="seu@email.com"

# Configurações de notificação
SHOW_COLORS=true
SHOW_PROGRESS=true
CONFIRM_ACTIONS=true
```

## 🚀 Fluxo de Trabalho

### 1. **Desenvolvimento Diário**
```bash
# Fazer mudanças no código
# Fazer commit das mudanças
git add .
git commit -m "Descrição das mudanças"
```

### 2. **Criar Nova Versão**
```bash
# Verificar status
./scripts/version-status.sh

# Criar versão patch (correções)
./scripts/version.sh patch "Correções de bugs"

# Ou versão minor (funcionalidades)
./scripts/version.sh minor "Nova funcionalidade implementada"
```

### 3. **Em Caso de Problemas**
```bash
# Fazer rollback para versão anterior
./scripts/rollback.sh 1.0.0

# Verificar status
./scripts/version-status.sh
```

## 📚 Estrutura de Arquivos

```
scripts/
├── README.md                 # Esta documentação
├── version.sh               # Script principal de versionamento
├── rollback.sh              # Script de rollback
├── version-status.sh        # Script de status
├── install-versioning.sh    # Script de instalação
├── version.config           # Configurações do sistema
└── user.config              # Configurações do usuário
```

## 🔧 Personalização

### Modificar Mensagens Padrão
Edite o arquivo `version.config`:

```bash
# Mensagens padrão
DEFAULT_PATCH_MESSAGE="Correções e melhorias"
DEFAULT_MINOR_MESSAGE="Novas funcionalidades implementadas"
DEFAULT_MAJOR_MESSAGE="Mudanças incompatíveis e refatorações"
```

### Adicionar Novos Arquivos de Documentação
Edite o array `DOC_FILES` em `version.config`:

```bash
DOC_FILES=(
    "DOCUMENTACAO_DESENVOLVIMENTO.md"
    "CHECKPOINT_ESTADO_ATUAL.md"
    "README.md"
    "NOVO_ARQUIVO.md"  # Adicione aqui
)
```

## 🚨 Solução de Problemas

### Erro: "Repositório Git não encontrado"
```bash
# Solução: Inicializar repositório
git init
git config user.name "Seu Nome"
git config user.email "seu@email.com"
```

### Erro: "Scripts não executáveis"
```bash
# Solução: Tornar scripts executáveis
chmod +x scripts/*.sh
```

### Erro: "Node.js não encontrado"
```bash
# Solução: Instalar Node.js
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm

# Windows
# Baixar de https://nodejs.org/
```

### Problema: Versões não sincronizadas
```bash
# Solução: Verificar e sincronizar
./scripts/version-status.sh
git status
git pull origin main
```

## 📖 Exemplos Práticos

### Exemplo 1: Correção de Bug
```bash
# 1. Fazer correção no código
# 2. Commit das mudanças
git add .
git commit -m "Corrigido bug na validação de CPF"

# 3. Criar versão patch
./scripts/version.sh patch "Correção de bug na validação de CPF"
```

### Exemplo 2: Nova Funcionalidade
```bash
# 1. Implementar nova funcionalidade
# 2. Commit das mudanças
git add .
git commit -m "Implementada funcionalidade de exportação"

# 3. Criar versão minor
./scripts/version.sh minor "Nova funcionalidade de exportação implementada"
```

### Exemplo 3: Rollback de Emergência
```bash
# 1. Identificar problema na versão atual
# 2. Fazer rollback para versão estável
./scripts/rollback.sh 1.0.1

# 3. Verificar status
./scripts/version-status.sh
```

## 🔗 Integração com CI/CD

O sistema de versionamento pode ser integrado com pipelines de CI/CD:

```yaml
# Exemplo para GitHub Actions
- name: Create Release
  run: |
    ./scripts/version.sh patch "Release automático"
    git push origin main --tags
```

## 📞 Suporte

Para problemas ou dúvidas sobre o sistema de versionamento:

1. **Verificar status:** `./scripts/version-status.sh`
2. **Reinstalar sistema:** `./scripts/install-versioning.sh`
3. **Verificar logs:** `git log --oneline`
4. **Verificar tags:** `git tag -l`

---

**🎯 Dica:** Sempre execute `./scripts/version-status.sh` antes de criar uma nova versão para verificar se tudo está funcionando corretamente.
