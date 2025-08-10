#!/bin/bash

# 🚀 SCRIPT DE ATUALIZAÇÃO DE VERSÃO UNISAFE
# Este script atualiza a versão em todos os arquivos necessários

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SCRIPT DE ATUALIZAÇÃO DE VERSÃO UNISAFE${NC}"
echo "=================================================="

# Verificar se a nova versão foi fornecida
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Versão não fornecida${NC}"
    echo "Uso: ./update-version.sh <nova_versao>"
    echo "Exemplo: ./update-version.sh 1.2.0"
    exit 1
fi

NEW_VERSION=$1
echo -e "${YELLOW}📋 Nova versão: ${NEW_VERSION}${NC}"

# Função para atualizar arquivo de versão
update_version_file() {
    local file="frontend/src/config/version.ts"
    echo -e "${BLUE}📝 Atualizando ${file}...${NC}"
    
    # Atualizar a versão no arquivo de configuração
    sed -i '' "s/export const APP_VERSION = '.*';/export const APP_VERSION = '${NEW_VERSION}';/" "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${file} atualizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar ${file}${NC}"
        return 1
    fi
}

# Função para atualizar package.json principal
update_main_package() {
    local file="package.json"
    echo -e "${BLUE}📝 Atualizando ${file}...${NC}"
    
    # Atualizar a versão no package.json principal
    sed -i '' "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${file} atualizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar ${file}${NC}"
        return 1
    fi
}

# Função para atualizar package.json do frontend
update_frontend_package() {
    local file="frontend/package.json"
    echo -e "${BLUE}📝 Atualizando ${file}...${NC}"
    
    # Atualizar a versão no package.json do frontend
    sed -i '' "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${file} atualizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar ${file}${NC}"
        return 1
    fi
}

# Função para atualizar package.json do backend
update_backend_package() {
    local file="backend/package.json"
    echo -e "${BLUE}📝 Atualizando ${file}...${NC}"
    
    # Atualizar a versão no package.json do backend
    sed -i '' "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${file} atualizado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar ${file}${NC}"
        return 1
    fi
}

# Função para criar tag git
create_git_tag() {
    echo -e "${BLUE}🏷️ Criando tag Git...${NC}"
    
    # Adicionar todas as mudanças
    git add .
    
    # Commit das mudanças
    git commit -m "🚀 Atualização de versão para ${NEW_VERSION}"
    
    # Criar tag
    git tag -a "v${NEW_VERSION}" -m "Versão ${NEW_VERSION}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tag Git v${NEW_VERSION} criada com sucesso${NC}"
    else
        echo -e "${YELLOW}⚠️ Aviso: Erro ao criar tag Git${NC}"
    fi
}

# Função para mostrar resumo
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 ATUALIZAÇÃO DE VERSÃO CONCLUÍDA!${NC}"
    echo "=================================================="
    echo -e "${BLUE}📋 Nova versão: ${NEW_VERSION}${NC}"
    echo -e "${BLUE}📁 Arquivos atualizados:${NC}"
    echo "  - frontend/src/config/version.ts"
    echo "  - package.json"
    echo "  - frontend/package.json"
    echo "  - backend/package.json"
    echo ""
    echo -e "${YELLOW}💡 Próximos passos:${NC}"
    echo "  1. Verificar se todas as alterações estão corretas"
    echo "  2. Testar o sistema com a nova versão"
    echo "  3. Fazer push das mudanças e tags para o repositório"
    echo "  4. Atualizar a documentação se necessário"
    echo ""
    echo -e "${GREEN}✅ Versão ${NEW_VERSION} implementada com sucesso!${NC}"
}

# Executar todas as atualizações
echo ""
echo -e "${YELLOW}🔄 Iniciando atualização de versão...${NC}"
echo ""

# Atualizar arquivos
update_version_file
update_main_package
update_frontend_package
update_backend_package

# Verificar se todas as atualizações foram bem-sucedidas
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Todas as atualizações foram bem-sucedidas!${NC}"
    
    # Perguntar se deseja criar tag Git
    echo ""
    read -p "🏷️ Deseja criar tag Git para esta versão? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_git_tag
    else
        echo -e "${YELLOW}⚠️ Tag Git não criada${NC}"
    fi
    
    show_summary
else
    echo -e "${RED}❌ Erro durante a atualização de versão${NC}"
    exit 1
fi
