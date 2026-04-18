import { useState, useEffect } from 'react'
import { useFinanceStore } from '@/lib/store'
import Dashboard from '@/components/Dashboard'
import Transactions from '@/components/Transactions'
import Bills from '@/components/Bills'
import Banks from '@/components/Banks'
import Analytics from '@/components/Analytics'
import dynamic from 'next/dynamic'
const AIChat = dynamic(() => import('@/components/AIChat'), { ssr: false })
import { LayoutDashboard, ArrowLeftRight, CalendarCheck, Landmark, PieChart, Bot, Settings, X, Bell, Trash2 } from 'lucide-react'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'

type Tab = 'dashboard' | 'transactions' | 'bills' | 'banks' | 'analytics' | 'ai'

interface NavItem {
  id: Tab
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'transactions', label: 'Gastos', icon: ArrowLeftRight },
  { id: 'bills', label: 'Contas', icon: CalendarCheck },
  { id: 'banks', label: 'Bancos', icon: Landmark },
  { id: 'analytics', label: 'Planilha', icon: PieChart },
  { id: 'ai', label: 'FinBot', icon: Bot },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const { userName, setUserName, monthlyIncome, setMonthlyIncome, transactions } = useFinanceStore()

  // Show onboarding if no name set
  useEffect(() => {
    if (userName) return
    const timer = setTimeout(() => setShowOnboarding(true), 800)
    return () => clearTimeout(timer)
  }, [userName])

  // Daily spending notification
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayExpenses = transactions.filter(t => t.date.startsWith(todayStr) && t.type === 'expense')
    const total = todayExpenses.reduce((a, t) => a + t.amount, 0)
    if (total > 0 && todayExpenses.length > 0) {
      const timer = setTimeout(() => {
        setNotification(`Você gastou ${formatCurrency(total)} hoje em ${todayExpenses.length} transação(ões) 📊`)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [transactions])

  const [onboardName, setOnboardName] = useState('')
  const [onboardIncome, setOnboardIncome] = useState('')

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('finance-store')
      window.location.reload()
    }
  }

  const handleOnboard = () => {
    if (onboardName.trim()) {
      setUserName(onboardName.trim())
      if (onboardIncome) {
        setMonthlyIncome(parseFloat(onboardIncome.replace(',', '.')) || 0)
      }
      setShowOnboarding(false)
    }
  }

  const hasPendingBills = (() => {
    const currentMonth = getCurrentMonth()
    const { bills } = useFinanceStore.getState()
    return bills.some(b => !b.paid && b.month === currentMonth)
  })()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', position: 'relative' }}>
      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Top bar */}
      <div className="glass flex-shrink-0 flex items-center justify-between px-4 py-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            💎
          </div>
          <span className="font-bold text-sm gradient-text" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            FinanceAI
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasPendingBills && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Bell size={12} className="text-yellow-400" />
              <span className="text-xs text-yellow-400">Contas pendentes</span>
            </div>
          )}
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl transition-colors" style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
            <Settings size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 60, position: 'relative', zIndex: 1 }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'transactions' && <Transactions />}
        {tab === 'bills' && <Bills />}
        {tab === 'banks' && <Banks />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'ai' && <AIChat />}
      </div>

      {/* Bottom Navigation */}
      {tab !== 'ai' && (
        <div className="mobile-nav">
          <div className="flex items-center justify-around px-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = tab === item.id
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all"
                  style={{
                    color: active ? '#60a5fa' : 'var(--text-muted)',
                    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                    minWidth: 48,
                  }}>
                  {item.id === 'ai' ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: active ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--bg-card2)', border: `1px solid ${active ? '#3b82f6' : 'var(--border)'}` }}>
                      <Icon size={14} color={active ? 'white' : 'var(--text-muted)'} />
                    </div>
                  ) : (
                    <Icon size={18} />
                  )}
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: 'var(--font-body)' }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* AI tab: show nav button to go back */}
      {tab === 'ai' && (
        <button onClick={() => setTab('dashboard')} className="fixed bottom-4 left-4 z-50 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          ← Voltar
        </button>
      )}

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-16 left-4 right-4 z-50 animate-slide-up" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="glass rounded-2xl p-4 flex items-center justify-between gap-3" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
            <div className="flex items-center gap-3">
              <div className="text-xl">🔔</div>
              <p className="text-sm">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 flex-shrink-0">
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-8 space-y-6 text-center animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-5xl animate-float">💎</div>
            <div>
              <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Bem-vindo ao FinanceAI</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Controle financeiro inteligente, gratuito e seguro para todos.</p>
            </div>
            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Seu nome</label>
                <input className="fin-input" placeholder="Como quer ser chamado?" value={onboardName} onChange={e => setOnboardName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOnboard()} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Renda mensal (opcional)</label>
                <input className="fin-input" placeholder="R$ 0,00" value={onboardIncome}
                  onChange={e => setOnboardIncome(e.target.value.replace(/[^0-9,.]/g, ''))} />
              </div>
            </div>
            <button className="btn-primary w-full py-3.5 text-base" onClick={handleOnboard} disabled={!onboardName.trim()}>
              Começar a controlar →
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              🔒 Seus dados ficam apenas no seu dispositivo. Nenhuma informação é enviada a servidores.
            </p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-end justify-center p-1 pb-20 sm:p-3 sm:pb-3" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-sheet animate-slide-up">
            <div className="modal-sheet-header">
              <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Configurações</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}><X size={18} /></button>
              </div>
            </div>

            <div className="modal-sheet-body space-y-5">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Seu nome</label>
              <input className="fin-input" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Renda mensal fixa</label>
              <input className="fin-input" value={monthlyIncome > 0 ? String(monthlyIncome) : ''} placeholder="R$ 0,00"
                onChange={e => setMonthlyIncome(parseFloat(e.target.value.replace(',', '.')) || 0)} />
            </div>

            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold">🔒 Privacidade & Segurança</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Seus dados financeiros são armazenados <strong>criptografados no seu dispositivo</strong> (LocalStorage). Nenhuma informação pessoal é enviada a servidores externos. O assistente IA usa apenas dados anônimos do contexto da conversa.
              </p>
              <button onClick={handleClearData} className="btn-danger flex items-center gap-2 w-full justify-center py-2 text-xs">
                <Trash2 size={14} /> Apagar Todos os Dados
              </button>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-sm font-semibold text-blue-400">📱 WhatsApp (em breve)</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Em breve você poderá consultar seus gastos via WhatsApp com o FinBot, diretamente pelo número oficial do app.
              </p>
            </div>
            </div>

            <div className="modal-sheet-footer">
              <button className="btn-primary w-full py-3" onClick={() => setShowSettings(false)}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
