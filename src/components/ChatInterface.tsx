'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Sparkles, RotateCcw, Trash2, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBankAccounts } from '@/lib/bank-accounts';
import { useFinances } from '@/lib/finances';
import { createClient } from '@/lib/supabase';

interface Message { id:string; role:'user'|'assistant'; content:string; }
interface Props { compact?: boolean; fullscreen?: boolean; onSend?: () => void; onReceive?: () => void; onPayBill?: () => void; }

const SUGGESTIONS = [
  { label:'Check balance',       icon:'💰' },
  { label:'Spending analysis',   icon:'📊' },
  { label:'Show transactions',   icon:'📋' },
  { label:'Send money',          icon:'↑', action:'send' },
  { label:'Pay a bill',          icon:'⚡', action:'paybill' },
];

export default function ChatInterface({ compact, fullscreen, onSend, onReceive, onPayBill }: Props) {
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { accounts } = useBankAccounts();
  const { transactions, jars } = useFinances();
  const supabase = createClient();

  // ── 1. Fetch History from Supabase on Mount ──
  useEffect(() => {
    const fetchHistory = async () => {
      if (!supabase) { setFetchingHistory(false); return; }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setFetchingHistory(false); return; }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50); // Fetch last 50 messages for memory

      if (!error && data) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content
        })));
      }
      setFetchingHistory(false);
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const clearHistory = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !window.confirm('Wipe chat memory? This will delete synced history on all devices.')) return;

    setLoading(true);
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', session.user.id);

    if (!error) setMessages([]);
    setLoading(false);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading || !supabase) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const isDemo = !session; // Handle demo mode gracefully

    // 1. UI Update
    const um: Message = { id:`u${Date.now()}`, role:'user', content:text };
    setMessages(prev => [...prev, um]);
    setLoading(true);
    setInput('');

    // 2. Save User Message to Supabase (Sync)
    if (!isDemo) {
      await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        role: 'user',
        content: text
      });
    }

    const aid = `a${Date.now()}`;
    setMessages(p => [...p, { id:aid, role:'assistant', content:'' }]);

    try {
      const r = await fetch('/api/chat', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          // Feed existing history for memory
          messages: [...messages, um].map(m=>({ role:m.role, content:m.content })),
          accounts: accounts.map(a => ({
            bankName: a.bankName,
            balance: a.balance,
            currency: a.currency,
            accountType: a.accountType,
            lastFour: a.lastFour,
          })),
          transactions: transactions,
          jars: jars,
        }),
      });
      
      if (!r.ok) throw new Error();
      const reader = r.body?.getReader();
      const dec = new TextDecoder();
      let full = '';
      
      if (reader) { 
        while(true) { 
          const {done,value}=await reader.read(); 
          if(done) break; 
          full+=dec.decode(value,{stream:true}); 
          setMessages(p=>p.map(m=>m.id===aid?{...m,content:full}:m)); 
        } 
      }

      // 3. Save Assistant Message to Supabase (Sync)
      if (!isDemo && full) {
        await supabase.from('chat_messages').insert({
          user_id: session.user.id,
          role: 'assistant',
          content: full
        });
      }
    } catch {
      setMessages(p=>p.map(m=>m.id===aid?{...m,content:'Something went wrong. Please try again.'}:m));
    } finally { 
      setLoading(false); 
      inputRef.current?.focus(); 
    }
  };

  const h = (e: React.FormEvent) => { e.preventDefault(); send(input); };
  const height = fullscreen ? 'calc(100vh - var(--header-h) - 100px)' : '100%';

  return (
    <div style={{ height, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      
      {/* Header for history control */}
      {!compact && messages.length > 0 && (
        <div style={{ padding:'8px 24px', display:'flex', justifyContent:'flex-end', borderBottom:'var(--card-border)' }}>
          <button onClick={clearHistory} style={{
            display:'flex', alignItems:'center', gap:'6px',
            fontSize:'11px', fontWeight:700, color:'var(--fg-4)',
            background:'none', border:'none', cursor:'pointer',
            transition:'color var(--t)'
          }} onMouseEnter={e=>e.currentTarget.style.color='var(--rose)'} onMouseLeave={e=>e.currentTarget.style.color='var(--fg-4)'}>
            <Trash2 size={12}/> WIPE MEMORY
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding: compact?'14px':'24px 28px', display:'flex', flexDirection:'column', gap: compact?'14px':'18px' }}>

        {/* Loading Spinner for History */}
        {fetchingHistory && (
          <div style={{ display:'flex', justifyContent:'center', padding:'20px' }}>
            <div className="dot-pulse" />
          </div>
        )}

        {/* Empty state */}
        {!fetchingHistory && messages.length===0 && (
          <div className="fade-in" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'18px', textAlign:'center', padding:'20px 10px' }}>
            <div style={{ width: compact?'42px':'54px', height: compact?'42px':'54px', borderRadius:'15px', background:'var(--bg-3)', border:'var(--card-border)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-md)' }}>
              <Sparkles size={compact?18:24} color="var(--violet)"/>
            </div>
            {!compact && (
              <div>
                <p style={{ fontFamily:'var(--font-head)', fontSize:'17px', fontWeight:800, letterSpacing:'-0.03em', color:'var(--fg)', marginBottom:'6px' }}>ChatBank AI</p>
                <p style={{ fontSize:'12.5px', color:'var(--fg-3)', maxWidth:'280px', lineHeight:1.65 }}>Your unified finance assistant with device sync memory. Ask anything.</p>
              </div>
            )}
            <div style={{ display:'flex', flexDirection: compact?'column':'row', flexWrap:'wrap', gap:'7px', justifyContent:'center', width:'100%', maxWidth: compact?'100%':'400px' }}>
              {(compact?SUGGESTIONS.slice(0,3):SUGGESTIONS).map(s=>(
                <button key={s.label} onClick={() => {
                  if ((s as any).action === 'send' && onSend) { onSend(); return; }
                  if ((s as any).action === 'paybill' && onPayBill) { onPayBill(); return; }
                  send(s.label);
                }} className="chip" style={{ fontSize: compact?'11px':'12px' }}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bubbles */}
        {messages.map(m=>(
          <div key={m.id} className="fade-in" style={{ display:'flex', flexDirection:'column', alignItems: m.role==='user'?'flex-end':'flex-start', gap:'4px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'10.5px', color:'var(--fg-4)', padding:'0 4px' }}>
              {m.role==='user'?<User size={10}/>:<Bot size={10}/>}
              {m.role==='user'?'You':'ChatBank AI'}
            </div>
            <div style={{
              maxWidth: compact?'90%':'72%',
              padding: compact?'10px 13px':'12px 16px',
              borderRadius: m.role==='user'?'16px 4px 16px 16px':'4px 16px 16px 16px',
              background: m.role==='user' ? 'var(--user-bubble-bg)' : 'var(--ai-bubble-bg)',
              border: m.role==='user' ? `1px solid var(--user-bubble-bdr)` : `1px solid var(--ai-bubble-bdr)`,
              boxShadow: 'var(--sh-xs)',
              fontSize: compact?'13px':'13.5px',
              lineHeight:1.65,
            }}>
              {m.role==='assistant' && !m.content
                ? <div style={{ display:'flex', gap:'5px', padding:'2px 0' }}>{[0,1,2].map(i=><span key={i} className="dot-pulse" style={{ animationDelay:`${i*0.2}s` }}/>)}</div>
                : <div className="prose" style={{ fontSize: compact?'13px':'13.5px', color: m.role==='user'?'var(--user-bubble-text)':'var(--fg-2)' }}><ReactMarkdown>{m.content}</ReactMarkdown></div>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={h} style={{
        padding: compact?'10px 12px':'14px 20px',
        borderTop:'var(--card-border)',
        display:'flex', gap:'7px', alignItems:'center',
        background:'var(--bg-1)', flexShrink:0,
        transition:'background 0.3s',
      }}>
        {messages.length>0 && compact && (
          <button type="button" onClick={clearHistory} style={{
            width:'32px', height:'32px', borderRadius:'var(--r-sm)',
            border:'none', background:'transparent',
            color:'var(--fg-4)', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'color var(--t)', flexShrink:0,
          }}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--fg-2)')}
            onMouseLeave={e=>(e.currentTarget.style.color='var(--fg-4)')}
          ><Trash2 size={12}/></button>
        )}
        <input
          ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          placeholder={compact?'Ask anything…':'Ask about your finances…'}
          disabled={loading || fetchingHistory}
          className="metal-input"
          style={{ padding: compact?'9px 13px':'11px 14px', fontSize: compact?'13px':'13.5px' }}
          onFocus={e=>(e.target.style.borderColor='rgba(123,104,238,0.4)')}
          onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.07)')}
        />
        {!compact && (
          <button type="button" style={{ width:'34px', height:'34px', borderRadius:'var(--r-sm)', border:'var(--metal-border)', background:'var(--bg-2)', color:'var(--fg-4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, boxShadow:'var(--sh-xs)' }}>
            <Mic size={13}/>
          </button>
        )}
        <button type="submit" disabled={!input.trim()||loading||fetchingHistory}
          style={{ padding: compact?'9px 12px':'9px 16px', borderRadius:'var(--r-sm)', border:'none', flexShrink:0,
            background: input.trim()&&!loading ? 'linear-gradient(135deg,#8b7cf8,#6d5ce7)' : 'var(--bg-3)',
            color: input.trim()&&!loading ? '#fff' : 'var(--fg-4)',
            fontWeight:700, fontSize:'13px', cursor: input.trim()&&!loading?'pointer':'default',
            boxShadow: input.trim()&&!loading ? '0 2px 10px rgba(109,92,231,0.3)' : 'none',
            transition:'all var(--t)', display:'flex', alignItems:'center', gap:'5px',
          }}
        >
          <Send size={13}/>{!compact&&<span>Send</span>}
        </button>
      </form>
    </div>
  );
}
