'use client';

import React from 'react';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { ShoppingCart, Car, DollarSign, Utensils, Zap, Film, MoreHorizontal } from 'lucide-react';

const categoryIcons = {
  Food: <Utensils size={20} />,
  Transport: <Car size={20} />,
  Shopping: <ShoppingCart size={20} />,
  Entertainment: <Film size={20} />,
  Bills: <Zap size={20} />,
  Income: <DollarSign size={20} />,
  Others: <MoreHorizontal size={20} />,
};

export default function TransactionList() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {MOCK_TRANSACTIONS.map((tx) => (
          <div key={tx.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: tx.type === 'credit' ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tx.type === 'credit' ? 'var(--accent-cyan)' : 'white'
              }}>
                {categoryIcons[tx.category]}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{tx.description}</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{tx.date} • {tx.bank}</div>
              </div>
            </div>
            <div style={{ 
              fontWeight: 600, 
              color: tx.type === 'credit' ? 'var(--accent-cyan)' : 'white' 
            }}>
              {tx.type === 'credit' ? '+' : '-'} LKR {tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
