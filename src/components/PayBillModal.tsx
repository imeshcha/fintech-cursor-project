'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Zap, ChevronLeft, Shield, CheckCircle, XCircle, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { useFinances } from '@/lib/finances';

interface Props { isOpen: boolean; onClose: () => void; }
type Step = 'billers' | 'pin' | 'processing' | 'success' | 'error';

interface Biller { id: string; name: string; billNumber: string; amount: string; category: string; }

const BILLER_CATEGORIES = [
  { label: 'Electricity', emoji: '⚡', example: 'e.g. CEB / LECO' },
  { label: 'Water', emoji: '💧', example: 'e.g. National Water' },
  { label: 'Internet', emoji: '🌐', example: 'e.g. SLT, Dialog' },
  { label: 'Mobile', emoji: '📱', example: 'e.g. Dialog, Mobitel' },
  { label: 'Insurance', emoji: '🛡️', example: 'e.g. AIA, Ceylinco' },
  { label: 'Credit Card', emoji: '💳', example: 'e.g. Sampath CC' },
  { label: 'TV / Cable', emoji: '📺', example: 'e.g. PEO TV, Dialog' },
  { label: 'Other', emoji: '🏢', example: 'Other biller' },
];

const newBiller = (): Biller => ({ id: Date.now().toString(), name: '', billNumber: '', amount: '', category: 'Electricity' });

export default function PayBillModal({ isOpen, onClose }: Props) {
  const { accounts, activeAccount, executeTransaction } = useBankAccounts();
  const { addTransaction } = useFinances();

  const [step, setStep] = useState<Step>('billers');
  const [billers, setBillers] = useState<Biller[]>([newBiller()]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('billers');
      setBillers([newBiller()]);
      setPin(['', '', '', '']);
      setErrorMsg('');
      setFromAccountId(activeAccount?.id || accounts[0]?.id || '');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'pin') setTimeout(() => pinRefs.current[0]?.focus(), 100);
  }, [step]);

  if (!isOpen) return null;

  const totalAmount = billers.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const fromAcc = accounts.find(a => a.id === fromAccountId) || activeAccount;

  const addBiller = () => setBillers(prev => [...prev, newBiller()]);
  const removeBiller = (id: string) => setBillers(prev => prev.filter(b => b.id !== id));
  const updateBiller = (id: string, field: keyof Biller, value: string) =>
    setBillers(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));

  const isValid = billers.every(b => b.name && b.billNumber && b.amount && Number(b.amount) > 0) && billers.length > 0;

  const handlePinChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const p = [...pin]; p[i] = v; setPin(p);
    if (v && i < 3) pinRefs.current[i + 1]?.focus();
    if (v && i === 3 && p.every(d => d)) submitPayment(p.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  const submitPayment = async (pinStr: string) => {
    setStep('processing');
    if (!fromAcc) { setStep('error'); setErrorMsg('No account selected'); return; }

    // Execute all bills one by one
    for (const biller of billers) {
      const result = await executeTransaction({
        fromAccountId: fromAcc.id,
        amount: Number(biller.amount),
        description: `${biller.category} - ${biller.name}`,
        category: 'Bills',
        type: 'debit',
      }, pinStr);

      if (!result.success) {
        setErrorMsg(result.message ?? 'Payment failed');
        setStep('error');
        setTimeout(() => { setStep('pin'); setPin(['', '', '', '']); setErrorMsg(''); setTimeout(() => pinRefs.current[0]?.focus(), 100); }, 2000);
        return;
      }

      // Log each transaction
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        description: `Bill: ${biller.name} (#${biller.billNumber})`,
        amount: Number(biller.amount),
        category: 'Bills',
        type: 'debit',
        bank: fromAcc.bankName,
      });
    }

    setStep('success');
    setTimeout(() => { onClose(); }, 2500);
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="card slide-up" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: 'var(--card-border)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {step === 'pin' && (
            <button onClick={() => setStep('billers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: '4px' }}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg)' }}>Pay Bills</h2>
            <p style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>
              {step === 'billers' && `${billers.length} biller${billers.length > 1 ? 's' : ''} · Total LKR ${totalAmount.toLocaleString()}`}
              {step === 'pin' && 'Confirm with your PIN'}
              {step === 'processing' && 'Processing payments...'}
              {step === 'success' && 'All bills paid!'}
              {step === 'error' && 'Payment failed'}
            </p>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-4)', display: 'flex', padding: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-4)'}
            ><X size={18} /></button>
          )}
        </div>

        {/* Step: Billers */}
        {step === 'billers' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {billers.map((biller, idx) => (
              <div key={biller.id} style={{ padding: '16px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Biller {idx + 1}</span>
                  {billers.length > 1 && (
                    <button onClick={() => removeBiller(biller.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-4)', display: 'flex', padding: '2px', borderRadius: '4px', transition: 'color var(--t)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-4)'}
                    ><Trash2 size={13} /></button>
                  )}
                </div>

                {/* Category selector */}
                <div>
                  <label style={{ fontSize: '10.5px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Bill Type</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {BILLER_CATEGORIES.map(cat => (
                      <button key={cat.label} onClick={() => updateBiller(biller.id, 'category', cat.label)} style={{
                        padding: '5px 10px', borderRadius: 'var(--r-pill)', border: '1px solid',
                        borderColor: biller.category === cat.label ? 'rgba(123,104,238,0.5)' : 'var(--border-2)',
                        background: biller.category === cat.label ? 'var(--violet-2)' : 'var(--bg-3)',
                        color: biller.category === cat.label ? 'var(--violet)' : 'var(--fg-4)',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all var(--t)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <span>{cat.emoji}</span> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '10.5px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Biller Name</label>
                    <input value={biller.name} onChange={e => updateBiller(biller.id, 'name', e.target.value)}
                      placeholder={BILLER_CATEGORIES.find(c => c.label === biller.category)?.example || 'Biller name'}
                      className="metal-input" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Bill / Reference No.</label>
                    <input value={biller.billNumber} onChange={e => updateBiller(biller.id, 'billNumber', e.target.value)}
                      placeholder="e.g. 987654321" inputMode="numeric"
                      className="metal-input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Amount (LKR)</label>
                  <input value={biller.amount} onChange={e => updateBiller(biller.id, 'amount', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0.00" inputMode="numeric"
                    className="metal-input" style={{ width: '100%', fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }} />
                </div>
              </div>
            ))}

            {/* Add another biller */}
            <button onClick={addBiller} style={{
              padding: '12px', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-2)',
              background: 'transparent', color: 'var(--fg-4)', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all var(--t)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,104,238,0.4)'; e.currentTarget.style.color = 'var(--violet)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--fg-4)'; }}
            ><Plus size={14} /> Add Another Bill</button>

            {/* From account + total */}
            <div style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--fg-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pay From</span>
                <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="metal-input" style={{ fontSize: '12px', padding: '4px 8px' }}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} ••{a.lastFour}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--fg-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--rose)' }}>
                  -LKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              disabled={!isValid}
              onClick={() => setStep('pin')}
              style={{
                padding: '13px', borderRadius: 'var(--r-md)', border: 'none',
                cursor: isValid ? 'pointer' : 'not-allowed',
                background: isValid ? 'linear-gradient(135deg,#8b7cf8,#6d5ce7)' : 'var(--bg-3)',
                color: isValid ? '#fff' : 'var(--fg-4)',
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: isValid ? '0 4px 16px rgba(109,92,231,0.4)' : 'none',
                transition: 'all var(--t)',
              }}
            ><Zap size={16} /> Pay LKR {totalAmount.toLocaleString()}</button>
          </div>
        )}

        {/* Step: PIN */}
        {step === 'pin' && (
          <div style={{ padding: '28px 24px', textAlign: 'center', flex: 1 }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--amber-2)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Building2 size={24} style={{ color: 'var(--amber)' }} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Confirm Bill Payments</h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-4)', marginBottom: '20px' }}>
              Enter PIN to pay <strong style={{ color: 'var(--fg)' }}>{billers.length} bill{billers.length > 1 ? 's' : ''}</strong> totalling <strong style={{ color: 'var(--rose)' }}>LKR {totalAmount.toLocaleString()}</strong>
            </p>

            <div style={{ padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)', marginBottom: '20px', textAlign: 'left' }}>
              {billers.map((b, i) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < billers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--fg-2)' }}>{BILLER_CATEGORIES.find(c => c.label === b.category)?.emoji} {b.name} #{b.billNumber}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rose)' }}>-LKR {Number(b.amount).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              {pin.map((digit, i) => (
                <input key={i} ref={el => { pinRefs.current[i] = el; }} type="password" inputMode="numeric" maxLength={1}
                  value={digit} onChange={e => handlePinChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: '52px', height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 800,
                    background: 'var(--bg-2)', border: digit ? '2px solid rgba(123,104,238,0.5)' : 'var(--card-border)',
                    borderRadius: 'var(--r-md)', color: 'var(--fg)', outline: 'none', transition: 'all var(--t)',
                    boxShadow: digit ? '0 0 0 3px rgba(123,104,238,0.08)' : 'none',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '10px', color: 'var(--fg-4)' }}>
              <Shield size={9} /> End-to-end encrypted
            </div>
            <div style={{ marginTop: '12px', padding: '7px 12px', background: 'var(--amber-2)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <AlertTriangle size={10} style={{ color: 'var(--amber)' }} />
              <span style={{ fontSize: '10px', color: 'var(--amber)' }}>Demo PIN: 1234</span>
            </div>
          </div>
        )}

        {/* Step: Processing / Success / Error */}
        {(step === 'processing' || step === 'success' || step === 'error') && (
          <div style={{ padding: '48px 24px', textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step === 'success' ? 'var(--green-2)' : step === 'error' ? 'var(--rose-2)' : 'var(--violet-2)',
              border: step === 'success' ? '1px solid rgba(52,211,153,0.3)' : step === 'error' ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(123,104,238,0.3)',
              transition: 'all 0.3s var(--ease)',
            }}>
              {step === 'processing' && <Loader2 size={30} style={{ color: 'var(--violet)', animation: 'spin 1s linear infinite' }} />}
              {step === 'success' && <CheckCircle size={30} style={{ color: 'var(--green)' }} />}
              {step === 'error' && <XCircle size={30} style={{ color: 'var(--rose)' }} />}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              {step === 'processing' ? 'Processing...' : step === 'success' ? 'Bills Paid!' : 'Payment Failed'}
            </h3>
            {step === 'success' && <p style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>{billers.length} bill{billers.length > 1 ? 's' : ''} paid — LKR {totalAmount.toLocaleString()}</p>}
            {step === 'error' && <p style={{ fontSize: '13px', color: 'var(--rose)', fontWeight: 500 }}>{errorMsg}</p>}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
