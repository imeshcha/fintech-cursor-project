'use client';
import React, { useState } from 'react';
import { useBankAccounts } from '@/lib/bank-accounts';
import { useFinances } from '@/lib/finances';
import { ArrowUpRight, ArrowDownLeft, Plus, TrendingUp, TrendingDown, Grid3x3, History, Wallet, Users, CreditCard, Trash2, ChevronDown, Check } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import ChatInterface from './ChatInterface';
import SavedContacts from './SavedContacts';
import AddAccountModal from './AddAccountModal';
import SendMoneyModal from './SendMoneyModal';
import ReceiveMoneyModal from './ReceiveMoneyModal';
import PayBillModal from './PayBillModal';

const CAT: Record<string, { color:string; bg:string }> = {
  Food:          { color:'#fbbf24', bg:'rgba(251,191,36,0.08)'  },
  Transport:     { color:'#2dd4bf', bg:'rgba(45,212,191,0.08)'  },
  Shopping:      { color:'#a99bff', bg:'rgba(169,155,255,0.08)' },
  Entertainment: { color:'#f87171', bg:'rgba(248,113,113,0.08)' },
  Bills:         { color:'#94a3b8', bg:'rgba(148,163,184,0.08)' },
  Income:        { color:'#34d399', bg:'rgba(52,211,153,0.08)'  },
  Others:        { color:'#6b7280', bg:'rgba(107,114,128,0.08)' },
};

const chart = [
  { m:'Jan', v:48000 }, { m:'Feb', v:52000 }, { m:'Mar', v:38000 },
  { m:'Apr', v:61000 }, { m:'May', v:22700 },
];

const TABS = [
  { id:'overview',      label:'Overview',      icon:Grid3x3  },
  { id:'transactions',  label:'Transactions',  icon:History  },
  { id:'jars',          label:'Jars',          icon:Wallet   },
  { id:'contacts',      label:'Contacts',      icon:Users    },
] as const;

export default function DashboardMode({ user }: { user: any }) {
  const [tab, setTab] = useState<'overview'|'transactions'|'jars'|'contacts'>('overview');
  const { accounts, totalBalance, removeAccount, activeAccountId, activeAccount, setActiveAccountId } = useBankAccounts();
  const { transactions, jars, loading: financesLoading } = useFinances();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showPayBill, setShowPayBill] = useState(false);
  const [sidebarPayOpen, setSidebarPayOpen] = useState(false);

  const spent  = transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount, 0);
  const income = transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount, 0);

  return (
    <div style={{ display:'flex', height:'calc(100vh - var(--header-h))', overflow:'hidden' }}>

      {/* ── Scrollable left ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', paddingBottom:'100px', display:'flex', flexDirection:'column', gap:'20px' }}>

        {/* ── Balance Hero Card ── */}
        <div className="card fade-in" style={{ padding:'28px 32px', position:'relative' }}>
          {/* Corner reflections — in their own clipped layer so they don't hide content */}
          <div style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'inherit', pointerEvents:'none', zIndex:0 }}>
            <div style={{ position:'absolute', top:0, right:0, width:'240px', height:'180px', background:'radial-gradient(ellipse at top right, var(--violet-3) 0%, transparent 70%)' }}/>
            <div style={{ position:'absolute', bottom:0, left:'20%', width:'180px', height:'120px', background:'radial-gradient(ellipse at bottom, var(--teal-2) 0%, transparent 70%)' }}/>
          </div>

          <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'20px', flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <CreditCard size={13} style={{ color:'var(--fg-4)' }}/>
                <span style={{ fontSize:'11px', color:'var(--fg-3)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  {accounts.length} Linked Account{accounts.length !== 1 ? 's' : ''} · Total Balance
                </span>
              </div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:'46px', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, marginBottom:'10px' }} className="text-silver">
                {totalBalance.toLocaleString()}&nbsp;<span style={{ fontSize:'22px', fontWeight:600, opacity:0.5 }}>LKR</span>
              </div>
              <div style={{ fontSize:'11px', color:'var(--fg-4)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Combined available balance</div>
            </div>

            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              {[
                { label:'Income', amt:income, color:'var(--green)', bg:'var(--green-2)', border:'rgba(52,211,153,0.2)', Icon:TrendingUp, sign:'+' },
                { label:'Spent',  amt:spent,  color:'var(--rose)',  bg:'var(--rose-2)',  border:'rgba(248,113,113,0.2)', Icon:TrendingDown,sign:'-' },
              ].map(s => (
                <div key={s.label} style={{ padding:'14px 18px', borderRadius:'12px', background:s.bg, border:`1px solid ${s.border}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px' }}>
                    <s.Icon size={11} color={s.color}/>
                    <span style={{ fontSize:'10px', color:s.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:'18px', fontWeight:900, letterSpacing:'-0.04em', color:s.color }}>
                    {s.sign}LKR {s.amt.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metallic separator */}
          <div className="glow-line" style={{ margin:'22px 0 16px', position:'relative', zIndex:1 }}/>

          {/* ── Connected Accounts (always visible) ── */}
          <div style={{ marginBottom:'4px', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Connected Accounts
              </span>
              <button
                onClick={() => setShowAddAccount(true)}
                style={{
                  display:'flex', alignItems:'center', gap:'5px',
                  padding:'4px 10px', borderRadius:'var(--r-pill)',
                  border:'1px dashed var(--border-2)',
                  background:'transparent', cursor:'pointer',
                  color:'var(--fg-4)', fontSize:'11px', fontWeight:600,
                  transition:'all var(--t)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(123,104,238,0.4)'; e.currentTarget.style.color = 'var(--violet)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--fg-4)'; }}
              >
                <Plus size={11}/>Add Account
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {accounts.map(acc => {
                const pct = totalBalance > 0 ? Math.round((acc.balance / totalBalance) * 100) : 0;
                return (
                  <div
                    key={acc.id}
                    style={{
                      display:'flex', alignItems:'center', gap:'12px',
                      padding:'12px 14px',
                      borderRadius:'var(--r-md)',
                      background:'var(--bg-3)',
                      border:'1px solid var(--border-2)',
                      transition:'all var(--t)',
                    }}
                  >
                    {/* Bank icon */}
                    <div style={{
                      width:'38px', height:'38px', borderRadius:'10px',
                      background:`linear-gradient(135deg, ${acc.color}20, ${acc.color}08)`,
                      border:`1px solid ${acc.color}30`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'17px', flexShrink:0,
                    }}>
                      {acc.logo}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'var(--fg)' }}>{acc.bankName}</span>
                        <span className="badge badge-metal" style={{ fontSize:'9px' }}>••{acc.lastFour}</span>
                        <span style={{
                          fontSize:'8px', textTransform:'capitalize', fontWeight:600,
                          color:'var(--fg-4)', background:'var(--bg-3)',
                          padding:'1px 5px', borderRadius:'var(--r-pill)', border:'var(--card-border)',
                        }}>
                          {acc.accountType}
                        </span>
                      </div>
                      <div className="progress" style={{ height:'3px' }}>
                        <div className="progress-fill" style={{ width:`${pct}%`, background:acc.color, boxShadow:`0 0 6px ${acc.color}40` }}/>
                      </div>
                    </div>

                    {/* Balance */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{
                        fontFamily:'var(--font-head)', fontSize:'17px', fontWeight:900,
                        letterSpacing:'-0.04em', color:acc.color,
                      }}>
                        {acc.balance.toLocaleString()}
                      </div>
                      <div style={{ fontSize:'9.5px', color:'var(--fg-4)' }}>{pct}% · {acc.currency}</div>
                    </div>

                    {/* Remove button */}
                    {accounts.length > 1 && (
                      <button
                        onClick={() => removeAccount(acc.id)}
                        title="Remove account"
                        style={{
                          width:'26px', height:'26px', borderRadius:'7px',
                          border:'none', background:'transparent',
                          color:'var(--fg-4)', display:'flex', alignItems:'center', justifyContent:'center',
                          cursor:'pointer', transition:'color var(--t)', flexShrink:0,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--rose)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-4)')}
                      >
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metallic separator */}
          <div className="glow-line" style={{ margin:'16px 0 14px', position:'relative', zIndex:1 }}/>

          {/* Quick actions */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            {[
              { l:'Send',     s:'↑', active:true,  action: () => setShowSend(true) },
              { l:'Receive',  s:'↓', active:false, action: () => setShowReceive(true) },
              { l:'Pay Bill', s:'⚡',active:false, action: () => setShowPayBill(true) },
            ].map(a => (
              <button key={a.l}
                onClick={a.action}
                style={{
                  padding:'7px 16px', borderRadius:'var(--r-pill)', border:'var(--card-border)', cursor:'pointer',
                  background: a.active ? 'linear-gradient(135deg,#8b7cf8,#6d5ce7)' : 'var(--bg-3)',
                  color: a.active ? '#fff' : 'var(--fg-2)',
                  fontSize:'12.5px', fontWeight:600, display:'flex', alignItems:'center', gap:'6px',
                  boxShadow: a.active ? '0 2px 12px rgba(109,92,231,0.3)' : 'var(--sh-xs)',
                  transition:'all var(--t)',
                }}
                onMouseEnter={e=>{ if (!a.active) { e.currentTarget.style.background='var(--bg-4)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                onMouseLeave={e=>{ if (!a.active) { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.transform='none'; }}}
              >
                <span>{a.s}</span>{a.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tab-bar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              <t.icon size={12}/>{t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab==='overview' && (
          <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="card" style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                <div>
                  <h3 style={{ fontSize:'14px', fontWeight:700, color:'var(--fg)' }}>Spending Trend</h3>
                  <p style={{ fontSize:'11px', color:'var(--fg-3)', marginTop:'2px' }}>Jan – May 2026</p>
                </div>
                <span className="badge badge-metal">2026</span>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={chart} margin={{ left:-24, right:0 }}>
                  <defs>
                    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7b68ee" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#7b68ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fill:'var(--fg-3)', fontSize:10.5 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:'var(--bg-2)', border:'var(--metal-border)', borderRadius:'10px', fontSize:'12px', boxShadow:'var(--sh-md)', color:'var(--fg)' }} formatter={(v:any)=>[`LKR ${v.toLocaleString()}`,'Spend']}/>
                  <Area type="monotone" dataKey="v" stroke="#7b68ee" strokeWidth={2} fill="url(#vg)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding:'24px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, marginBottom:'16px' }}>Spending by Category</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'11px' }}>
                {Object.entries(
                  transactions.filter(t=>t.type==='debit').reduce((acc:any,t)=>{ acc[t.category]=(acc[t.category]||0)+t.amount; return acc; },{})
                ).sort(([,a],[,b])=>(b as number)-(a as number)).map(([cat,amt])=>{
                  const pct = Math.round(((amt as number)/spent)*100);
                  const c = CAT[cat] || { color:'#6b7280', bg:'rgba(107,114,128,0.08)' };
                  return (
                    <div key={cat}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:c.color, flexShrink:0 }}/>
                          <span style={{ fontSize:'12.5px', color:'var(--fg-2)', fontWeight:500 }}>{cat}</span>
                        </div>
                        <span style={{ fontSize:'12.5px', fontWeight:700, color:'var(--fg)' }}>
                          LKR {(amt as number).toLocaleString()} <span style={{ color:'var(--fg-3)', fontWeight:400 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width:`${pct}%`, background:c.color, boxShadow:`0 0 6px ${c.color}60` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab==='transactions' && (
          <div className="card fade-in" style={{ overflow:'hidden' }}>
            <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700 }}>Transaction History</h3>
            </div>
            {transactions.map((t,i)=>(
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 22px', borderBottom: i<transactions.length-1?'1px solid rgba(255,255,255,0.04)':'none', transition:'background var(--t)' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-2)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
              >
                <div style={{ width:'38px', height:'38px', borderRadius:'11px', flexShrink:0, background: t.type==='credit' ? 'var(--green-2)' : (CAT[t.category]?.bg||'var(--bg-3)'), border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {t.type==='credit'
                    ? <ArrowDownLeft size={16} color="var(--green)"/>
                    : <ArrowUpRight  size={16} color={CAT[t.category]?.color||'var(--fg-3)'}/>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'var(--fg)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.description}</div>
                  <div style={{ fontSize:'11px', color:'var(--fg-4)', marginTop:'2px' }}>{t.date} · {t.category}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'13.5px', fontWeight:800, color: t.type==='credit'?'var(--green)':'var(--fg)' }}>
                    {t.type==='credit'?'+':'-'}LKR {t.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize:'10.5px', color:'var(--fg-4)', marginTop:'2px' }}>{t.bank}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Jars ── */}
        {tab==='jars' && (
          <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'14px' }}>
            {jars.map(j=>{
              const pct = Math.round((j.current/j.target)*100);
              return (
                <div key={j.id} className="card" style={{ padding:'22px', cursor:'pointer', transition:'all var(--t)' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='none'; }}
                >
                  <div style={{ fontSize:'28px', marginBottom:'14px' }}>{j.emoji}</div>
                  <div style={{ fontSize:'13.5px', fontWeight:700, color:'var(--fg)', marginBottom:'4px' }}>{j.name}</div>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:'22px', fontWeight:900, letterSpacing:'-0.04em', color:j.color, marginBottom:'2px', textShadow:`0 0 12px ${j.color}40` }}>
                    LKR {j.current.toLocaleString()}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--fg-4)', marginBottom:'14px' }}>of LKR {j.target.toLocaleString()}</div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:j.color, boxShadow:`0 0 8px ${j.color}50` }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px', fontSize:'11px' }}>
                    <span style={{ color:'var(--fg-4)' }}>{pct}% saved</span>
                    <span style={{ fontWeight:700, color:'var(--fg-3)' }}>LKR {(j.target-j.current).toLocaleString()} left</span>
                  </div>
                </div>
              );
            })}
            <button className="card" style={{ padding:'22px', minHeight:'180px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', color:'var(--fg-4)', background:'transparent', borderStyle:'dashed', cursor:'pointer', transition:'all var(--t)' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(123,104,238,0.4)'; e.currentTarget.style.color='var(--violet)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='var(--fg-4)'; }}
            >
              <Plus size={22}/><span style={{ fontSize:'13px', fontWeight:600 }}>New Jar</span>
            </button>
          </div>
        )}

        {tab==='contacts' && <div className="fade-in"><SavedContacts/></div>}
      </div>

      {/* ── Chat Sidebar ── */}
      <div className="hide-mobile" style={{ width:'340px', flexShrink:0, borderLeft:'var(--card-border)', display:'flex', flexDirection:'column', background:'var(--sidebar-bg)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', transition:'background 0.3s' }}>

        {/* Sidebar header */}
        <div style={{ padding:'12px 14px', borderBottom:'var(--card-border)', display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)', flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12.5px', fontWeight:700, color:'var(--fg)' }}>ChatBank AI</div>
              <div style={{ fontSize:'10.5px', color:'var(--fg-4)' }}>Ask about any account…</div>
            </div>
          </div>

          {/* Payment Method selector in sidebar */}
          {activeAccount && (
            <div style={{ position:'relative' }}>
              <button
                onClick={() => setSidebarPayOpen(v => !v)}
                className="bank-selector-btn"
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'7px',
                  padding:'6px 10px', borderRadius:'var(--r-sm)',
                  border:'var(--card-border)', background: sidebarPayOpen ? 'var(--bg-3)' : 'var(--bg-2)',
                  cursor:'pointer', transition:'all var(--t)', boxShadow:'var(--sh-xs)',
                }}
              >
                <Wallet size={11} style={{ color:'var(--fg-4)', flexShrink:0 }}/>
                <span style={{ fontSize:'10px', fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Pay via</span>
                <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:activeAccount.color, boxShadow:`0 0 5px ${activeAccount.color}60`, flexShrink:0 }}/>
                <span style={{ fontSize:'11.5px', fontWeight:600, color:'var(--fg-2)', flex:1, textAlign:'left', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {activeAccount.bankName}
                </span>
                <span style={{ fontSize:'10px', color:'var(--fg-4)', fontFamily:'monospace' }}>••{activeAccount.lastFour}</span>
                <ChevronDown size={10} style={{ color:'var(--fg-4)', transform: sidebarPayOpen ? 'rotate(180deg)' : 'none', transition:'transform var(--t)', flexShrink:0 }}/>
              </button>

              {sidebarPayOpen && (
                <>
                  <div style={{ position:'fixed', inset:0, zIndex:499 }} onClick={() => setSidebarPayOpen(false)}/>
                  <div className="card" style={{
                    position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                    padding:'4px', zIndex:500, borderRadius:'var(--r-md)', maxHeight:'260px', overflowY:'auto',
                  }}>
                    <div style={{ padding:'7px 10px 5px', borderBottom:'var(--card-border)', marginBottom:'3px' }}>
                      <span style={{ fontSize:'9.5px', fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Select Payment Method</span>
                    </div>
                    {accounts.map(acc => {
                      const isActive = acc.id === activeAccountId;
                      return (
                        <button key={acc.id}
                          onClick={() => { setActiveAccountId(acc.id); setSidebarPayOpen(false); }}
                          style={{
                            width:'100%', display:'flex', alignItems:'center', gap:'9px', padding:'8px 10px',
                            borderRadius:'var(--r-sm)', border:'none',
                            background: isActive ? 'var(--bg-3)' : 'transparent',
                            cursor:'pointer', transition:'all var(--t)', textAlign:'left',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-3)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:`linear-gradient(135deg,${acc.color}20,${acc.color}08)`, border:`1px solid ${acc.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0 }}>{acc.logo}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'var(--fg)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{acc.bankName}</div>
                            <div style={{ fontSize:'9.5px', color:'var(--fg-4)', fontFamily:'monospace' }}>••••{acc.lastFour} · {acc.accountType}</div>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontFamily:'var(--font-head)', fontSize:'12px', fontWeight:800, letterSpacing:'-0.03em', color:'var(--fg)' }}>{acc.balance.toLocaleString()}</div>
                            <div style={{ fontSize:'9px', color:'var(--fg-4)' }}>{acc.currency}</div>
                          </div>
                          {isActive && <Check size={11} style={{ color:'var(--violet)', flexShrink:0 }}/>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ flex:1, overflow:'hidden' }}>
          <ChatInterface compact onSend={() => setShowSend(true)} onReceive={() => setShowReceive(true)} onPayBill={() => setShowPayBill(true)}/>
        </div>
      </div>

      {/* Modals */}
      <AddAccountModal isOpen={showAddAccount} onClose={() => setShowAddAccount(false)} />
      <SendMoneyModal isOpen={showSend} onClose={() => setShowSend(false)} />
      <ReceiveMoneyModal isOpen={showReceive} onClose={() => setShowReceive(false)} />
      <PayBillModal isOpen={showPayBill} onClose={() => setShowPayBill(false)} />
    </div>
  );
}
