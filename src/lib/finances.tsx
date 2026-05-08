'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Transaction, Jar, Contact, MOCK_TRANSACTIONS, MOCK_JARS, MOCK_CONTACTS } from './mock-data';

interface FinancesContextType {
  transactions: Transaction[];
  jars: Jar[];
  contacts: Contact[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addJar: (jar: Omit<Jar, 'id'>) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateJar: (id: string, current: number) => Promise<void>;
  loading: boolean;
}

const FinancesContext = createContext<FinancesContextType | undefined>(undefined);

export function FinancesProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jars, setJars] = useState<Jar[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAll = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';
    
    // DEMO MODE: Start Empty (User must connect a bank to see data)
    if (isDemoParam || !session || session.user.id === 'demo') {
      const localTx = localStorage.getItem('cb_transactions');
      const localJars = localStorage.getItem('cb_jars');
      const localContacts = localStorage.getItem('cb_contacts');
      
      setTransactions(localTx ? JSON.parse(localTx) : []);
      setJars(localJars ? JSON.parse(localJars) : []);
      setContacts(localContacts ? JSON.parse(localContacts) : []);
      setLoading(false);
      return;
    }

    // CLOUD MODE: Fetch from Supabase
    const [txRes, jarRes, contactRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('jars').select('*').order('created_at', { ascending: true }),
      supabase.from('contacts').select('*').order('name', { ascending: true })
    ]);

    if (txRes.data) {
      setTransactions(txRes.data.map(t => ({
        id: t.id,
        date: t.date,
        description: t.recipient, // Used recipient as description
        amount: Number(t.amount),
        category: t.category as any,
        type: t.type as any,
        bank: t.bank
      })));
    }

    if (jarRes.data) {
      setJars(jarRes.data.map(j => ({
        id: j.id,
        name: j.name,
        target: Number(j.target),
        current: Number(j.current),
        color: j.color,
        emoji: j.icon // Map icon to emoji
      })));
    }

    if (contactRes.data) {
      setContacts(contactRes.data.map(c => ({
        id: c.id,
        name: c.name,
        accountNumber: c.account_number,
        bank: c.bank_name,
        avatar: c.avatar_url || c.name[0],
        color: '#7b68ee' // Default color
      })));
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';

    if (isDemoParam || !session || session.user.id === 'demo') {
      const newTx = { ...tx, id: Date.now().toString() };
      setTransactions(prev => {
        const updated = [newTx, ...prev];
        localStorage.setItem('cb_transactions', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: session.user.id,
        recipient: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        bank: tx.bank,
        date: tx.date
      })
      .select()
      .single();

    if (!error && data) {
      setTransactions(prev => [{
        id: data.id,
        date: data.date,
        description: data.recipient,
        amount: Number(data.amount),
        category: data.category as any,
        type: data.type as any,
        bank: data.bank
      }, ...prev]);
    }
  };

  const addJar = async (jar: Omit<Jar, 'id'>) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';

    if (isDemoParam || !session || session.user.id === 'demo') {
      const newJar = { ...jar, id: Date.now().toString() };
      setJars(prev => {
        const updated = [...prev, newJar];
        localStorage.setItem('cb_jars', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { data, error } = await supabase
      .from('jars')
      .insert({
        user_id: session.user.id,
        name: jar.name,
        target: jar.target,
        current: jar.current,
        color: jar.color,
        icon: jar.emoji
      })
      .select()
      .single();

    if (!error && data) {
      setJars(prev => [...prev, {
        id: data.id,
        name: data.name,
        target: Number(data.target),
        current: Number(data.current),
        color: data.color,
        emoji: data.icon
      }]);
    }
  };

  const updateJar = async (id: string, current: number) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';

    if (isDemoParam || !session || session.user.id === 'demo') {
      setJars(prev => {
        const updated = prev.map(j => j.id === id ? { ...j, current } : j);
        localStorage.setItem('cb_jars', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('jars')
      .update({ current })
      .eq('id', id);

    if (!error) {
      setJars(prev => prev.map(j => j.id === id ? { ...j, current } : j));
    }
  };

  const addContact = async (c: Omit<Contact, 'id'>) => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const isDemoParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';

    if (isDemoParam || !session || session.user.id === 'demo') {
      const newC = { ...c, id: Date.now().toString() };
      setContacts(prev => {
        const updated = [...prev, newC];
        localStorage.setItem('cb_contacts', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: session.user.id,
        name: c.name,
        account_number: c.accountNumber,
        bank_name: c.bank,
        avatar_url: c.avatar
      })
      .select()
      .single();

    if (!error && data) {
      setContacts(prev => [...prev, {
        id: data.id,
        name: data.name,
        accountNumber: data.account_number,
        bank: data.bank_name,
        avatar: data.avatar_url,
        color: '#7b68ee'
      }]);
    }
  };

  return (
    <FinancesContext.Provider value={{ transactions, jars, contacts, addTransaction, addJar, updateJar, addContact, loading }}>
      {children}
    </FinancesContext.Provider>
  );
}

export function useFinances() {
  const context = useContext(FinancesContext);
  if (context === undefined) {
    throw new Error('useFinances must be used within a FinancesProvider');
  }
  return context;
}
