'use client';

import React from 'react';
import { createClient } from '@/lib/supabase';
import { Shield, Zap, Sparkles } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function AuthScreen() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    // In a real app, this would trigger the Google OAuth flow
    // For the hackathon demo, we check if keys exist, otherwise we simulate success
    if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      alert("No Supabase keys found in .env.local. Simulating login for demo...");
      window.location.reload(); // Simple reload to simulate state change if we had a mock provider
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      background: 'var(--background)'
    }}>
      <div className="glass-panel" style={{ 
        maxWidth: '480px', 
        width: '100%', 
        padding: '48px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Glow */}
        <div style={{ 
          position: 'absolute', 
          top: '-50%', 
          left: '-50%', 
          width: '200%', 
          height: '200%', 
          background: 'radial-gradient(circle at center, rgba(112, 0, 255, 0.05) 0%, transparent 50%)',
          animation: 'rotate 20s linear infinite'
        }} />
        <style jsx>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', 
            borderRadius: '16px', 
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0, 242, 255, 0.3)'
          }}>
            <Shield size={32} color="white" />
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }} className="text-gradient">Welcome to ChatBank</h1>
          <p style={{ color: 'var(--secondary)', marginBottom: '40px', fontSize: '15px', lineHeight: '1.6' }}>
            The world's first AI-native banking experience. Secure, intelligent, and totally free.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            <button 
              onClick={handleGoogleLogin}
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '12px', 
                background: 'white', 
                color: 'black', 
                border: 'none', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'transform 0.2s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button 
              onClick={() => window.location.href = '/?demo=true'}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'var(--secondary)', 
                border: '1px solid var(--card-border)', 
                fontWeight: 500, 
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Explore as Guest (Demo)
            </button>
            <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>
              By continuing, you agree to ChatBank's Terms of Service.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
             <div className="glass-card" style={{ padding: '16px' }}>
                <Zap size={18} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Instant Access</div>
                <div style={{ fontSize: '11px', color: 'var(--secondary)' }}>No more long forms.</div>
             </div>
             <div className="glass-card" style={{ padding: '16px' }}>
                <Sparkles size={18} color="var(--accent-purple)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>AI Powered</div>
                <div style={{ fontSize: '11px', color: 'var(--secondary)' }}>Smarter banking.</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
