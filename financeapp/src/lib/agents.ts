import type { Transaction, Bill, Category } from './store'
import { getCurrentMonth } from './utils'

export interface AgentFinding {
  id: string
  agentId: AgentId
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  transactionIds?: string[]
}

export type AgentId = 'lupa' | 'termometro' | 'rotulo' | 'bussola' | 'sino'

export interface AgentDef {
  id: AgentId
  name: string
  role: string
  emoji: string
  color: string
}

export const AGENTS: AgentDef[] = [
  { id: 'lupa', name: 'Lupa', role: 'Detecta cobranças duplicadas ou repetidas fora do padrão', emoji: '🔍', color: '#f97316' },
  { id: 'termometro', name: 'Termômetro', role: 'Avisa quando uma categoria passa do orçamento combinado', emoji: '🌡️', color: '#ef4444' },
  { id: 'rotulo', name: 'Rótulo', role: 'Sugere categorias melhores com base no que você já corrigiu antes', emoji: '🏷️', color: '#8b5cf6' },
  { id: 'bussola', name: 'Bússola', role: 'Resume como está o mês e para onde o dinheiro está indo', emoji: '🧭', color: '#3b82f6' },
  { id: 'sino', name: 'Sino', role: 'Lembra de contas perto do vencimento', emoji: '🔔', color: '#f59e0b' },
]

function normalizeDescription(desc: string): string {
  return desc.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Lupa: encontra transações de mesmo valor e descrição muito próxima em até 3 dias de distância. */
export function findDuplicateCharges(transactions: Transaction[]): AgentFinding[] {
  const expenses = transactions.filter(t => t.type === 'expense')
  const findings: AgentFinding[] = []
  const seen = new Set<string>()

  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const a = expenses[i], b = expenses[j]
      if (seen.has(a.id) || seen.has(b.id)) continue
      if (a.amount !== b.amount) continue
      if (normalizeDescription(a.description) !== normalizeDescription(b.description)) continue
      const diffDays = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / 86400000
      if (diffDays > 3) continue

      findings.push({
        id: `lupa-${a.id}-${b.id}`,
        agentId: 'lupa',
        severity: 'warning',
        title: 'Possível cobrança duplicada',
        message: `"${a.description}" aparece duas vezes com o mesmo valor (${formatBRL(a.amount)}), com ${Math.round(diffDays)} dia(s) de diferença. Vale conferir se não é cobrança repetida.`,
        transactionIds: [a.id, b.id],
      })
      seen.add(a.id)
      seen.add(b.id)
    }
  }
  return findings
}

/** Termômetro: compara gasto do mês por categoria com o orçamento definido pelo usuário. */
export function findBudgetAlerts(transactions: Transaction[], budgets: Partial<Record<Category, number>>): AgentFinding[] {
  const currentMonth = getCurrentMonth()
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
  const byCategory = new Map<Category, number>()
  for (const t of monthExpenses) {
    byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount)
  }

  const findings: AgentFinding[] = []
  for (const [category, limit] of Object.entries(budgets) as [Category, number][]) {
    if (!limit || limit <= 0) continue
    const spent = byCategory.get(category) || 0
    const ratio = spent / limit
    if (ratio >= 1) {
      findings.push({
        id: `termometro-${category}`,
        agentId: 'termometro',
        severity: 'critical',
        title: `Orçamento de ${category} estourado`,
        message: `Você já gastou ${formatBRL(spent)} em ${category}, acima do limite de ${formatBRL(limit)} combinado para o mês.`,
      })
    } else if (ratio >= 0.8) {
      findings.push({
        id: `termometro-${category}-perto`,
        agentId: 'termometro',
        severity: 'warning',
        title: `Chegando perto do limite em ${category}`,
        message: `${formatBRL(spent)} de ${formatBRL(limit)} já usados em ${category} (${Math.round(ratio * 100)}%).`,
      })
    }
  }
  return findings
}

/** Rótulo: olha correções já feitas pelo usuário e sugere aplicar a mesma categoria de novo. */
export function findCategorySuggestions(
  transactions: Transaction[],
  corrections: Partial<Record<string, Category>>
): AgentFinding[] {
  const findings: AgentFinding[] = []
  for (const t of transactions) {
    const key = normalizeDescription(t.description)
    const learned = corrections[key]
    if (learned && learned !== t.category) {
      findings.push({
        id: `rotulo-${t.id}`,
        agentId: 'rotulo',
        severity: 'info',
        title: 'Sugestão de categoria',
        message: `Da última vez, você categorizou "${t.description}" como "${learned}". Aplicar a mesma categoria aqui?`,
        transactionIds: [t.id],
      })
    }
  }
  return findings.slice(0, 10)
}

/** Sino: contas do mês perto do vencimento (próximos 5 dias) e ainda não pagas. */
export function findUpcomingBills(bills: Bill[]): AgentFinding[] {
  const currentMonth = getCurrentMonth()
  const today = new Date()
  const findings: AgentFinding[] = []
  for (const b of bills) {
    if (b.paid || b.month !== currentMonth) continue
    const due = new Date(today.getFullYear(), today.getMonth(), b.dueDay)
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) {
      findings.push({
        id: `sino-${b.id}-atrasada`,
        agentId: 'sino',
        severity: 'critical',
        title: `${b.name} venceu`,
        message: `${b.name} (${formatBRL(b.amount)}) venceu há ${Math.abs(diffDays)} dia(s) e ainda está marcada como não paga.`,
      })
    } else if (diffDays <= 5) {
      findings.push({
        id: `sino-${b.id}`,
        agentId: 'sino',
        severity: diffDays <= 1 ? 'critical' : 'warning',
        title: `${b.name} vence em breve`,
        message: `${b.name} (${formatBRL(b.amount)}) vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dia(s)`}.`,
      })
    }
  }
  return findings
}

/** Bússola: resumo do mês — maior categoria, comparação com o mês anterior, saldo projetado. */
export function buildMonthlyDigest(transactions: Transaction[], monthlyIncome: number): AgentFinding | null {
  const currentMonth = getCurrentMonth()
  const monthTx = transactions.filter(t => t.date.startsWith(currentMonth))
  const expenses = monthTx.filter(t => t.type === 'expense')
  if (expenses.length === 0) return null

  const totalExpense = expenses.reduce((a, t) => a + t.amount, 0)
  const byCategory = new Map<Category, number>()
  for (const t of expenses) byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount)
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]

  const totalIncome = monthlyIncome + monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const balance = totalIncome - totalExpense

  return {
    id: 'bussola-resumo',
    agentId: 'bussola',
    severity: balance < 0 ? 'warning' : 'info',
    title: 'Como está o seu mês',
    message: `Até agora você gastou ${formatBRL(totalExpense)}${top ? `, principalmente em ${top[0]} (${formatBRL(top[1])})` : ''}. ${
      balance >= 0
        ? `Sobrando ${formatBRL(balance)} considerando sua renda do mês.`
        : `Isso já passa sua renda do mês em ${formatBRL(Math.abs(balance))}.`
    }`,
  }
}

export function runAllAgents(
  transactions: Transaction[],
  bills: Bill[],
  budgets: Partial<Record<Category, number>>,
  corrections: Partial<Record<string, Category>>,
  monthlyIncome: number
): AgentFinding[] {
  const digest = buildMonthlyDigest(transactions, monthlyIncome)
  return [
    ...findBudgetAlerts(transactions, budgets),
    ...findUpcomingBills(bills),
    ...findDuplicateCharges(transactions),
    ...findCategorySuggestions(transactions, corrections),
    ...(digest ? [digest] : []),
  ]
}

function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
