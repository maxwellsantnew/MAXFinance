import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'finance-ai-secure-key-2024' // In production, use a more secure key or derive from user

const encryptedStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null
    const item = localStorage.getItem(name)
    if (item) {
      try {
        const bytes = CryptoJS.AES.decrypt(item, ENCRYPTION_KEY)
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      } catch {
        return null
      }
    }
    return null
  },
  setItem: (name: string, value: any) => {
    if (typeof window === 'undefined') return
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), ENCRYPTION_KEY).toString()
    localStorage.setItem(name, encrypted)
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export type Category = 
  | 'alimentação' | 'transporte' | 'moradia' | 'saúde' 
  | 'lazer' | 'educação' | 'vestuário' | 'investimento' 
  | 'receita' | 'cartão' | 'outros'

export interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  description: string
  category: Category
  date: string
  paymentMethod: 'pix' | 'dinheiro' | 'débito' | 'crédito'
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDay: number
  category: Category
  paid: boolean
  month: string
}

export interface CreditCard {
  id: string
  name: string
  limit: number
  used: number
  dueDay: number
  closingDay: number
}

export interface Bank {
  id: string
  name: string
  balance: number
  type: 'corrente' | 'poupança' | 'investimento'
  icon: string
}

interface FinanceStore {
  transactions: Transaction[]
  bills: Bill[]
  creditCards: CreditCard[]
  banks: Bank[]
  monthlyIncome: number
  userName: string
  
  // Actions
  addTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void
  addBill: (b: Bill) => void
  toggleBillPaid: (id: string) => void
  removeBill: (id: string) => void
  addCreditCard: (c: CreditCard) => void
  updateCreditCard: (id: string, used: number) => void
  removeCreditCard: (id: string) => void
  addBank: (b: Bank) => void
  updateBank: (id: string, balance: number) => void
  removeBank: (id: string) => void
  setMonthlyIncome: (v: number) => void
  setUserName: (name: string) => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      bills: [],
      creditCards: [],
      banks: [],
      monthlyIncome: 0,
      userName: '',

      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter(t => t.id !== id) })),
      
      addBill: (b) => set((s) => ({ bills: [b, ...s.bills] })),
      toggleBillPaid: (id) => set((s) => ({ bills: s.bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b) })),
      removeBill: (id) => set((s) => ({ bills: s.bills.filter(b => b.id !== id) })),
      
      addCreditCard: (c) => set((s) => ({ creditCards: [...s.creditCards, c] })),
      updateCreditCard: (id, used) => set((s) => ({ creditCards: s.creditCards.map(c => c.id === id ? { ...c, used } : c) })),
      removeCreditCard: (id) => set((s) => ({ creditCards: s.creditCards.filter(c => c.id !== id) })),
      
      addBank: (b) => set((s) => ({ banks: [...s.banks, b] })),
      updateBank: (id, balance) => set((s) => ({ banks: s.banks.map(b => b.id === id ? { ...b, balance } : b) })),
      removeBank: (id) => set((s) => ({ banks: s.banks.filter(b => b.id !== id) })),
      
      setMonthlyIncome: (v) => set({ monthlyIncome: v }),
      setUserName: (name) => set({ userName: name }),
    }),
    { 
      name: 'finance-store',
      storage: createJSONStorage(() => encryptedStorage)
    }
  )
)
