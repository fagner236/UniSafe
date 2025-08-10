#!/bin/bash

# Script de Instalação do Sistema de Versionamento - UniSafe
# Uso: ./scripts/install-versioning.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              INSTALAÇÃO DO SISTEMA DE VERSIONAMENTO         ║${NC}"
echo -e "${CYAN}║                           UNISAFE                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto (UniSafe/)"
    exit 1
fi

log "Iniciando instalação do sistema de versionamento..."

# 1. Verificar se o Git está instalado
log "Verificando instalação do Git..."
if ! command -v git &> /dev/null; then
    error "Git não está instalado. Instale o Git primeiro."
    echo "  • macOS: brew install git"
    echo "  • Ubuntu/Debian: sudo apt-get install git"
    echo "  • Windows: https://git-scm.com/download/win"
    exit 1
fi
success "Git encontrado: $(git --version)"

# 2. Verificar se o Node.js está instalado
log "Verificando instalação do Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Instale o Node.js primeiro."
    echo "  • macOS: brew install node"
    echo "  • Ubuntu/Debian: sudo apt-get install nodejs npm"
    echo "  • Windows: https://nodejs.org/"
    exit 1
fi
success "Node.js encontrado: $(node --version)"
success "npm encontrado: $(npm --version)"

# 3. Inicializar repositório Git se não existir
if [ ! -d ".git" ]; then
    log "Inicializando repositório Git..."
    git init
    success "Repositório Git inicializado"
else
    success "Repositório Git já existe"
fi

# 4. Configurar usuário Git se não estiver configurado
if [ -z "$(git config user.name)" ]; then
    log "Configurando usuário Git..."
    echo "Digite seu nome de usuário para o Git:"
    read -p "Nome: " GIT_USER_NAME
    echo "Digite seu email para o Git:"
    read -p "Email: " GIT_USER_EMAIL
    
    git config user.name "$GIT_USER_NAME"
    git config user.email "$GIT_USER_EMAIL"
    success "Usuário Git configurado: $GIT_USER_NAME <$GIT_USER_EMAIL>"
else
    success "Usuário Git já configurado: $(git config user.name) <$(git config user.email)>"
fi

# 5. Tornar scripts executáveis
log "Configurando permissões dos scripts..."
chmod +x scripts/*.sh
success "Scripts tornados executáveis"

# 6. Verificar se todos os arquivos necessários existem
log "Verificando arquivos do sistema de versionamento..."
REQUIRED_FILES=(
    "scripts/version.sh"
    "scripts/rollback.sh"
    "scripts/version-status.sh"
    "scripts/version.config"
    "CHANGELOG.md"
    ".gitignore"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    success "Todos os arquivos necessários encontrados"
else
    error "Arquivos em falta:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  • $file"
    done
    exit 1
fi

# 7. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas. Deseja fazer commit agora?"
    read -p "Fazer commit? (y/N): " DO_COMMIT
    
    if [[ "$DO_COMMIT" =~ ^[Yy]$ ]]; then
        log "Fazendo commit das mudanças..."
        git add .
        git commit -m "Instalação do sistema de versionamento"
        success "Mudanças commitadas"
    else
        warn "Lembre-se de fazer commit das mudanças antes de usar o versionamento"
    fi
else
    success "Repositório limpo"
fi

# 8. Criar primeira versão se não existir
if [ -z "$(git tag)" ]; then
    log "Criando primeira versão..."
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    git tag -a "v$CURRENT_VERSION" -m "Release v$CURRENT_VERSION: Instalação inicial"
    success "Primeira versão criada: v$CURRENT_VERSION"
else
    success "Versões já existem: $(git tag | tr '\n' ' ')"
fi

# 9. Testar scripts
log "Testando scripts de versionamento..."
if ./scripts/version-status.sh > /dev/null 2>&1; then
    success "Script de status funcionando"
else
    warn "Script de status pode ter problemas"
fi

# 10. Criar arquivo de configuração do usuário
log "Criando configuração personalizada..."
cat > scripts/user.config << EOF
# Configuração Personalizada do Usuário - UniSafe
# Este arquivo pode ser editado para personalizar o comportamento

# Configurações do usuário
USER_NAME="$(git config user.name)"
USER_EMAIL="$(git config user.email)"

# Configurações de notificação
SHOW_COLORS=true
SHOW_PROGRESS=true
CONFIRM_ACTIONS=true

# Configurações de backup
CREATE_BACKUP_ON_ROLLBACK=true
BACKUP_TIMESTAMP_FORMAT="%Y%m%d-%H%M%S"

# Mensagens personalizadas
CUSTOM_PATCH_MESSAGE=""
CUSTOM_MINOR_MESSAGE=""
CUSTOM_MAJOR_MESSAGE=""
EOF

success "Configuração personalizada criada"

# 11. Instruções finais
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    INSTALAÇÃO CONCLUÍDA!                    ║${NC}"
echo -e "${CYan}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎉 Sistema de versionamento instalado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Comandos disponíveis:${NC}"
echo "  • ${GREEN}./scripts/version-status.sh${NC} - Ver status das versões"
echo "  • ${GREEN}./scripts/version.sh patch${NC} - Nova versão patch (1.0.0 → 1.0.1)"
echo "  • ${GREEN}./scripts/version.sh minor${NC} - Nova versão minor (1.0.0 → 1.1.0)"
echo "  • ${GREEN}./scripts/version.sh major${NC} - Nova versão major (1.0.0 → 2.0.0)"
echo "  • ${GREEN}./scripts/rollback.sh${NC} - Fazer rollback para versão anterior"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "  • CHANGELOG.md - Histórico de mudanças"
echo "  • scripts/version.config - Configurações do sistema"
echo "  • scripts/user.config - Configurações personalizadas"
echo ""
echo -e "${BLUE}🚀 Próximos passos:${NC}"
echo "  • Teste o sistema com: ./scripts/version-status.sh"
echo "  • Crie uma nova versão: ./scripts/version.sh patch"
echo "  • Personalize as configurações em scripts/user.config"
echo ""
echo -e "${GREEN}✅ Sistema pronto para uso!${NC}"
