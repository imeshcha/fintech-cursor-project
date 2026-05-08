import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { publicToken, userId } = await req.json();
    const supabase = await createClient();

    // 1. Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 2. Fetch account details and balances from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const plaidAccount = accountsResponse.data.accounts[0]; // Just take the first one for simplicity
    if (!plaidAccount) throw new Error('No accounts found');

    // 3. Handle Demo vs Cloud
    const isDemo = !userId || userId === 'demo' || userId === 'demo-user-123';

    if (isDemo) {
      // In demo mode, return the data without saving to DB to avoid RLS error
      const demoAccount = {
        id: 'demo-acc-' + Math.random().toString(36).substr(2, 9),
        bankName: 'Plaid Sandbox Bank',
        accountNumber: '••••' + plaidAccount.mask,
        accountType: plaidAccount.subtype || plaidAccount.type,
        balance: plaidAccount.balances.current || 0,
        currency: plaidAccount.balances.iso_currency_code || 'USD',
        color: '#7b68ee',
        logo: '🏦',
        lastFour: plaidAccount.mask
      };
      return NextResponse.json({ success: true, account: demoAccount });
    }

    // CLOUD MODE: Save to Supabase using the server client
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: userId,
        bank_name: 'Plaid Linked Bank',
        account_number: '••••' + plaidAccount.mask,
        account_type: plaidAccount.subtype || plaidAccount.type,
        balance: plaidAccount.balances.current || 0,
        currency: plaidAccount.balances.iso_currency_code || 'USD',
        color: '#7b68ee',
        logo: '🏦',
        last_four: plaidAccount.mask
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, account: data });
  } catch (error: any) {
    console.error('Plaid Exchange Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to exchange token',
      details: error.response?.data 
    }, { status: 500 });
  }
}
