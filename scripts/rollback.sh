#!/bin/bash

# Script de Rollback - UniSafe
# Uso: ./scripts/rollback.sh [versão]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto (UniSafe/)"
    exit 1
fi

# Verificar se o Git está inicializado
if [ ! -d ".git" ]; then
    error "Repositório Git não encontrado."
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas. Commitando automaticamente..."
    git add .
    git commit -m "Auto-commit antes do rollback"
fi

# Obter versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version")
log "Versão atual: $CURRENT_VERSION"

# Obter versão para rollback
if [ -z "$1" ]; then
    echo -e "${BLUE}Versões disponíveis:${NC}"
    git tag --sort=-version:refname | head -10
    echo ""
    read -p "Digite a versão para rollback (ex: 1.0.0): " ROLLBACK_VERSION
else
    ROLLBACK_VERSION=$1
fi

# Verificar se a versão existe
if ! git tag | grep -q "^$ROLLBACK_VERSION$"; then
    error "Versão $ROLLBACK_VERSION não encontrada!"
    echo "Versões disponíveis:"
    git tag --sort=-version:refname
    exit 1
fi

# Confirmar rollback
echo ""
warn "⚠️  ATENÇÃO: Rollback para versão $ROLLBACK_VERSION"
echo "Isso irá:"
echo "  • Reverter o código para a versão $ROLLBACK_VERSION"
echo "  • Manter as mudanças não commitadas em um stash"
echo "  • Criar um branch de backup da versão atual"
echo ""
read -p "Confirma o rollback? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    log "Rollback cancelado."
    exit 0
fi

# Criar branch de backup da versão atual
BACKUP_BRANCH="backup-v$CURRENT_VERSION-$(date +%Y%m%d-%H%M%S)"
log "Criando branch de backup: $BACKUP_BRANCH"
git checkout -b "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH"

# Voltar para o branch principal
git checkout main

# Fazer stash das mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    log "Salvando mudanças não commitadas..."
    git stash push -m "Stash antes do rollback para v$ROLLBACK_VERSION"
fi

# Fazer checkout da versão específica
log "Fazendo checkout da versão $ROLLBACK_VERSION..."
git checkout "$ROLLBACK_VERSION"

# Criar branch temporário para o rollback
ROLLBACK_BRANCH="rollback-v$ROLLBACK_VERSION"
git checkout -b "$ROLLBACK_BRANCH"

# Atualizar versão no package.json
log "Atualizando versão no package.json..."
npm version "$ROLLBACK_VERSION" --no-git-tag-version

# Atualizar documentação
log "Atualizando documentação..."
sed -i '' "s/^Versão do Sistema.*$/Versão do Sistema: \`$ROLLBACK_VERSION\`/" DOCUMENTACAO_DESENVOLVIMENTO.md
sed -i '' "s/^Última Atualização.*$/Última Atualização: \`$(date +%d\/%m\/%Y)\`/" DOCUMENTACAO_DESENVOLVIMENTO.md
sed -i '' "s/^Versão.*$/Versão: \`$ROLLBACK_VERSION\`/" CHECKPOINT_ESTADO_ATUAL.md
sed -i '' "s/^Data.*$/Data: \`$(date +%d\/%m\/%Y)\`/" CHECKPOINT_ESTADO_ATUAL.md
sed -i '' "s/^Versão.*$/Versão: \`$ROLLBACK_VERSION\`/" README.md
sed -i '' "s/^Última Atualização.*$/Última Atualização: \`$(date +%d\/%m\/%Y)\`/" README.md

# Commit das mudanças
git add .
git commit -m "Rollback para versão $ROLLBACK_VERSION"

# Fazer merge no branch principal
log "Fazendo merge no branch principal..."
git checkout main
git merge "$ROLLBACK_BRANCH" --no-ff -m "Rollback para versão $ROLLBACK_VERSION"

# Remover branch temporário
git branch -d "$ROLLBACK_BRANCH"

# Push das mudanças
log "Enviando mudanças para o repositório remoto..."
git push origin main

# Resumo final
echo ""
echo -e "${GREEN}✅ Rollback para versão $ROLLBACK_VERSION concluído!${NC}"
echo ""
echo -e "${BLUE}📋 Resumo das ações:${NC}"
echo "  • Versão atual: $CURRENT_VERSION → $ROLLBACK_VERSION"
echo "  • Branch de backup criado: $BACKUP_BRANCH"
echo "  • Documentação atualizada"
echo "  • Rollback commitado e enviado"
echo ""
echo -e "${BLUE}🔄 Como reverter o rollback:${NC}"
echo "  • git checkout $BACKUP_BRANCH"
echo "  • git checkout -b main-backup"
echo "  • git checkout main"
echo "  • git merge main-backup"
echo ""
echo -e "${BLUE}📁 Branches disponíveis:${NC}"
echo "  • main (versão atual: $ROLLBACK_VERSION)"
echo "  • $BACKUP_BRANCH (versão anterior: $CURRENT_VERSION)"
echo ""
echo -e "${GREEN}🎉 Rollback concluído com sucesso!${NC}"
