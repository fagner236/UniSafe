#!/bin/bash

# Script de Versionamento - UniSafe
# Versão corrigida sem caracteres especiais

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    error "Repositório Git não encontrado. Execute 'git init' primeiro."
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas. Commitando automaticamente..."
    git add .
    git commit -m "Auto-commit antes do versionamento"
fi

# Obter versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version")
log "Versão atual: $CURRENT_VERSION"

# Determinar tipo de versão
if [ -z "$1" ]; then
    echo -e "${BLUE}Tipos de versão disponíveis:${NC}"
    echo "  patch - Correções de bugs (1.0.0 → 1.0.1)"
    echo "  minor - Novas funcionalidades (1.0.0 → 1.1.0)"
    echo "  major - Mudanças incompatíveis (1.0.0 → 2.0.0)"
    echo ""
    read -p "Escolha o tipo de versão: " VERSION_TYPE
else
    VERSION_TYPE=$1
fi

# Validar tipo de versão
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    error "Tipo de versão inválido. Use: major, minor ou patch"
    exit 1
fi

# Obter mensagem de release
if [ -z "$2" ]; then
    read -p "Mensagem do release: " RELEASE_MESSAGE
else
    RELEASE_MESSAGE=$2
fi

# Incrementar versão
log "Incrementando versão $VERSION_TYPE..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
NEW_VERSION=${NEW_VERSION:1} # Remove o 'v' do início
log "Nova versão: $NEW_VERSION"

# Atualizar versão nos arquivos de documentação
log "Atualizando documentação..."

# Atualizar DOCUMENTACAO_DESENVOLVIMENTO.md
if [ -f "DOCUMENTACAO_DESENVOLVIMENTO.md" ]; then
    sed -i '' "s/^Versão do Sistema.*$/Versão do Sistema: \`$NEW_VERSION\`/" DOCUMENTACAO_DESENVOLVIMENTO.md
    sed -i '' "s/^Última Atualização.*$/Última Atualização: \`$(date +%d\/%m\/%Y)\`/" DOCUMENTACAO_DESENVOLVIMENTO.md
fi

# Atualizar CHECKPOINT_ESTADO_ATUAL.md
if [ -f "CHECKPOINT_ESTADO_ATUAL.md" ]; then
    sed -i '' "s/^Versão.*$/Versão: \`$NEW_VERSION\`/" CHECKPOINT_ESTADO_ATUAL.md
    sed -i '' "s/^Data.*$/Data: \`$(date +%d\/%m\/%Y)\`/" CHECKPOINT_ESTADO_ATUAL.md
fi

# Atualizar README.md
if [ -f "README.md" ]; then
    sed -i '' "s/^Versão.*$/Versão: \`$NEW_VERSION\`/" README.md
    sed -i '' "s/^Última Atualização.*$/Última Atualização: \`$(date +%d\/%m\/%Y)\`/" README.md
fi

# Atualizar CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    TODAY=$(date +%Y-%m-%d)
    sed -i '' "s/^## \[Unreleased\]/## \[$NEW_VERSION\] - $TODAY\n\n### Adicionado\n- $RELEASE_MESSAGE\n\n## [Unreleased]/" CHANGELOG.md
fi

log "Documentação atualizada com sucesso!"

# Commit das mudanças
log "Commitando mudanças..."
git add .
git commit -m "Release v$NEW_VERSION: $RELEASE_MESSAGE"

# Criar tag Git
log "Criando tag Git v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION: $RELEASE_MESSAGE"

# Push das mudanças e tags
log "Enviando mudanças para o repositório remoto..."
git push origin main
git push origin "v$NEW_VERSION"

# Resumo final
echo ""
echo -e "${GREEN}✅ Release v$NEW_VERSION criado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Resumo das ações:${NC}"
echo "  • Versão incrementada: $CURRENT_VERSION → $NEW_VERSION"
echo "  • Documentação atualizada"
echo "  • Commit criado: Release v$NEW_VERSION: $RELEASE_MESSAGE"
echo "  • Tag Git criada: v$NEW_VERSION"
echo "  • Mudanças enviadas para o repositório remoto"
echo ""
echo -e "${BLUE}🚀 Próximos passos:${NC}"
echo "  • Verificar se o sistema está funcionando"
echo "  • Testar as novas funcionalidades"
echo "  • Atualizar documentação de usuário se necessário"
echo ""
echo -e "${GREEN}🎉 Sistema versionado com sucesso!${NC}"
