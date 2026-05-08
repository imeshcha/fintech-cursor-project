'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { usePlaidLink } from 'react-plaid-link';
import { X, Plus, AlertCircle, Shield, CreditCard, Building2, Search, CheckCircle2, Loader2, Lock, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const BANK_OPTIONS = [
  { name: 'Nations Trust Bank', logo: '🏦', color: '#7b68ee' },
  { name: 'Bank of Ceylon', logo: '🏛️', color: '#2dd4bf' },
  { name: 'Hatton National Bank', logo: '🏧', color: '#fbbf24' },
  { name: 'Commercial Bank', logo: '🏪', color: '#f87171' },
  { name: 'Sampath Bank', logo: '💳', color: '#34d399' },
];

interface Props { isOpen: boolean; onClose: () => void; }

export default function AddAccountModal({ isOpen, onClose }: Props) {
  const { addAccount, refreshAccounts } = useBankAccounts();
  const [step, setStep] = useState<'select' | 'auth' | 'loading' | 'success'>('select');
  const [selectedBank, setSelectedBank] = useState<typeof BANK_OPTIONS[0] | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const supabase = createClient();

  // ── 1. Plaid Link Setup ──
  const fetchLinkToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const userId = session?.user?.id || 'demo-user-123';
      
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (e) {
      console.error('Failed to fetch link token');
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) fetchLinkToken();
    else {
      setStep('select'); setSelectedBank(null); setError('');
    }
  }, [isOpen, fetchLinkToken]);

  const onPlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    console.log('✅ Plaid success!', { publicToken, metadata });
    setStep('loading');
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const isDemoParam = new URLSearchParams(window.location.search).get('demo') === 'true';
      const currentUserId = (isDemoParam || !session) ? 'demo-user-123' : session.user.id;
      
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, userId: currentUserId }),
      });
      const result = await response.json();
      
      if (result.success) {
        // If in demo mode, manually add to state so it shows up
        if (isDemoParam || !session || session.user.id === 'demo') {
          await addAccount(result.account);
        }
        
        setStep('success');
        setTimeout(() => { 
          refreshAccounts();
          onClose(); 
        }, 2000);
      } else throw new Error();
    } catch (e) {
      setError('Connection failed. Please try again.');
      setStep('select');
    }
  }, [supabase, onClose]);

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err, metadata) => console.log('❌ Plaid exit', { err, metadata }),
    onEvent: (eventName, metadata) => console.log('🔹 Plaid event', { eventName, metadata }),
  });

  // ── 2. Mock Flow (Existing) ──
  const handleBankSelect = (bank: typeof BANK_OPTIONS[0]) => {
    setSelectedBank(bank);
    setStep('auth');
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        if (selectedBank) {
          addAccount({
            bankName: selectedBank.name,
            accountNumber: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
            accountType: 'savings',
            balance: Math.floor(Math.random() * 200000 + 50000),
            currency: 'LKR',
            color: selectedBank.color,
            logo: selectedBank.logo,
            lastFour: Math.floor(Math.random() * 9000 + 1000).toString(),
          });
          onClose();
        }
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="card-glass slide-up" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '420px', padding: '0', overflow: 'hidden',
        background: 'var(--bg-1)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        
        {/* Progress Bar */}
        <div style={{ height: '3px', background: 'var(--bg-3)', width: '100%' }}>
          <div style={{ 
            height: '100%', background: 'var(--violet)', 
            width: step === 'select' ? '25%' : step === 'auth' ? '50%' : step === 'loading' ? '75%' : '100%',
            transition: 'width 0.5s ease', boxShadow: '0 0 8px var(--violet)'
          }} />
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: selectedBank ? `linear-gradient(135deg, ${selectedBank.color}20, ${selectedBank.color}08)` : 'var(--bg-2)',
              border: selectedBank ? `1px solid ${selectedBank.color}30` : '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px',
            }}>{selectedBank ? selectedBank.logo : <Building2 size={24} style={{ color: 'var(--fg-4)' }} />}</div>
            <h3 style={{ fontSize:'18px', fontWeight:800 }}>{step === 'select' ? 'Link Account' : 'Security Check'}</h3>
            <p style={{ fontSize:'12.5px', color:'var(--fg-3)', marginTop:'6px' }}>{step === 'select' ? 'Choose your connection method.' : 'Please authorize the connection.'}</p>
          </div>

          {step === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Plaid Primary Button */}
              <button 
                onClick={() => openPlaid()}
                disabled={!plaidReady}
                style={{
                  width:'100%', padding:'16px', borderRadius:'14px', border:'none',
                  background:'linear-gradient(135deg, #00c6ff, #0072ff)',
                  color:'#fff', fontWeight:800, fontSize:'14px', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                  boxShadow:'0 10px 25px rgba(0, 114, 255, 0.3)', transition:'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Globe size={18}/> Connect Real Bank (Plaid)
              </button>

              <div style={{ textAlign:'center', margin:'10px 0', fontSize:'11px', color:'var(--fg-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>OR USE SIMULATOR</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                {BANK_OPTIONS.map(bank => (
                  <button key={bank.name} onClick={() => handleBankSelect(bank)} className="card-sm" style={{ padding:'12px', background:'var(--bg-2)', borderRadius:'12px', border:'1px solid var(--border)', cursor:'pointer' }}>
                    <div style={{ fontSize:'18px', marginBottom:'4px' }}>{bank.logo}</div>
                    <span style={{ fontSize:'10px', fontWeight:700 }}>{bank.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'auth' && (
            <form onSubmit={handleMockLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding:'10px', background:'var(--bg-2)', borderRadius:'8px', border:'1px solid var(--border)', fontSize:'11px', color:'var(--fg-3)', display:'flex', alignItems:'center', gap:'8px' }}>
                <Shield size={12} color="var(--green)"/> Simulation Mode Active
              </div>
              <input placeholder="Username" className="metal-input" style={{ background:'var(--bg-2)' }} required />
              <input type="password" placeholder="Password" className="metal-input" style={{ background:'var(--bg-2)' }} required />
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={() => setStep('select')} style={{ flex:1, padding:'12px', borderRadius:'10px', border:'1px solid var(--border)', background:'transparent', color:'var(--fg-3)' }}>Back</button>
                <button type="submit" style={{ flex:2, padding:'12px', borderRadius:'10px', border:'none', background:'var(--violet)', color:'#fff', fontWeight:700 }}>Authorize</button>
              </div>
            </form>
          )}

          {step === 'loading' && (
            <div style={{ textAlign:'center', py:'20px' }}>
              <Loader2 size={40} className="animate-spin" style={{ color:'var(--violet)', margin:'0 auto 20px' }} />
              <p style={{ fontSize:'13px', color:'var(--fg-3)' }}>Securing connection to bank server...</p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign:'center', py:'20px' }}>
              <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'var(--green-2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <CheckCircle2 size={32} color="var(--green)" />
              </div>
              <p style={{ fontSize:'16px', fontWeight:800 }}>Account Linked Successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
