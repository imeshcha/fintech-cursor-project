'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { Shield, Lock, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  category: string;
  recipient?: string;
}

export default function TransactionDialog({ isOpen, onClose, amount, description, category, recipient }: Props) {
  const { activeAccount, executeTransaction } = useBankAccounts();
  const [pin, setPin] = useState(['', '', '', '']);
  const [status, setStatus] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && status === 'input') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, status]);

  if (!isOpen || !activeAccount) return null;

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3 && newPin.every(d => d)) {
      handleSubmit(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pinStr: string) => {
    setStatus('processing');

    const result = await executeTransaction({
      fromAccountId: activeAccount.id,
      amount,
      description,
      category,
      type: 'debit',
    }, pinStr);

    if (result.success) {
      setStatus('success');
      setSuccessMsg(result.message || 'Transaction successful');
      setTimeout(() => {
        reset();
      }, 2500);
    } else {
      setStatus('error');
      setErrorMsg(result.message || 'Transaction failed');
      setTimeout(() => {
        setStatus('input');
        setPin(['', '', '', '']);
        setErrorMsg('');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }, 2000);
    }
  };

  const reset = () => {
    setPin(['', '', '', '']);
    setStatus('input');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay fade-in" onClick={reset} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="card slide-up" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '400px',
        padding: '32px',
        textAlign: 'center',
      }}>
        {/* Status Icon */}
        <div style={{
          width: '60px', height: '60px',
          borderRadius: '18px',
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: status === 'success' ? 'var(--green-2)' :
                     status === 'error' ? 'var(--rose-2)' :
                     status === 'processing' ? 'var(--violet-2)' :
                     'var(--bg-3)',
          border: status === 'success' ? '1px solid rgba(52,211,153,0.3)' :
                  status === 'error' ? '1px solid rgba(248,113,113,0.3)' :
                  status === 'processing' ? '1px solid rgba(123,104,238,0.3)' :
                  'var(--card-border)',
          transition: 'all 0.3s var(--ease)',
        }}>
          {status === 'input' && <Lock size={26} style={{ color: 'var(--fg-3)' }} />}
          {status === 'processing' && <Loader2 size={26} style={{ color: 'var(--violet)', animation: 'spin 1s linear infinite' }} />}
          {status === 'success' && <CheckCircle size={26} style={{ color: 'var(--green)' }} />}
          {status === 'error' && <XCircle size={26} style={{ color: 'var(--rose)' }} />}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-head)',
          fontSize: '18px', fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--fg)',
          marginBottom: '6px',
        }}>
          {status === 'input' && 'Confirm Transaction'}
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Transaction Complete'}
          {status === 'error' && 'Transaction Failed'}
        </h3>

        {status === 'input' && (
          <>
            <p style={{ fontSize: '12px', color: 'var(--fg-3)', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter your 4-digit PIN to authorize this payment
            </p>

            {/* Transaction Summary */}
            <div style={{
              padding: '16px',
              background: 'var(--bg-2)',
              borderRadius: 'var(--r-md)',
              border: 'var(--card-border)',
              marginBottom: '24px',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--fg-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</span>
                <span style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '20px', fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: 'var(--rose)',
                }}>
                  -LKR {amount.toLocaleString()}
                </span>
              </div>
              <div className="glow-line" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>From</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--fg-2)', fontWeight: 600 }}>
                    {activeAccount.bankName} ••{activeAccount.lastFour}
                  </span>
                </div>
                {recipient && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>To</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--fg-2)', fontWeight: 600 }}>{recipient}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--fg-4)' }}>Description</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--fg-2)', fontWeight: 600 }}>{description}</span>
                </div>
              </div>
            </div>

            {/* PIN Input */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: '52px', height: '56px',
                    textAlign: 'center',
                    fontSize: '22px', fontWeight: 800,
                    background: 'var(--bg-2)',
                    border: digit ? '2px solid rgba(123,104,238,0.5)' : 'var(--card-border)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--fg)',
                    outline: 'none',
                    transition: 'all var(--t)',
                    boxShadow: digit ? '0 0 0 3px rgba(123,104,238,0.08)' : 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              ))}
            </div>

            {/* Security notice */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontSize: '10.5px', color: 'var(--fg-4)',
            }}>
              <Shield size={10} />
              <span>Secured with end-to-end encryption</span>
            </div>

            {/* Demo PIN hint */}
            <div style={{
              marginTop: '16px',
              padding: '8px 12px',
              background: 'var(--amber-2)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <AlertTriangle size={11} style={{ color: 'var(--amber)', flexShrink: 0 }} />
              <span style={{ fontSize: '10.5px', color: 'var(--amber)', fontWeight: 500 }}>
                Demo PIN: 1234
              </span>
            </div>
          </>
        )}

        {status === 'processing' && (
          <p style={{ fontSize: '12.5px', color: 'var(--fg-3)', marginTop: '8px' }}>
            Verifying PIN and processing transaction...
          </p>
        )}

        {status === 'success' && (
          <p style={{ fontSize: '12.5px', color: 'var(--green)', marginTop: '8px', fontWeight: 500 }}>
            {successMsg}
          </p>
        )}

        {status === 'error' && (
          <p style={{ fontSize: '12.5px', color: 'var(--rose)', marginTop: '8px', fontWeight: 500 }}>
            {errorMsg}
          </p>
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
