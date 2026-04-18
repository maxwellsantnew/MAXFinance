#!/bin/bash

echo "📊 Análise de Performance - FinanceAI"
echo "===================================="

echo ""
echo "🏗️  Verificando build..."
npm run build

echo ""
echo "📏 Analisando tamanho do bundle..."
if [ -d ".next" ]; then
    echo "Tamanho da pasta .next:"
    du -sh .next
    echo ""
    echo "Arquivos maiores em .next:"
    find .next -type f -exec ls -lh {} \; | sort -k5 -hr | head -10
fi

echo ""
echo "📦 Analisando dependências..."
echo "Total de dependências:"
npm ls --depth=0 | wc -l

echo ""
echo "Dependências de produção:"
npm ls --production --depth=0 | wc -l

echo ""
echo "📈 Métricas recomendadas:"
echo "- Bundle size < 500KB (gzipped)"
echo "- First Contentful Paint < 2s"
echo "- Lighthouse Performance > 90"
echo "- Core Web Vitals: boas"

echo ""
echo "✅ Análise de performance concluída!"