'use client';

import React, { useState } from 'react';
import { Users, Plus, Minus, Share2 } from 'lucide-react';

export default function SplitBill() {
  const [amount, setAmount] = useState<string>('');
  const [people, setPeople] = useState<number>(2);

  const splitAmount = amount ? (parseFloat(amount) / people).toFixed(2) : '0.00';

  return (
    <div className="glass-panel fade-in" style={{ padding: '32px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Users className="text-gradient" />
        Split Bill
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--secondary)', marginBottom: '8px' }}>Total Amount (LKR)</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          style={{ 
            width: '100%', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--card-border)', 
            borderRadius: '12px', 
            padding: '16px',
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--secondary)', marginBottom: '8px' }}>Number of People</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => setPeople(Math.max(1, people - 1))}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', cursor: 'pointer' }}
          >
            <Minus size={18} />
          </button>
          <span style={{ fontSize: '20px', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{people}</span>
          <button 
            onClick={() => setPeople(people + 1)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: 'white', cursor: 'pointer' }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.05), rgba(112, 0, 255, 0.05))', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--secondary)', marginBottom: '8px' }}>Each person pays</div>
        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-cyan)' }}>LKR {splitAmount}</div>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Share2 size={18} />
        Send Payment Requests
      </button>
    </div>
  );
}
