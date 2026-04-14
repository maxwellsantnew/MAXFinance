#!/bin/bash
cd /workspaces/MAXFinance/financeapp
echo "=== Node Version ==="
node -v
echo "=== NPM Version ==="
npm -v
echo "=== Package.json Scripts ==="
cat package.json | grep -A 5 '"scripts"'
echo "=== Running next dev ==="
next dev --verbose
