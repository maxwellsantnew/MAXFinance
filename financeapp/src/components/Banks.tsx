import { useState } from 'react'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency, BANK_ICONS } from '@/lib/utils'
import { Plus, X, Trash2, PencilLine } from 'lucide-react'
import { v4 as uuid } from 'uuid'

export default function Banks() {
  const { banks, creditCards, addBank, removeBank, updateBank, addCreditCard, removeCreditCard, updateCreditCard, monthlyIncome, setMonthlyIncome } = useFinanceStore()

  const [activeTab, setActiveTab] = useState<'banks' | 'cards'>('banks')
  const [showBankModal, setShowBankModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [editingBank, setEditingBank] = useState<string | null>(null)
  const [editBalance, setEditBalance] = useState('')

  const [bankForm, setBankForm] = useState({ name: '', balance: '', type: 'corrente' as 'corrente' | 'poupança' | 'investimento', icon: 'outros' })
  const [cardForm, setCardForm] = useState({ name: '', limit: '', used: '', dueDay: '10', closingDay: '3' })

  const totalBalance = banks.reduce((a, b) => a + b.balance, 0)
  const totalCardLimit = creditCards.reduce((a, c) => a + c.limit, 0)
  const totalCardUsed = creditCards.reduce((a, c) => a + c.used, 0)

  const handleAddBank = () => {
    const bal = parseFloat(bankForm.balance.replace(',', '.'))
    if (!bankForm.name.trim() || isNaN(bal)) return
    addBank({ id: uuid(), name: bankForm.name.trim(), balance: bal, type: bankForm.type, icon: bankForm.icon })
    setBankForm({ name: '', balance: '', type: 'corrente', icon: 'outros' })
    setShowBankModal(false)
  }

  const handleAddCard = () => {
    const limit = parseFloat(cardForm.limit.replace(',', '.'))
    const used = parseFloat(cardForm.used.replace(',', '.') || '0')
    if (!cardForm.name.trim() || isNaN(limit)) return
    addCreditCard({ id: uuid(), name: cardForm.name.trim(), limit, used: isNaN(used) ? 0 : used, dueDay: parseInt(cardForm.dueDay), closingDay: parseInt(cardForm.closingDay) })
    setCardForm({ name: '', limit: '', used: '', dueDay: '10', closingDay: '3' })
    setShowCardModal(false)
  }

  const handleUpdateBalance = (id: string) => {
    const bal = parseFloat(editBalance.replace(',', '.'))
    if (!isNaN(bal)) updateBank(id, bal)
    setEditingBank(null)
    setEditBalance('')
  }

  return (
    <div className="page-content p-4 space-y-4">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Bancos & Cartões</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Gerencie suas contas e cartões</p>
      </div>

      {/* Income setup */}
      <div className="animate-slide-up glass rounded-2xl p-4" style={{ animationDelay: '40ms' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Renda mensal fixa</p>
        <div className="flex gap-2">
          <input className="fin-input flex-1" placeholder="R$ 0,00"
            value={monthlyIncome > 0 ? String(monthlyIncome) : ''}
            onChange={e => setMonthlyIncome(parseFloat(e.target.value.replace(',', '.')) || 0)} />
          <div className="px-3 py-2.5 rounded-xl flex items-center text-sm font-semibold text-green-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            {formatCurrency(monthlyIncome)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '60ms' }}>
        {(['banks', 'cards'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{
            background: activeTab === tab ? 'var(--accent)' : 'var(--bg-card2)',
            color: activeTab === tab ? 'white' : 'var(--text-muted)',
            border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'var(--border)'}`,
          }}>
            {tab === 'banks' ? '🏦 Contas Bancárias' : '💳 Cartões de Crédito'}
          </button>
        ))}
      </div>

      {activeTab === 'banks' && (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '80ms' }}>
          {/* Total */}
          <div className="glass rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total em contas</span>
            <span className="font-bold text-xl text-green-400" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(totalBalance)}</span>
          </div>

          {banks.map(bank => (
            <div key={bank.id} className="glass glass-hover rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--bg-card2)' }}>
                    {BANK_ICONS[bank.icon] || '🏦'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{bank.name}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>conta {bank.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingBank === bank.id ? (
                    <div className="flex gap-1.5 items-center">
                      <input className="fin-input w-28 text-sm py-2" placeholder="Novo saldo"
                        value={editBalance} onChange={e => setEditBalance(e.target.value.replace(/[^0-9,.]/g, ''))} />
                      <button className="btn-primary py-2 px-3 text-xs" onClick={() => handleUpdateBalance(bank.id)}>OK</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-green-400">{formatCurrency(bank.balance)}</span>
                      <button onClick={() => { setEditingBank(bank.id); setEditBalance(String(bank.balance)) }} className="p-1.5 rounded-lg" style={{ background: 'var(--bg-card2)' }}>
                        <PencilLine size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button onClick={() => removeBank(bank.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all" style={{ background: 'var(--bg-card2)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            onClick={() => setShowBankModal(true)}>
            <Plus size={16} /> Adicionar Conta
          </button>
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Limite total</p>
              <p className="font-bold text-sm text-green-400">{formatCurrency(totalCardLimit)}</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fatura total</p>
              <p className="font-bold text-sm text-red-400">{formatCurrency(totalCardUsed)}</p>
            </div>
          </div>

          {creditCards.map(card => {
            const pct = card.limit > 0 ? (card.used / card.limit) * 100 : 0
            const available = card.limit - card.used
            return (
              <div key={card.id} className="glass glass-hover rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--bg-card2)' }}>💳</div>
                    <div>
                      <p className="font-semibold text-sm">{card.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fecha dia {card.closingDay} · Vence dia {card.dueDay}</p>
                    </div>
                  </div>
                  <button onClick={() => removeCreditCard(card.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Limite</p>
                    <p className="text-sm font-semibold">{formatCurrency(card.limit)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Usado</p>
                    <p className="text-sm font-semibold text-red-400">{formatCurrency(card.used)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Disponível</p>
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(available)}</p>
                  </div>
                </div>
                <div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: pct > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #3b82f6, #10b981)'
                    }} />
                  </div>
                  <p className="text-xs mt-1 text-right" style={{ color: pct > 80 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {pct.toFixed(0)}% utilizado
                    {pct > 80 && ' ⚠️'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <input className="fin-input flex-1 text-sm py-2" placeholder="Atualizar fatura..." 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value.replace(',', '.'))
                        if (!isNaN(val)) { updateCreditCard(card.id, val); (e.target as HTMLInputElement).value = '' }
                      }
                    }} />
                  <span className="text-xs flex items-center" style={{ color: 'var(--text-muted)' }}>Enter ↵</span>
                </div>
              </div>
            )
          })}

          <button className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all" style={{ background: 'var(--bg-card2)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            onClick={() => setShowCardModal(true)}>
            <Plus size={16} /> Adicionar Cartão
          </button>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 flex items-end justify-center p-1 pb-20 sm:p-3 sm:pb-3" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-sheet animate-slide-up">
            <div className="modal-sheet-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Adicionar Conta</h2>
              <button onClick={() => setShowBankModal(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}><X size={18} /></button>
            </div>
            </div>

            <div className="modal-sheet-body space-y-4">

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Banco</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {Object.entries(BANK_ICONS).map(([key, emoji]) => (
                  <button key={key} onClick={() => setBankForm(f => ({ ...f, icon: key, name: key !== 'outros' ? key.charAt(0).toUpperCase() + key.slice(1) : f.name }))}
                    className="py-2 rounded-xl text-center text-sm capitalize transition-all" style={{
                      background: bankForm.icon === key ? 'var(--accent)' : 'var(--bg-card2)',
                      border: `1px solid ${bankForm.icon === key ? 'var(--accent)' : 'var(--border)'}`,
                      color: bankForm.icon === key ? 'white' : 'var(--text-secondary)',
                    }}>
                    <div>{emoji}</div>
                    <div style={{ fontSize: 10 }}>{key}</div>
                  </button>
                ))}
              </div>
              <input className="fin-input" placeholder="Nome da conta" value={bankForm.name} onChange={e => setBankForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Saldo atual</label>
              <input className="fin-input" placeholder="R$ 0,00" value={bankForm.balance} onChange={e => setBankForm(f => ({ ...f, balance: e.target.value.replace(/[^0-9,.]/g, '') }))} />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tipo de conta</label>
              <div className="grid grid-cols-3 gap-2">
                {(['corrente', 'poupança', 'investimento'] as const).map(t => (
                  <button key={t} onClick={() => setBankForm(f => ({ ...f, type: t }))} className="py-2.5 rounded-xl text-xs font-medium capitalize transition-all" style={{
                    background: bankForm.type === t ? 'var(--accent)' : 'var(--bg-card2)',
                    color: bankForm.type === t ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${bankForm.type === t ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div className="modal-sheet-footer">
              <button className="btn-primary w-full py-3" onClick={handleAddBank}>Confirmar Conta</button>
            </div>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 flex items-end justify-center p-1 pb-20 sm:p-3 sm:pb-3" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-sheet animate-slide-up">
            <div className="modal-sheet-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Adicionar Cartão</h2>
              <button onClick={() => setShowCardModal(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}><X size={18} /></button>
            </div>
            </div>

            <div className="modal-sheet-body space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Nome do cartão</label>
              <input className="fin-input" placeholder="Ex: Nubank, Itaú Visa..." value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Limite total</label>
                <input className="fin-input" placeholder="R$ 0,00" value={cardForm.limit} onChange={e => setCardForm(f => ({ ...f, limit: e.target.value.replace(/[^0-9,.]/g, '') }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Fatura atual</label>
                <input className="fin-input" placeholder="R$ 0,00" value={cardForm.used} onChange={e => setCardForm(f => ({ ...f, used: e.target.value.replace(/[^0-9,.]/g, '') }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Dia de fechamento</label>
                <input className="fin-input" type="number" min="1" max="31" value={cardForm.closingDay} onChange={e => setCardForm(f => ({ ...f, closingDay: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Dia de vencimento</label>
                <input className="fin-input" type="number" min="1" max="31" value={cardForm.dueDay} onChange={e => setCardForm(f => ({ ...f, dueDay: e.target.value }))} />
              </div>
            </div>
            </div>

            <div className="modal-sheet-footer">
              <button className="btn-primary w-full py-3" onClick={handleAddCard}>Confirmar Cartão</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
