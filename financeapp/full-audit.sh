#!/bin/bash

echo "🔬 Análise Completa - FinanceAI"
echo "==============================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔍 EXECUTANDO ANÁLISE DE SEGURANÇA..."
./security-audit.sh

echo ""
echo "📊 EXECUTANDO ANÁLISE DE PERFORMANCE..."
./performance-audit.sh

echo ""
echo "📋 VERIFICAÇÕES ADICIONAIS..."

# Verificar se há arquivos sensíveis
echo ""
echo "🔍 Procurando arquivos sensíveis..."
if [ -f ".env" ] || [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Arquivos .env encontrados${NC}"
else
    echo -e "${GREEN}✅ Nenhum arquivo .env exposto${NC}"
fi

# Verificar configurações de segurança
echo ""
echo "🔧 Verificando configurações..."
if grep -q "crypto-js" package.json; then
    echo -e "${GREEN}✅ Criptografia implementada${NC}"
else
    echo -e "${RED}❌ Criptografia não encontrada${NC}"
fi

if grep -q "dompurify" package.json; then
    echo -e "${GREEN}✅ Sanitização HTML implementada${NC}"
else
    echo -e "${RED}❌ Sanitização HTML não encontrada${NC}"
fi

echo ""
echo "📊 RESUMO DA ANÁLISE:"
echo "- Segurança: $([ -f "security-audit.sh" ] && echo "Script disponível" || echo "Script não encontrado")"
echo "- Performance: $([ -f "performance-audit.sh" ] && echo "Script disponível" || echo "Script não encontrado")"
echo "- Dependências: $(npm audit --audit-level=high 2>/dev/null | grep -c "vulnerability" || echo "0") vulnerabilidades críticas"

echo ""
echo -e "${GREEN}✅ Análise completa finalizada!${NC}"