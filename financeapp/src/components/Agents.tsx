import { useMemo, useState } from 'react'
import { useFinanceStore, Category } from '@/lib/store'
import { AGENTS, runAllAgents, AgentFinding } from '@/lib/agents'
import { CATEGORY_ICONS } from '@/lib/utils'
import { Check, X, SlidersHorizontal } from 'lucide-react'

const SEVERITY_LABEL: Record<AgentFinding['severity'], string> = {
  info: 'Dica',
  warning: 'Atenção',
  critical: 'Urgente',
}

const SEVERITY_STYLE: Record<AgentFinding['severity'], { bg: string; border: string; color: string }> = {
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
  critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
}

const ALL_CATEGORIES: Category[] = [
  'alimentação', 'transporte', 'moradia', 'saúde', 'lazer',
  'educação', 'vestuário', 'investimento', 'cartão', 'outros',
]

export default function Agents() {
  const {
    transactions, bills, categoryBudgets, categoryCorrections, monthlyIncome,
    dismissedAgentNoteIds, dismissAgentNote, setCategoryBudget, removeCategoryBudget,
    updateTransactionCategory, learnCategoryCorrection,
  } = useFinanceStore()
  const [showBudgets, setShowBudgets] = useState(false)

  const findings = useMemo(
    () => runAllAgents(transactions, bills, categoryBudgets, categoryCorrections, monthlyIncome)
      .filter(f => !dismissedAgentNoteIds.includes(f.id)),
    [transactions, bills, categoryBudgets, categoryCorrections, monthlyIncome, dismissedAgentNoteIds]
  )

  const findingsByAgent = useMemo(() => {
    const map = new Map<string, AgentFinding[]>()
    for (const f of findings) {
      const list = map.get(f.agentId) || []
      list.push(f)
      map.set(f.agentId, list)
    }
    return map
  }, [findings])

  const applySuggestion = (f: AgentFinding) => {
    if (f.agentId !== 'rotulo' || !f.transactionIds?.length) return
    const t = transactions.find(t => t.id === f.transactionIds![0])
    if (!t) return
    const match = f.message.match(/categorizou "(.+)" como "(.+)"\./)
    const suggestedCategory = match?.[2] as Category | undefined
    if (suggestedCategory) {
      updateTransactionCategory(t.id, suggestedCategory)
      learnCategoryCorrection(t.description.trim().toLowerCase(), suggestedCategory)
    }
    dismissAgentNote(f.id)
  }

  return (
    <div className="px-4 pb-24 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Agentes</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Um time de rotinas que olha seus dados locais e te avisa do que importa.
          </p>
        </div>
        <button
          onClick={() => setShowBudgets(true)}
          className="p-2 rounded-xl flex-shrink-0"
          style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}
        >
          <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {findings.length === 0 && (
        <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nada chamando atenção agora. Os agentes continuam de olho conforme você registra gastos.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {AGENTS.map(agent => {
          const items = findingsByAgent.get(agent.id) || []
          if (items.length === 0) return null
          return (
            <div key={agent.id} className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${agent.color}22` }}>
                  {agent.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{agent.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                {items.map(f => {
                  const style = SEVERITY_STYLE[f.severity]
                  return (
                    <div key={f.id} className="rounded-xl p-3" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold" style={{ color: style.color }}>
                            {SEVERITY_LABEL[f.severity]} · {f.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{f.message}</p>
                        </div>
                        <button onClick={() => dismissAgentNote(f.id)} className="p-1 flex-shrink-0">
                          <X size={13} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                      {f.agentId === 'rotulo' && (
                        <button
                          onClick={() => applySuggestion(f)}
                          className="mt-2 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
                        >
                          <Check size={12} /> Aplicar categoria sugerida
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showBudgets && (
        <div className="fixed inset-0 flex items-end justify-center p-1 pb-20 sm:p-3 sm:pb-3" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-sheet animate-slide-up">
            <div className="modal-sheet-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Orçamento por categoria</h2>
                <button onClick={() => setShowBudgets(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}><X size={18} /></button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Defina um limite mensal e o Termômetro avisa quando você chegar perto.
              </p>
            </div>
            <div className="modal-sheet-body space-y-3">
              {ALL_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm w-32 flex items-center gap-1.5">
                    <span>{CATEGORY_ICONS[cat]}</span> {cat}
                  </span>
                  <input
                    className="fin-input flex-1"
                    placeholder="Sem limite"
                    value={categoryBudgets[cat] ? String(categoryBudgets[cat]) : ''}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9,.]/g, '')
                      if (!raw) { removeCategoryBudget(cat); return }
                      setCategoryBudget(cat, parseFloat(raw.replace(',', '.')) || 0)
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="modal-sheet-footer">
              <button className="btn-primary w-full py-3" onClick={() => setShowBudgets(false)}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
