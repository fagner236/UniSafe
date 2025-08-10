#!/bin/bash

# Script de Status de Versões - UniSafe
# Uso: ./scripts/version-status.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    STATUS DE VERSÕES - UNISAFE              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Informações do projeto
PROJECT_NAME=$(node -p "require('./package.json').name")
CURRENT_VERSION=$(node -p "require('./package.json').version")
DESCRIPTION=$(node -p "require('./package.json').description")

echo -e "${BLUE}📋 Informações do Projeto:${NC}"
echo "  • Nome: $PROJECT_NAME"
echo "  • Versão Atual: ${GREEN}$CURRENT_VERSION${NC}"
echo "  • Descrição: $DESCRIPTION"
echo ""

# Status do Git
echo -e "${BLUE}🔍 Status do Git:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "  • Branch Atual: $CURRENT_BRANCH"

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "  • Status: ${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    echo -e "  • Arquivos modificados:"
    git status --porcelain | sed 's/^/    /'
else
    echo -e "  • Status: ${GREEN}✅ Repositório limpo${NC}"
fi
echo ""

# Histórico de versões
echo -e "${BLUE}🏷️  Histórico de Versões:${NC}"
if [ -n "$(git tag)" ]; then
    echo "  • Tags disponíveis:"
    git tag --sort=-version:refname | while read tag; do
        TAG_DATE=$(git log -1 --format=%cd --date=short $tag)
        TAG_MESSAGE=$(git tag -l --format='%(contents:subject)' $tag)
        echo -e "    ${GREEN}$tag${NC} ($TAG_DATE) - $TAG_MESSAGE"
    done
else
    echo "  • Nenhuma tag encontrada"
fi
echo ""

# Últimos commits
echo -e "${BLUE}📝 Últimos Commits:${NC}"
git log --oneline -5 | while read commit; do
    echo "  • $commit"
done
echo ""

# Status dos branches
echo -e "${BLUE}🌿 Branches Disponíveis:${NC}"
git branch -a | while read branch; do
    if [[ $branch == *"*"* ]]; then
        echo -e "  • ${GREEN}${branch#* }${NC} (atual)"
    else
        echo -e "  • ${branch#* }"
    fi
done
echo ""

# Informações de documentação
echo -e "${BLUE}📚 Status da Documentação:${NC}"
if [ -f "DOCUMENTACAO_DESENVOLVIMENTO.md" ]; then
    DOC_VERSION=$(grep "Versão do Sistema:" DOCUMENTACAO_DESENVOLVIMENTO.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    DOC_DATE=$(grep "Última Atualização:" DOCUMENTACAO_DESENVOLVIMENTO.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    echo "  • Documentação de Desenvolvimento: ${GREEN}v$DOC_VERSION${NC} ($DOC_DATE)"
else
    echo "  • Documentação de Desenvolvimento: ${RED}❌ Não encontrada${NC}"
fi

if [ -f "CHECKPOINT_ESTADO_ATUAL.md" ]; then
    CHECK_VERSION=$(grep "Versão:" CHECKPOINT_ESTADO_ATUAL.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    CHECK_DATE=$(grep "Data:" CHECKPOINT_ESTADO_ATUAL.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    echo "  • Checkpoint Estado Atual: ${GREEN}v$CHECK_VERSION${NC} ($CHECK_DATE)"
else
    echo "  • Checkpoint Estado Atual: ${RED}❌ Não encontrada${NC}"
fi

if [ -f "README.md" ]; then
    README_VERSION=$(grep "Versão:" README.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    README_DATE=$(grep "Última Atualização:" README.md | head -1 | sed 's/.*`\(.*\)`.*/\1/')
    echo "  • README: ${GREEN}v$README_VERSION${NC} ($README_DATE)"
else
    echo "  • README: ${RED}❌ Não encontrada${NC}"
fi

if [ -f "CHANGELOG.md" ]; then
    echo "  • CHANGELOG: ${GREEN}✅ Disponível${NC}"
else
    echo "  • CHANGELOG: ${RED}❌ Não encontrado${NC}"
fi
echo ""

# Scripts disponíveis
echo -e "${BLUE}🛠️  Scripts de Versionamento:${NC}"
if [ -f "scripts/version.sh" ]; then
    echo "  • version.sh: ${GREEN}✅ Disponível${NC}"
else
    echo "  • version.sh: ${RED}❌ Não encontrado${NC}"
fi

if [ -f "scripts/rollback.sh" ]; then
    echo "  • rollback.sh: ${GREEN}✅ Disponível${NC}"
else
    echo "  • rollback.sh: ${RED}❌ Não encontrado${NC}"
fi

if [ -f "scripts/version-status.sh" ]; then
    echo "  • version-status.sh: ${GREEN}✅ Disponível${NC}"
else
    echo "  • version-status.sh: ${RED}❌ Não encontrado${NC}"
fi
echo ""

# Recomendações
echo -e "${BLUE}💡 Recomendações:${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo "  • ${YELLOW}⚠️  Commit as mudanças antes de criar uma nova versão${NC}"
fi

if [ -z "$(git tag)" ]; then
    echo "  • ${BLUE}📝 Crie a primeira versão com: ./scripts/version.sh patch${NC}"
fi

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "  • ${BLUE}🌿 Volte para o branch main antes de versionar${NC}"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    FIM DO STATUS                            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
