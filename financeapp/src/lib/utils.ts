export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const getMonthName = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export const CATEGORY_COLORS: Record<string, string> = {
  alimentação: '#f97316',
  transporte: '#3b82f6',
  moradia: '#8b5cf6',
  saúde: '#ec4899',
  lazer: '#14b8a6',
  educação: '#f59e0b',
  vestuário: '#6366f1',
  investimento: '#22c55e',
  receita: '#10b981',
  cartão: '#ef4444',
  outros: '#94a3b8',
}

export const CATEGORY_ICONS: Record<string, string> = {
  alimentação: '🍽️',
  transporte: '🚗',
  moradia: '🏠',
  saúde: '❤️',
  lazer: '🎮',
  educação: '📚',
  vestuário: '👕',
  investimento: '📈',
  receita: '💰',
  cartão: '💳',
  outros: '📦',
}

export const BANK_ICONS: Record<string, string> = {
  nubank: '💜',
  itaú: '🧡',
  bradesco: '❤️',
  bb: '💛',
  caixa: '💙',
  inter: '🟠',
  c6: '⚫',
  santander: '🔴',
  xp: '🟢',
  outros: '🏦',
}

// Funções de anonimização para IA
export const getRange = (value: number) => {
  if (value === 0) return 'nenhum'
  if (value < 100) return 'baixo'
  if (value < 1000) return 'médio'
  if (value < 10000) return 'alto'
  return 'muito alto'
}

export const getPercentRange = (used: number, limit: number) => {
  const percent = limit > 0 ? (used / limit) * 100 : 0
  if (percent < 30) return 'baixo'
  if (percent < 70) return 'médio'
  return 'alto'
}
