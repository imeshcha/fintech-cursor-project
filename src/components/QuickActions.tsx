'use client';

import React from 'react';
import { Send, Download, UserPlus, MoreHorizontal } from 'lucide-react';

const actions = [
  { id: 'send', label: 'Send', icon: <Send size={24} />, color: 'var(--accent-cyan)' },
  { id: 'receive', label: 'Receive', icon: <Download size={24} />, color: 'var(--accent-purple)' },
  { id: 'contact', label: 'Add Contact', icon: <UserPlus size={24} />, color: 'var(--accent-pink)' },
  { id: 'more', label: 'More', icon: <MoreHorizontal size={24} />, color: 'var(--secondary)' },
];

export default function QuickActions() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {actions.map((action) => (
        <button
          key={action.id}
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 10px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: `${action.color}15`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: action.color
          }}>
            {action.icon}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'white' }}>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
