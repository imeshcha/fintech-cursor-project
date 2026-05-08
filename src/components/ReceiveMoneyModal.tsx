'use client';
import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2 } from 'lucide-react';
import { useBankAccounts } from '@/lib/bank-accounts';

interface Props { isOpen: boolean; onClose: () => void; }

export default function ReceiveMoneyModal({ isOpen, onClose }: Props) {
  const { accounts, activeAccount } = useBankAccounts();
  const [selectedId, setSelectedId] = useState(activeAccount?.id || '');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const acc = accounts.find(a => a.id === selectedId) || activeAccount;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="card slide-up" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg)' }}>Receive Money</h2>
            <p style={{ fontSize: '11px', color: 'var(--fg-4)', marginTop: '2px' }}>Share your account details</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-4)', display: 'flex', padding: '4px', borderRadius: '6px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-4)'}
          ><X size={18} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Account selector */}
          {accounts.length > 1 && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 600, marginBottom: '7px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Receive to</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {accounts.map(a => (
                  <button key={a.id} onClick={() => setSelectedId(a.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px',
                    borderRadius: 'var(--r-md)', border: selectedId === a.id ? '1.5px solid var(--violet)' : 'var(--card-border)',
                    background: selectedId === a.id ? 'var(--violet-2)' : 'var(--bg-2)',
                    cursor: 'pointer', transition: 'all var(--t)',
                  }}>
                    <div style={{ fontSize: '18px' }}>{a.logo}</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>{a.bankName}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--fg-4)', fontFamily: 'monospace' }}>••••{a.lastFour} · {a.accountType}</div>
                    </div>
                    {selectedId === a.id && <Check size={14} style={{ color: 'var(--violet)', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR Code placeholder */}
          <div style={{
            background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', border: '1px dashed var(--border-2)',
            padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: 'var(--bg-3)', border: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              <QrCode size={50} style={{ color: 'var(--fg-3)' }} />
            </div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-2)' }}>{acc?.bankName}</p>
            <p style={{ fontSize: '10.5px', color: 'var(--fg-4)' }}>Scan to pay</p>
          </div>

          {/* Account details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Bank', value: acc?.bankName || '' },
              { label: 'Account Number', value: acc?.accountNumber || '', key: 'account', mono: true },
              { label: 'Account Type', value: acc?.accountType || '' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: 'var(--card-border)',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--fg-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{row.label}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg)', fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
                </div>
                {row.key && (
                  <button onClick={() => copyToClipboard(row.value, row.key!)} style={{
                    padding: '6px 10px', borderRadius: 'var(--r-sm)', border: 'var(--card-border)', background: 'var(--bg-3)',
                    color: copied === row.key ? 'var(--green)' : 'var(--fg-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 600, transition: 'all var(--t)', flexShrink: 0,
                  }}>
                    {copied === row.key ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Share button */}
          <button style={{
            padding: '12px', borderRadius: 'var(--r-md)', border: 'var(--card-border)', background: 'var(--bg-2)',
            color: 'var(--fg-2)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all var(--t)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'rgba(123,104,238,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Bank Details', text: `Bank: ${acc?.bankName}\nAccount: ${acc?.accountNumber}` });
              } else {
                copyToClipboard(`Bank: ${acc?.bankName}\nAccount: ${acc?.accountNumber}`, 'share');
              }
            }}
          ><Share2 size={14} /> Share Account Details</button>
        </div>
      </div>
    </div>
  );
}
