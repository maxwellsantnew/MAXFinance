# Scripts de Análise - FinanceAI

Este documento descreve os scripts disponíveis para análise de segurança, performance e qualidade do código da aplicação FinanceAI.

## Scripts Disponíveis

### 1. `npm run security:check`
Verifica vulnerabilidades de segurança nas dependências com nível moderado.

### 2. `npm run audit`
Executa auditoria completa de vulnerabilidades do npm.

### 3. `npm run audit:fix`
Tenta corrigir automaticamente vulnerabilidades encontradas.

### 4. `npm run deps:check`
Verifica dependências desatualizadas.

### 5. `npm run deps:update`
Atualiza dependências para versões mais recentes.

### 6. `npm run test:security`
Executa linting e tenta corrigir vulnerabilidades.

### 7. `npm run build:analyze`
Faz build com análise de bundle (requer @next/bundle-analyzer).

### 8. `./security-audit.sh`
Script bash para análise completa de segurança:
- Verifica vulnerabilidades
- Analisa dependências desatualizadas
- Executa linting
- Verifica configurações de segurança implementadas

### 9. `./performance-audit.sh`
Script bash para análise de performance:
- Verifica build
- Analisa tamanho do bundle
- Conta dependências
- Fornece métricas recomendadas

### 11. `./check-security.sh`
Script bash para verificar se as implementações de segurança estão presentes no código:
- Verifica criptografia localStorage
- Confirma sanitização HTML
- Valida anonimização de dados
- Verifica controle de dados do usuário

### 13. `./code-audit.sh`
Script bash para análise da qualidade e estrutura do código:
- Conta arquivos por tipo
- Analisa tamanhos dos arquivos
- Estatísticas do código
- Verificações básicas de qualidade

## Scripts Disponíveis (Resumo)

| Script | Comando | Descrição |
|--------|---------|-----------|
| Auditoria Segurança | `npm run security:check` | Verifica vulnerabilidades moderadas |
| Auditoria Completa | `npm run audit` | Auditoria npm completa |
| Correção Auto | `npm run audit:fix` | Corrige vulnerabilidades automaticamente |
| Dependências | `npm run deps:check` | Verifica pacotes desatualizados |
| Atualização | `npm run deps:update` | Atualiza dependências |
| Teste Segurança | `npm run test:security` | Linting + correção |
| Análise Bundle | `npm run build:analyze` | Análise de tamanho do bundle |
| Segurança Bash | `./security-audit.sh` | Análise completa de segurança |
| Performance Bash | `./performance-audit.sh` | Análise de performance |
| Verificação Config | `./check-security.sh` | Verifica implementações de segurança |
| Auditoria Completa | `./full-audit.sh` | Combina todos os checks |
| Código Bash | `./code-audit.sh` | Análise da qualidade do código |

## Como Usar

### Preparação Inicial
```bash
# Tornar scripts executáveis
chmod +x *.sh
```

### Análise Rápida de Segurança
```bash
npm run security:check
```

### Análise Completa
```bash
./full-audit.sh
```

### Verificação de Implementações
```bash
./check-security.sh
```

### Correção Automática
```bash
npm run audit:fix
npm run deps:update
```

## Métricas de Qualidade

### Segurança
- ✅ Vulnerabilidades críticas: 0
- ✅ Criptografia localStorage: Implementada
- ✅ Sanitização HTML: Implementada
- ✅ Dados anônimos para IA: Implementado

### Performance
- 📏 Bundle size: < 500KB (gzipped)
- ⚡ First Contentful Paint: < 2s
- 🏆 Lighthouse Performance: > 90

### Manutenibilidade
- 📦 Dependências atualizadas
- 🔧 Linting passando
- 📋 Código documentado

## Recomendações

1. Execute `./full-audit.sh` semanalmente
2. Monitore vulnerabilidades com `npm run security:check`
3. Atualize dependências regularmente
4. Revise configurações de segurança após mudanças

## Contato

Para questões sobre segurança, entre em contato com a equipe de desenvolvimento.