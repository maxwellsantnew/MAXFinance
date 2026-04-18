#!/bin/bash

echo "🚀 INSTALAÇÃO RÁPIDA - Dependências Faltantes"
echo "=============================================="
echo ""

echo "📦 Instalando dompurify..."
npm install dompurify

echo ""
echo "📦 Instalando crypto-js..."
npm install crypto-js

echo ""
echo "📦 Instalando tipos..."
npm install --save-dev @types/dompurify @types/crypto-js

echo ""
echo "✅ Dependências instaladas!"
echo ""

echo "🧪 Testando build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO! Execute: npm run dev"
else
    echo ""
    echo "❌ Ainda há problemas. Execute: ./fix-complete.sh"
fi