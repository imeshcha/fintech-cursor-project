'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { ChevronDown, Check, Plus, CreditCard, Shield } from 'lucide-react';

interface Props {
  compact?: boolean;
  onAddAccount?: () => void;
}

export default function BankSelector({ compact, onAddAccount }: Props) {
  const { accounts, activeAccountId, activeAccount, setActiveAccountId } = useBankAccounts();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!activeAccount) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        id="bank-selector-trigger"
        onClick={() => setOpen(v => !v)}
        className="bank-selector-btn"
        style={{
          display: 'flex', alignItems: 'center', gap: compact ? '5px' : '7px',
          padding: compact ? '5px 8px' : '6px 10px',
          borderRadius: 'var(--r-pill)',
          border: 'var(--card-border)',
          background: open ? 'var(--bg-3)' : 'var(--bg-2)',
          cursor: 'pointer',
          transition: 'all var(--t)',
          flexShrink: 0,
          boxShadow: 'var(--sh-xs)',
        }}
      >
        {/* Bank Indicator Dot */}
        <div style={{
          width: compact ? '6px' : '8px',
          height: compact ? '6px' : '8px',
          borderRadius: '50%',
          background: activeAccount.color,
          boxShadow: `0 0 6px ${activeAccount.color}60`,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: compact ? '11px' : '12px',
          fontWeight: 600,
          color: 'var(--fg-2)',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          maxWidth: compact ? '80px' : '140px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {compact ? activeAccount.bankName.split(' ').map(w => w[0]).join('') : activeAccount.bankName}
        </span>
        <span style={{
          fontSize: compact ? '9.5px' : '10.5px',
          color: 'var(--fg-4)',
          fontFamily: 'monospace',
        }}>
          ••{activeAccount.lastFour}
        </span>
        <ChevronDown
          size={compact ? 10 : 12}
          style={{
            color: 'var(--fg-4)',
            transition: 'transform var(--t)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="card slide-up" style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: 0,
          minWidth: '280px',
          padding: '6px',
          zIndex: 500,
          borderRadius: 'var(--r-lg)',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 12px 8px',
            display: 'flex', alignItems: 'center', gap: '6px',
            borderBottom: 'var(--card-border)',
            marginBottom: '4px',
          }}>
            <Shield size={11} style={{ color: 'var(--fg-4)' }} />
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--fg-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Select Bank Account
            </span>
          </div>

          {/* Account List */}
          {accounts.map(acc => {
            const isActive = acc.id === activeAccountId;
            return (
              <button
                key={acc.id}
                onClick={() => { setActiveAccountId(acc.id); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  background: isActive ? 'var(--bg-3)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--t)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-3)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Bank Icon */}
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${acc.color}20, ${acc.color}08)`,
                  border: `1px solid ${acc.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {acc.logo}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--fg)',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {acc.bankName}
                    {acc.isVerified && (
                      <span style={{
                        fontSize: '8px',
                        background: 'var(--green-2)',
                        color: 'var(--green)',
                        padding: '1px 5px',
                        borderRadius: 'var(--r-pill)',
                        fontWeight: 600,
                        border: '1px solid rgba(52,211,153,0.2)',
                      }}>
                        Verified
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      color: 'var(--fg-4)',
                      fontFamily: 'monospace',
                      letterSpacing: '0.04em',
                    }}>
                      ••••{acc.lastFour}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      color: 'var(--fg-3)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {acc.accountType}
                    </span>
                  </div>
                </div>

                {/* Balance + Check */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-head)',
                    letterSpacing: '-0.03em',
                  }}>
                    {acc.balance.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--fg-4)' }}>{acc.currency}</div>
                </div>

                {isActive && (
                  <Check size={14} style={{ color: 'var(--violet)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}

          {/* Add Account Button */}
          <button
            onClick={() => { setOpen(false); onAddAccount?.(); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all var(--t)',
              marginTop: '2px',
              borderTop: 'var(--card-border)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              border: '1px dashed var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-4)',
            }}>
              <Plus size={14} />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--fg-3)' }}>
              Link New Account
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
