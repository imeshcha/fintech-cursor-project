'use client';

import React from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BalanceCard() {
  return (
    <div className="glass-panel" style={{ 
      padding: '32px', 
      background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1))',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Circles */}
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        width: '100px', 
        height: '100px', 
        background: 'var(--accent-cyan)', 
        filter: 'blur(60px)', 
        opacity: 0.2 
      }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={16} /> Total Balance
          </p>
          <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em' }}>
            <span style={{ fontSize: '24px', verticalAlign: 'middle', marginRight: '4px', opacity: 0.6 }}>LKR</span>
            142,500<span style={{ opacity: 0.5 }}>.00</span>
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            background: 'rgba(0, 255, 133, 0.1)', 
            color: '#00ff85', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <TrendingUp size={14} /> +12.5%
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <ArrowDownLeft size={16} />
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'var(--secondary)', textTransform: 'uppercase' }}>Income</p>
            <p style={{ fontWeight: 600 }}>LKR 150,000</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 0, 200, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-pink)' }}>
            <ArrowUpRight size={16} />
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'var(--secondary)', textTransform: 'uppercase' }}>Expenses</p>
            <p style={{ fontWeight: 600 }}>LKR 7,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}
