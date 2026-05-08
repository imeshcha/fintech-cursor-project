import Groq from 'groq-sdk';
import { BANK_SHORT_CODE } from '@/lib/mock-data';

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Tool definitions — unified across all accounts
const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'getBalance',
      description: 'Get balance information. If bankName is provided, return that specific bank balance only. If not provided, return ALL connected bank accounts with individual balances and total.',
      parameters: {
        type: 'object',
        properties: {
          bankName: { type: 'string', description: 'Optional: specific bank name to query (e.g. "NTB", "BOC", "HNB", "Nations Trust Bank"). If omitted, returns all accounts.' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getTransactions',
      description: 'Get transaction history. If bankName is provided, return only that bank transactions. If not, return ALL transactions across all banks.',
      parameters: {
        type: 'object',
        properties: {
          bankName: { type: 'string', description: 'Optional: filter by bank name (e.g. "NTB", "BOC", "HNB")' },
          limit: { type: 'number', description: 'Number of transactions to return (default 8)' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getSpendingAnalysis',
      description: 'Analyze spending/expenses by category. If bankName is provided, analyze only that bank. Otherwise analyze ALL spending across all banks combined.',
      parameters: {
        type: 'object',
        properties: {
          bankName: { type: 'string', description: 'Optional: filter spending by bank (e.g. "NTB", "BOC", "HNB")' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'sendMoney',
      description: 'Execute a money transfer to a recipient.',
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Name of the recipient' },
          amount: { type: 'number', description: 'Amount in LKR' },
          fromBank: { type: 'string', description: 'Optional: which bank to send from' },
        },
        required: ['recipient', 'amount'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getJars',
      description: 'Get all savings jars and their progress.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Helper to resolve bank names to short codes
function resolveBankCode(input?: string): string | null {
  if (!input) return null;
  const s = input.toLowerCase();
  if (s.includes('ntb') || s.includes('nations')) return 'NTB';
  if (s.includes('boc') || s.includes('ceylon')) return 'BOC';
  if (s.includes('hnb') || s.includes('hatton')) return 'HNB';
  if (s.includes('commercial')) return 'Commercial';
  if (s.includes('sampath')) return 'Sampath';
  if (s.includes('people')) return "People's";
  if (s.includes('dfcc')) return 'DFCC';
  if (s.includes('seylan')) return 'Seylan';
  return input;
}

// Execute tools with dynamic cloud data
function executeTool(name: string, args: any, data: { accounts: any[], transactions: any[], jars: any[] }): any {
  const { accounts, transactions, jars } = data;

  switch (name) {
    case 'getBalance': {
      const bankCode = resolveBankCode(args?.bankName);
      if (bankCode) {
        const account = accounts.find((a: any) =>
          a.bankName.toLowerCase().includes(bankCode.toLowerCase()) ||
          (BANK_SHORT_CODE[a.bankName] || '').toLowerCase() === bankCode.toLowerCase()
        );
        if (account) {
          return {
            type: 'single',
            bankName: account.bankName,
            balance: account.balance,
            currency: account.currency,
            accountType: account.accountType,
            lastFour: account.lastFour,
          };
        }
        return { type: 'error', message: `No account found for bank: ${args.bankName}` };
      }
      const total = accounts.reduce((s: number, a: any) => s + (a.balance || 0), 0);
      return {
        type: 'all',
        totalBalance: total,
        currency: 'LKR',
        accounts: accounts.map((a: any) => ({
          bankName: a.bankName,
          balance: a.balance,
          accountType: a.accountType,
          lastFour: a.lastFour,
        })),
      };
    }

    case 'getTransactions': {
      const bankCode = resolveBankCode(args?.bankName);
      let txns = [...transactions];
      if (bankCode) {
        txns = txns.filter(t => t.bank.toLowerCase() === bankCode.toLowerCase());
      }
      const limit = args?.limit ?? 8;
      return {
        filterBank: bankCode || 'ALL',
        transactions: txns.slice(0, limit),
        totalCount: txns.length,
      };
    }

    case 'getSpendingAnalysis': {
      const bankCode = resolveBankCode(args?.bankName);
      let debits = transactions.filter(t => t.type === 'debit');
      if (bankCode) {
        debits = debits.filter(t => t.bank.toLowerCase() === bankCode.toLowerCase());
      }
      const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
      const byCategory = debits.reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
      return {
        filterBank: bankCode || 'ALL',
        totalSpent,
        byCategory,
      };
    }

    case 'sendMoney':
      return {
        success: true,
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        message: `Successfully sent LKR ${args.amount} to ${args.recipient}`,
        fromBank: args.fromBank || 'selected payment account',
      };

    case 'getJars':
      return { jars };

    default:
      return { error: 'Unknown tool' };
  }
}

export async function POST(req: Request) {
  const { messages, accounts, transactions, jars } = await req.json();

  const groqMessages: any[] = messages.map((m: any) => {
    const textContent = m.content ?? '';
    return { role: m.role, content: textContent };
  });

  const accountsData = accounts || [];
  const transactionsData = transactions || [];
  const jarsData = jars || [];

  const totalBalance = accountsData.reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const accountsList = accountsData.map((a: any) =>
    `- ${a.bankName} (••${a.lastFour}, ${a.accountType}): LKR ${(a.balance || 0).toLocaleString()}`
  ).join('\n');

  const systemMessage = {
    role: 'system',
    content: `You are **ChatBank AI** — a unified, intelligent banking assistant.
You manage ALL of the user's connected bank accounts as a single assistant.

## Connected Accounts:
${accountsList || '- No accounts connected'}

**Total Combined Balance: LKR ${totalBalance.toLocaleString()}**

## Core Rules:
1. You are ONE unified bot.
2. getBalance() no bankName = ALL accounts.
3. getSpendingAnalysis() no bankName = ALL combined.
4. Format amounts as "LKR X,XXX".
5. Be concise and friendly.`,
  };

  const allMessages = [systemMessage, ...groqMessages];

  let currentMessages = allMessages;
  let finalText = '';

  for (let step = 0; step < 5; step++) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: currentMessages,
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      finalText = assistantMessage.content ?? '';
      break;
    }

    const toolResultMessages: any[] = [];
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
      const toolResult = executeTool(toolName, toolArgs, { 
        accounts: accountsData, 
        transactions: transactionsData, 
        jars: jarsData 
      });

      toolResultMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }

    currentMessages = [
      ...currentMessages,
      assistantMessage,
      ...toolResultMessages,
    ];
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunkSize = 10;
      let i = 0;
      function push() {
        if (i >= finalText.length) {
          controller.close();
          return;
        }
        const chunk = finalText.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(chunk));
        i += chunkSize;
        setTimeout(push, 10);
      }
      push();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
