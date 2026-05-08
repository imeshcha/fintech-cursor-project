'use client';
import React, { useState } from 'react';
import { useFinances } from '@/lib/finances';
import { Plus, X, Search, Copy, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function SavedContacts() {
  const { contacts, addContact, loading } = useFinances();
  const [showAdd, setShowAdd]   = useState(false);
  const [search, setSearch]     = useState('');
  const [copied, setCopied]     = useState<string|null>(null);
  const [form, setForm]         = useState({ name:'', accountNumber:'', bank:'' });
  const [errors, setErrors]     = useState<Record<string,string>>({});

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber.includes(search)
  );

  const copy = (id:string, n:string) => {
    navigator.clipboard.writeText(n).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null), 2000);
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.accountNumber.trim()) e.accountNumber = 'Account number required';
    else if (!/^\d{8,16}$/.test(form.accountNumber)) e.accountNumber = 'Must be 8–16 digits';
    if (!form.bank.trim()) e.bank = 'Bank name required';
    setErrors(e); return !Object.keys(e).length;
  };

  const add = async () => {
    if (!validate()) return;
    await addContact({ 
      name: form.name.trim(), 
      accountNumber: form.accountNumber.trim(), 
      bank: form.bank.trim(), 
      avatar: form.name.trim()[0].toUpperCase(),
      color: '#7b68ee'
    });
    setForm({ name:'', accountNumber:'', bank:'' }); setErrors({}); setShowAdd(false);
  };

  if (loading) return (
    <div style={{ padding:'40px', textAlign:'center' }}>
      <div className="dot-pulse" style={{ margin:'0 auto' }} />
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
      {/* Top row */}
      <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:1, position:'relative', minWidth:'180px' }}>
          <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--fg-4)', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
            className="metal-input" style={{ padding:'9px 14px 9px 36px', fontSize:'13px' }}/>
        </div>
        <button className="btn btn-metal" onClick={()=>setShowAdd(true)} style={{ gap:'6px' }}>
          <Plus size={13}/>Add Contact
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card slide-up" style={{ padding:'22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:700 }}>New Contact</h3>
            <button onClick={()=>{setShowAdd(false);setErrors({});}} style={{ width:'28px', height:'28px', borderRadius:'6px', border:'none', background:'var(--bg-3)', color:'var(--fg-3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={13}/></button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            {[
              { k:'name',          label:'Full Name',       ph:'e.g. Kasun Perera' },
              { k:'accountNumber', label:'Account Number',  ph:'8–16 digits' },
              { k:'bank',          label:'Bank',            ph:'NTB, BOC, HNB…' },
            ].map(f=>(
              <div key={f.k}>
                <label style={{ display:'block', fontSize:'10.5px', fontWeight:700, color:'var(--fg-4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' }}>{f.label}</label>
                <input
                  value={form[f.k as keyof typeof form]}
                  onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                  placeholder={f.ph}
                  className="metal-input"
                  style={{ padding:'10px 14px', fontSize:'13px', borderColor: errors[f.k]?'rgba(248,113,113,0.4)':'rgba(255,255,255,0.07)' }}
                />
                {errors[f.k] && <p style={{ fontSize:'11px', color:'var(--rose)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle size={10}/>{errors[f.k]}</p>}
              </div>
            ))}
            <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
              <button className="btn btn-metal" style={{ flex:1 }} onClick={()=>{setShowAdd(false);setErrors({});}}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={add}>Save Contact</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length===0 ? (
        <div className="card" style={{ padding:'48px', textAlign:'center' }}>
          <Search size={28} style={{ color:'var(--fg-4)', marginBottom:'12px' }}/>
          <p style={{ fontSize:'13.5px', color:'var(--fg-3)', fontWeight:500 }}>{search?'No contacts match your search':'No saved contacts yet'}</p>
          {!search && <button className="btn btn-metal" style={{ marginTop:'16px' }} onClick={()=>setShowAdd(true)}>Add your first contact</button>}
        </div>
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          {filtered.map((c,i)=>(
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'13px 20px', borderBottom: i<filtered.length-1?'1px solid rgba(255,255,255,0.04)':'none', transition:'background var(--t)' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
            >
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', flexShrink:0, background:`linear-gradient(135deg, ${c.color}20, ${c.color}08)`, border:`1px solid ${c.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:800, color:c.color }}>
                {c.avatar}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13.5px', fontWeight:700, color:'var(--fg)', marginBottom:'3px' }}>{c.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'7px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'11.5px', color:'var(--fg-4)', fontFamily:'monospace', letterSpacing:'0.04em' }}>{c.accountNumber.replace(/(.{4})/g,'$1 ').trim()}</span>
                  <span className="badge badge-metal" style={{ fontSize:'9.5px' }}>{c.bank}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                {[
                  { title:'Copy', action:()=>copy(c.id,c.accountNumber), icon: copied===c.id?<CheckCircle size={13}/>:<Copy size={13}/>, color: copied===c.id?'var(--green)':'var(--fg-4)' },
                  { title:'Send', action:()=>{},                          icon:<Send size={13}/>,                                         color:'var(--violet)' },
                ].map((a,idx)=>(
                  <button key={idx} title={a.title} onClick={a.action}
                    style={{ width:'32px', height:'32px', borderRadius:'8px', border:'var(--metal-border)', background:'var(--bg-2)', color:a.color, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all var(--t)', boxShadow:'var(--sh-xs)' }}>
                    {a.icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
