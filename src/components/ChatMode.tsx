'use client';
import React, { useState } from 'react';
import { MessageSquare, Users, CreditCard, ChevronDown, Check, Wallet } from 'lucide-react';
import ChatInterface from './ChatInterface';
import SavedContacts from './SavedContacts';
import TransactionDialog from './TransactionDialog';
import { useBankAccounts } from '@/lib/bank-accounts';

export default function ChatMode({ user }: { user: any }) {
  const [panel, setPanel] = useState<'chat'|'contacts'>('chat');
  const { accounts, activeAccountId, activeAccount, setActiveAccountId } = useBankAccounts();
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);

  return (
    <div style={{ height:'calc(100vh - var(--header-h))', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      {/* Sub-nav */}
      <div style={{ padding:'10px 20px', borderBottom:'var(--card-border)', background:'var(--bg-1)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', transition:'background 0.3s' }}>
        <div className="tab-bar">
          <button className={`tab-btn ${panel==='chat'?'active':''}`} onClick={()=>setPanel('chat')}><MessageSquare size={12}/>AI Chat</button>
          <button className={`tab-btn ${panel==='contacts'?'active':''}`} onClick={()=>setPanel('contacts')}><Users size={12}/>Contacts</button>
        </div>

        {/* ── Payment Method Selector (top of chat) ── */}
        {panel === 'chat' && activeAccount && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPaymentMenuOpen(v => !v)}
              className="bank-selector-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '6px 12px',
                borderRadius: 'var(--r-pill)',
                border: 'var(--card-border)',
                background: paymentMenuOpen ? 'var(--bg-3)' : 'var(--bg-2)',
                cursor: 'pointer',
                transition: 'all var(--t)',
                boxShadow: 'var(--sh-xs)',
              }}
            >
              <Wallet size={12} style={{ color: 'var(--fg-4)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Pay via
              </span>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: activeAccount.color,
                boxShadow: `0 0 5px ${activeAccount.color}60`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-2)', letterSpacing: '-0.01em' }}>
                {activeAccount.bankName}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--fg-4)', fontFamily: 'monospace' }}>
                ••{activeAccount.lastFour}
              </span>
              <ChevronDown size={11} style={{
                color: 'var(--fg-4)',
                transition: 'transform var(--t)',
                transform: paymentMenuOpen ? 'rotate(180deg)' : 'none',
              }} />
            </button>

            {/* Payment Method Dropdown */}
            {paymentMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 499 }}
                  onClick={() => setPaymentMenuOpen(false)}
                />
                <div className="card slide-up" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '300px',
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
                    <CreditCard size={11} style={{ color: 'var(--fg-4)' }} />
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Select Payment Method
                    </span>
                  </div>

                  {/* Account List */}
                  {accounts.map(acc => {
                    const isActive = acc.id === activeAccountId;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => { setActiveAccountId(acc.id); setPaymentMenuOpen(false); }}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', gap: '12px',
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
                          width: '34px', height: '34px', borderRadius: '9px',
                          background: `linear-gradient(135deg, ${acc.color}20, ${acc.color}08)`,
                          border: `1px solid ${acc.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '15px', flexShrink: 0,
                        }}>
                          {acc.logo}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--fg)', marginBottom: '1px' }}>
                            {acc.bankName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--fg-4)', fontFamily: 'monospace' }}>
                              ••••{acc.lastFour}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--fg-3)', fontWeight: 600, textTransform: 'capitalize' }}>
                              {acc.accountType}
                            </span>
                          </div>
                        </div>

                        {/* Balance */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-head)', fontSize: '13px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fg)' }}>
                            {acc.balance.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--fg-4)' }}>{acc.currency}</div>
                        </div>

                        {isActive && <Check size={13} style={{ color: 'var(--violet)', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', maxWidth:'720px', width:'100%', margin:'0 auto', padding:'0 20px', paddingBottom:'80px' }}>
        {panel==='chat'
          ? <ChatInterface fullscreen />
          : <div style={{ flex:1, overflowY:'auto', paddingTop:'20px' }}><SavedContacts /></div>
        }
      </div>
    </div>
  );
}
