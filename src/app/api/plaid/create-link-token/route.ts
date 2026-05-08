import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clientUserId = body?.userId || 'demo-user-123';

    const configs = {
      user: { client_user_id: clientUserId },
      client_name: 'ChatBank AI',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us], // Change to your target countries
      language: 'en',
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    return NextResponse.json(createTokenResponse.data);
  } catch (error: any) {
    console.error('Plaid Link Token Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
