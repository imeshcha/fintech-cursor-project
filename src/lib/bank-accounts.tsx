'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  color: string;
  logo: string;
  lastFour: string;
}

interface BankContextType {
  accounts: BankAccount[];
  totalBalance: number;
  activeAccountId: string;
  activeAccount: BankAccount | null;
  setActiveAccountId: (id: string) => void;
  addAccount: (acc: Omit<BankAccount, 'id'>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  loading: boolean;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankAccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 1. Fetch Accounts from Supabase
  const fetchAccounts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = new URLSearchParams(window.location.search).get('demo') === 'true';

    if (isDemoParam || !session || session.user.id === 'demo') {
      // In demo mode, use localStorage or mock data
      const local = localStorage.getItem('cb_accounts');
      if (local) {
        const parsed = JSON.parse(local);
        // Migration: ensure camelCase for demo data and handle mixed formats
        const mapped = parsed.map((a: any) => ({
          id: a.id || Math.random().toString(36).substr(2, 9),
          bankName: a.bankName || a.bank_name || 'Unknown Bank',
          accountNumber: a.accountNumber || a.account_number || '••••0000',
          accountType: a.accountType || a.account_type || 'Checking',
          balance: Number(a.balance || 0),
          currency: a.currency || 'USD',
          color: a.color || '#7b68ee',
          logo: a.logo || '🏦',
          lastFour: a.lastFour || a.last_four || (a.accountNumber || a.account_number || '0000').slice(-4)
        }));
        setAccounts(mapped);
        if (mapped.length > 0) setActiveAccountId(mapped[0].id);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const mapped = data.map(a => ({
        id: a.id,
        bankName: a.bank_name,
        accountNumber: a.account_number,
        accountType: a.account_type,
        balance: Number(a.balance),
        currency: a.currency,
        color: a.color,
        logo: a.logo,
        lastFour: a.last_four
      }));
      setAccounts(mapped);
      if (mapped.length > 0) setActiveAccountId(mapped[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  // 2. Add Account (Cloud + Local fallback)
  const addAccount = async (newAcc: Omit<BankAccount, 'id'>) => {
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = new URLSearchParams(window.location.search).get('demo') === 'true';
    
    if (isDemoParam || !session || session.user.id === 'demo') {
      const acc = { ...newAcc, id: (newAcc as any).id || Math.random().toString(36).substr(2, 9) };
      setAccounts(prev => {
        const updated = [...prev, acc as BankAccount];
        localStorage.setItem('cb_accounts', JSON.stringify(updated));
        return updated;
      });
      if (!activeAccountId) setActiveAccountId(acc.id);
      return;
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: session.user.id,
        bank_name: newAcc.bankName,
        account_number: newAcc.accountNumber,
        account_type: newAcc.accountType,
        balance: newAcc.balance,
        currency: newAcc.currency,
        color: newAcc.color,
        logo: newAcc.logo,
        last_four: newAcc.lastFour
      })
      .select()
      .single();

    if (!error && data) {
      const mapped = {
        id: data.id,
        bankName: data.bank_name,
        accountNumber: data.account_number,
        accountType: data.account_type,
        balance: Number(data.balance),
        currency: data.currency,
        color: data.color,
        logo: data.logo,
        lastFour: data.last_four
      };
      setAccounts(prev => [...prev, mapped]);
      if (!activeAccountId) setActiveAccountId(mapped.id);
    }
  };

  // 3. Remove Account
  const removeAccount = async (id: string) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.id === 'demo') {
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      localStorage.setItem('cb_accounts', JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      if (activeAccountId === id) setActiveAccountId(accounts[0]?.id || '');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;

  return (
    <BankContext.Provider value={{ accounts, totalBalance, activeAccountId, activeAccount, setActiveAccountId, addAccount, removeAccount, refreshAccounts: fetchAccounts, loading }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBankAccounts() {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBankAccounts must be used within a BankAccountProvider');
  }
  return context;
}
