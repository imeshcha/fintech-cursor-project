'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ArrowRight, ChevronLeft, Shield, CheckCircle, XCircle, Loader2, User, AlertTriangle, Banknote } from 'lucide-react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { useFinances } from '@/lib/finances';

interface Props { isOpen: boolean; onClose: () => void; }
type Step = 'recipient' | 'amount' | 'pin' | 'processing' | 'success' | 'error';

const BANKS = ['NTB','BOC','Peoples Bank','Sampath Bank','Commercial Bank','HNB','Seylan Bank','DFCC Bank','Nations Trust','Pan Asia Bank'];

export default function SendMoneyModal({ isOpen, onClose }: Props) {
  const { accounts, activeAccount, executeTransaction } = useBankAccounts();
  const { contacts, addTransaction } = useFinances();

  const [step, setStep] = useState<Step>('recipient');
  const [search, setSearch] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('recipient'); setSearch(''); setRecipientName(''); setRecipientAccount('');
      setRecipientBank(''); setAmount(''); setNote(''); setPin(['', '', '', '']); setErrorMsg('');
      setFromAccountId(activeAccount?.id || accounts[0]?.id || '');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'amount') setTimeout(() => amountRef.current?.focus(), 100);
    if (step === 'pin') setTimeout(() => pinRefs.current[0]?.focus(), 100);
  }, [step]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber.includes(search)
  );

  const selectContact = (c: typeof contacts[0]) => {
    setRecipientName(c.name); setRecipientAccount(c.accountNumber); setRecipientBank(c.bank);
    setStep('amount');
  };

  const handlePinChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const p = [...pin]; p[i] = v; setPin(p);
    if (v && i < 3) pinRefs.current[i + 1]?.focus();
    if (v && i === 3 && p.every(d => d)) submitTransaction(p.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  const submitTransaction = async (pinStr: string) => {
    setStep('processing');
    const fromAcc = accounts.find(a => a.id === fromAccountId) || activeAccount;
    if (!fromAcc) { setStep('error'); setErrorMsg('No account selected'); return; }

    const result = await executeTransaction({
      fromAccountId: fromAcc.id,
      amount: Number(amount),
      description: `Transfer to ${recipientName}`,
      category: 'Others',
      type: 'debit',
    }, pinStr);

    if (result.success) {
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        description: `Transfer to ${recipientName}`,
        amount: Number(amount),
        category: 'Others',
        type: 'debit',
        bank: fromAcc.bankName,
      });
      setStep('success');
      setTimeout(() => { onClose(); }, 2500);
    } else {
      setErrorMsg(result.message);
      setStep('error');
      setTimeout(() => { setStep('pin'); setPin(['', '', '', '']); setErrorMsg(''); setTimeout(() => pinRefs.current[0]?.focus(), 100); }, 2000);
    }
  };

  const fromAcc = accounts.find(a => a.id === fromAccountId) || activeAccount;

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="card slide-up" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '460px', padding: 0, overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: 'var(--card-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(step === 'amount') && (
            <button onClick={() => setStep('recipient')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: '4px' }}>
              <ChevronLeft size={18} />
            </button>
          )}
          {(step === 'pin') && (
            <button onClick={() => setStep('amount')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: '4px' }}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg)' }}>Send Money</h2>
            <p style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>
              {step === 'recipient' && 'Choose a recipient'}
              {step === 'amount' && `To ${recipientName} · ${recipientBank}`}
              {step === 'pin' && 'Confirm with your PIN'}
              {step === 'processing' && 'Processing transfer...'}
              {step === 'success' && 'Transfer complete!'}
              {step === 'error' && 'Transfer failed'}
            </p>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-4)', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'color var(--t)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-4)'}
            ><X size={18} /></button>
          )}
        </div>

        {/* Step: Recipient */}
        {step === 'recipient' && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-4)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search saved contacts..."
                className="metal-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            {/* Saved Contacts */}
            {filteredContacts.length > 0 && (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Saved Contacts</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                  {filteredContacts.map(c => (
                    <button key={c.id} onClick={() => selectContact(c)} style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                      borderRadius: 'var(--r-md)', border: 'var(--card-border)', background: 'var(--bg-2)',
                      cursor: 'pointer', transition: 'all var(--t)', textAlign: 'left', width: '100%',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.color + '20', border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: c.color, flexShrink: 0 }}>
                        {c.avatar?.length === 1 ? c.avatar : <User size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--fg-4)', fontFamily: 'monospace' }}>{c.bank} · {c.accountNumber}</div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Entry */}
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Or Enter Manually</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Recipient Name</label>
                  <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Full name" className="metal-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Account Number</label>
                  <input value={recipientAccount} onChange={e => setRecipientAccount(e.target.value)} placeholder="e.g. 1234567890" className="metal-input" style={{ width: '100%' }} inputMode="numeric" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Bank</label>
                  <select value={recipientBank} onChange={e => setRecipientBank(e.target.value)} className="metal-input" style={{ width: '100%' }}>
                    <option value="">Select bank...</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button
                  disabled={!recipientName || !recipientAccount || !recipientBank}
                  onClick={() => setStep('amount')}
                  style={{
                    padding: '11px', borderRadius: 'var(--r-md)', border: 'none', cursor: recipientName && recipientAccount && recipientBank ? 'pointer' : 'not-allowed',
                    background: recipientName && recipientAccount && recipientBank ? 'linear-gradient(135deg,#8b7cf8,#6d5ce7)' : 'var(--bg-3)',
                    color: recipientName && recipientAccount && recipientBank ? '#fff' : 'var(--fg-4)',
                    fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: recipientName && recipientAccount && recipientBank ? '0 2px 14px rgba(109,92,231,0.35)' : 'none',
                    transition: 'all var(--t)',
                  }}
                >Continue <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Amount */}
        {step === 'amount' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Recipient chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--violet-2)', border: '1px solid var(--violet-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} style={{ color: 'var(--violet)' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>{recipientName}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--fg-4)', fontFamily: 'monospace' }}>{recipientBank} · {recipientAccount}</div>
              </div>
            </div>

            {/* Amount */}
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '28px', color: 'var(--fg-3)', fontWeight: 600 }}>LKR</span>
                <input
                  ref={amountRef}
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  style={{
                    fontFamily: 'var(--font-head)', fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em',
                    background: 'none', border: 'none', outline: 'none', color: 'var(--fg)',
                    width: `${Math.max(amount.length, 1) * 32}px`, maxWidth: '280px', minWidth: '60px',
                    textAlign: 'center',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-4)' }}>Available: {fromAcc?.currency} {fromAcc?.balance.toLocaleString()}</div>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1000, 2500, 5000, 10000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))} style={{
                  padding: '6px 14px', borderRadius: 'var(--r-pill)', border: 'var(--card-border)',
                  background: amount === String(v) ? 'var(--violet-2)' : 'var(--bg-2)',
                  color: amount === String(v) ? 'var(--violet)' : 'var(--fg-3)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all var(--t)',
                }}>
                  {v.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Note */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Note (optional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Rent, Lunch split..." className="metal-input" style={{ width: '100%' }} />
            </div>

            {/* From account selector */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>From Account</label>
              <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="metal-input" style={{ width: '100%' }}>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName} ••{a.lastFour} ({a.currency} {a.balance.toLocaleString()})</option>)}
              </select>
            </div>

            <button
              disabled={!amount || Number(amount) <= 0}
              onClick={() => setStep('pin')}
              style={{
                padding: '13px', borderRadius: 'var(--r-md)', border: 'none',
                cursor: amount && Number(amount) > 0 ? 'pointer' : 'not-allowed',
                background: amount && Number(amount) > 0 ? 'linear-gradient(135deg,#8b7cf8,#6d5ce7)' : 'var(--bg-3)',
                color: amount && Number(amount) > 0 ? '#fff' : 'var(--fg-4)',
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: amount && Number(amount) > 0 ? '0 4px 16px rgba(109,92,231,0.4)' : 'none',
                transition: 'all var(--t)',
              }}
            ><Banknote size={16} /> Send LKR {Number(amount || 0).toLocaleString()}</button>
          </div>
        )}

        {/* Step: PIN */}
        {step === 'pin' && (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--violet-2)', border: '1px solid var(--violet-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Shield size={24} style={{ color: 'var(--violet)' }} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Enter PIN</h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-4)', marginBottom: '20px' }}>
              Authorise transfer of <strong style={{ color: 'var(--fg)' }}>LKR {Number(amount).toLocaleString()}</strong> to {recipientName}
            </p>
            <div style={{ padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)', marginBottom: '20px', textAlign: 'left', fontSize: '11.5px', color: 'var(--fg-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>To</span><strong style={{ color: 'var(--fg)' }}>{recipientName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>Bank</span><strong style={{ color: 'var(--fg)' }}>{recipientBank}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>Account</span><strong style={{ color: 'var(--fg)', fontFamily: 'monospace' }}>{recipientAccount}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Amount</span><strong style={{ color: 'var(--rose)' }}>-LKR {Number(amount).toLocaleString()}</strong></div>
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
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
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
              {step === 'processing' ? 'Sending...' : step === 'success' ? 'Sent Successfully!' : 'Transfer Failed'}
            </h3>
            {step === 'success' && <p style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>LKR {Number(amount).toLocaleString()} sent to {recipientName}</p>}
            {step === 'error' && <p style={{ fontSize: '13px', color: 'var(--rose)', fontWeight: 500 }}>{errorMsg}</p>}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
