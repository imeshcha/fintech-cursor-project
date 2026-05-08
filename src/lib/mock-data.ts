export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Bills' | 'Income' | 'Others';
  type: 'debit' | 'credit';
  bank: string;
  logo?: string;
}

export interface Jar {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
  emoji: string;
}

export interface Contact {
  id: string;
  name: string;
  accountNumber: string;
  bank: string;
  avatar: string;
  color: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  // NTB transactions
  { id: '1',  date: '2026-05-05', description: 'Salary Deposit',     amount: 150000, category: 'Income',        type: 'credit', bank: 'NTB' },
  { id: '2',  date: '2026-05-05', description: 'Pizza Hut SL',       amount: 3200,   category: 'Food',          type: 'debit',  bank: 'NTB' },
  { id: '3',  date: '2026-05-05', description: 'Odel Shopping',      amount: 8500,   category: 'Shopping',      type: 'debit',  bank: 'NTB' },
  { id: '4',  date: '2026-05-04', description: 'Dialog Axiata PLC',  amount: 2500,   category: 'Bills',         type: 'debit',  bank: 'NTB' },
  // BOC transactions
  { id: '5',  date: '2026-05-03', description: 'Uber Eats',          amount: 1850,   category: 'Food',          type: 'debit',  bank: 'BOC' },
  { id: '6',  date: '2026-05-02', description: 'Netflix',            amount: 1800,   category: 'Entertainment', type: 'debit',  bank: 'BOC' },
  { id: '7',  date: '2026-05-01', description: 'Freelance Payment',  amount: 45000,  category: 'Income',        type: 'credit', bank: 'BOC' },
  { id: '8',  date: '2026-04-30', description: 'Daraz Online',       amount: 6200,   category: 'Shopping',      type: 'debit',  bank: 'BOC' },
  // HNB transactions
  { id: '9',  date: '2026-05-03', description: 'PickMe Ride',        amount: 1200,   category: 'Transport',     type: 'debit',  bank: 'HNB' },
  { id: '10', date: '2026-05-02', description: 'SLT Broadband',      amount: 3500,   category: 'Bills',         type: 'debit',  bank: 'HNB' },
  { id: '11', date: '2026-05-01', description: 'Keells Supermarket', amount: 4500,   category: 'Food',          type: 'debit',  bank: 'HNB' },
  { id: '12', date: '2026-04-28', description: 'Part-time Income',   amount: 25000,  category: 'Income',        type: 'credit', bank: 'HNB' },
];

export const MOCK_JARS: Jar[] = [
  { id: 'j1', name: 'New Laptop', target: 350000, current: 120000, color: '#00f2ff', emoji: '💻' },
  { id: 'j2', name: 'Emergency Fund', target: 500000, current: 250000, color: '#7000ff', emoji: '🛡️' },
  { id: 'j3', name: 'Travel 2026', target: 100000, current: 15000, color: '#ff00c8', emoji: '✈️' },
  { id: 'j4', name: 'Home Upgrade', target: 200000, current: 80000, color: '#00ff9d', emoji: '🏠' },
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Kasun Perera', accountNumber: '1234567890', bank: 'NTB', avatar: 'K', color: '#00f2ff' },
  { id: 'c2', name: 'Ayesha Silva', accountNumber: '9876543210', bank: 'BOC', avatar: 'A', color: '#7000ff' },
  { id: 'c3', name: 'Ruwan Fernando', accountNumber: '5555666677', bank: 'HNB', avatar: 'R', color: '#ff00c8' },
  { id: 'c4', name: 'Nimal Jayawardena', accountNumber: '1111222233', bank: 'Commercial', avatar: 'N', color: '#00ff9d' },
];

// Bank name mapping for AI to resolve short/full names
export const BANK_NAME_MAP: Record<string, string> = {
  'ntb': 'Nations Trust Bank',
  'nations trust': 'Nations Trust Bank',
  'nations trust bank': 'Nations Trust Bank',
  'boc': 'Bank of Ceylon',
  'bank of ceylon': 'Bank of Ceylon',
  'hnb': 'Hatton National Bank',
  'hatton': 'Hatton National Bank',
  'hatton national': 'Hatton National Bank',
  'hatton national bank': 'Hatton National Bank',
  'commercial': 'Commercial Bank',
  'commercial bank': 'Commercial Bank',
  'sampath': 'Sampath Bank',
  'sampath bank': 'Sampath Bank',
  'peoples': "People's Bank",
  "people's bank": "People's Bank",
  'dfcc': 'DFCC Bank',
  'dfcc bank': 'DFCC Bank',
  'seylan': 'Seylan Bank',
  'seylan bank': 'Seylan Bank',
};

// Short code mapping
export const BANK_SHORT_CODE: Record<string, string> = {
  'Nations Trust Bank': 'NTB',
  'Bank of Ceylon': 'BOC',
  'Hatton National Bank': 'HNB',
  'Commercial Bank': 'Commercial',
  'Sampath Bank': 'Sampath',
  "People's Bank": "People's",
  'DFCC Bank': 'DFCC',
  'Seylan Bank': 'Seylan',
};
