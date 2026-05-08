'use client';

import React from 'react';
import { MOCK_JARS } from '@/lib/mock-data';
import { Target, TrendingUp } from 'lucide-react';

export default function Jars() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 600 }}>Savings Jars</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '14px' }}>
          <TrendingUp size={16} />
          <span>+2.4% this month</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {MOCK_JARS.map((jar) => {
          const percentage = Math.min((jar.current / jar.target) * 100, 100);
          return (
            <div key={jar.id} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '4px', 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)' 
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${percentage}%`, 
                  background: jar.color,
                  boxShadow: `0 0 10px ${jar.color}` 
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{jar.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>Goal: LKR {jar.target.toLocaleString()}</div>
                </div>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: `${jar.color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: jar.color
                }}>
                  <Target size={18} />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>LKR {jar.current.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>Saved so far</div>
                </div>
                <div style={{ fontWeight: 600, color: jar.color }}>{percentage.toFixed(0)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
