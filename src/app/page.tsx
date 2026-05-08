'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import AuthScreen from '@/components/AuthScreen';
import DashboardMode from '@/components/DashboardMode';
import ChatMode from '@/components/ChatMode';
import { LayoutDashboard, MessageSquare, Bell, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Home() {
  const [appMode, setAppMode] = useState<'dashboard'|'chat'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { theme, toggle } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const p = new URLSearchParams(window.location.search);
    const isDemo = p.get('demo') === 'true';
    if (isDemo) {
      setUser({ id:'demo', email:'demo@chatbank.lk', user_metadata:{ full_name:'Demo User' } });
      setLoading(false);
      return; // Skip auth listener in demo mode
    }
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    run();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null); setShowMenu(false);
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:'16px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'var(--logo-bg)', border:'var(--card-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'var(--sh-md)' }}>💳</div>
      <div style={{ display:'flex', gap:'6px' }}>{[0,1,2].map(i=><span key={i} className="dot-pulse" style={{ animationDelay:`${i*0.2}s` }}/>)}</div>
    </div>
  );

  if (!user) return <AuthScreen />;

  const name    = user.user_metadata?.full_name?.split(' ')[0] || 'User';
  const initials= (user.user_metadata?.full_name||'U').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', position:'relative', zIndex:1, transition:'background 0.3s' }}>

      {/* ── Header ── */}
      <header style={{
        height:'var(--header-h)', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 28px',
        background:'var(--header-bg)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderBottom:'var(--card-border)',
        position:'sticky', top:0, zIndex:100, flexShrink:0,
        boxShadow:'0 1px 0 rgba(255,255,255,0.04)',
        transition:'background 0.3s',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'var(--logo-bg)', border:'var(--card-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'var(--sh-sm)' }}>💳</div>
          <span style={{ fontFamily:'var(--font-head)', fontSize:'16px', fontWeight:800, letterSpacing:'-0.04em' }} className="text-silver">ChatBank</span>
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle hide-mobile">
          <button id="btn-dashboard" className={`mode-btn ${appMode==='dashboard'?'active':''}`} onClick={()=>setAppMode('dashboard')}>
            <LayoutDashboard size={13}/> Dashboard
          </button>
          <button id="btn-chat" className={`mode-btn ${appMode==='chat'?'active':''}`} onClick={()=>setAppMode('chat')}>
            <MessageSquare size={13}/> AI Chat
          </button>
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {/* Notification bell */}
          <button className="theme-toggle" style={{ position:'relative' }}>
            <Bell size={14}/>
            <span style={{ position:'absolute', top:'8px', right:'8px', width:'5px', height:'5px', borderRadius:'50%', background:'var(--violet)' }}/>
          </button>

          {/* ── THEME TOGGLE ── */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle"
            onClick={toggle}
            title={`Switch to ${theme==='dark'?'light':'dark'} mode`}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {/* Animated sun/moon swap */}
            <span style={{ position:'absolute', transition:'all 0.3s var(--ease)', transform: theme==='dark'?'translateY(0)':'translateY(-20px)', opacity: theme==='dark'?1:0 }}>
              <Sun size={14}/>
            </span>
            <span style={{ position:'absolute', transition:'all 0.3s var(--ease)', transform: theme==='light'?'translateY(0)':'translateY(20px)', opacity: theme==='light'?1:0 }}>
              <Moon size={14}/>
            </span>
          </button>

          {/* User pill */}
          <div style={{ position:'relative' }}>
            <button onClick={()=>setShowMenu(v=>!v)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'4px 10px 4px 4px', borderRadius:'var(--r-pill)', border:'var(--card-border)', background:'var(--bg-2)', boxShadow:'var(--sh-xs)', cursor:'pointer', transition:'all var(--t)' }}>
              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'var(--logo-bg)', border:'var(--card-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:800, color:'var(--logo-color)', flexShrink:0 }}>
                {user.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
                  : initials}
              </div>
              <span style={{ fontSize:'12.5px', fontWeight:600, color:'var(--fg-2)', letterSpacing:'-0.01em' }} className="hide-mobile">{name}</span>
              <ChevronDown size={11} style={{ color:'var(--fg-4)' }} className="hide-mobile"/>
            </button>

            {showMenu && (
              <div className="card fade-in" style={{ position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:'200px', padding:'6px', zIndex:300, borderRadius:'var(--r-lg)' }}>
                <div style={{ padding:'10px 12px 12px', borderBottom:'var(--card-border)', marginBottom:'4px' }}>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'var(--fg)' }}>{user.user_metadata?.full_name||'Demo User'}</div>
                  <div style={{ fontSize:'11px', color:'var(--fg-3)', marginTop:'2px' }}>{user.email}</div>
                </div>
                <button onClick={logout}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'var(--r-sm)', border:'none', background:'transparent', color:'var(--rose)', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'background var(--t)' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--rose-2)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                >
                  <LogOut size={13}/> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ flex:1, overflow:'hidden' }}>
        {appMode==='dashboard' ? <DashboardMode user={user}/> : <ChatMode user={user}/>}
      </div>

      {/* ── Mobile Nav ── */}
      <nav className="mobile-nav">
        <button className={`mobile-nav-btn ${appMode==='dashboard'?'active':''}`} onClick={()=>setAppMode('dashboard')}><LayoutDashboard size={20}/> Dashboard</button>
        <button
          className="mobile-nav-btn"
          onClick={toggle}
          style={{ color:'var(--fg-3)' }}
        >
          {theme==='dark' ? <Sun size={20}/> : <Moon size={20}/>}
          {theme==='dark' ? 'Light' : 'Dark'}
        </button>
        <button className={`mobile-nav-btn ${appMode==='chat'?'active':''}`} onClick={()=>setAppMode('chat')}><MessageSquare size={20}/> AI Chat</button>
      </nav>
    </div>
  );
}
