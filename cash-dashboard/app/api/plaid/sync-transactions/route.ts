import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { format, subDays } from 'date-fns'

export async function POST() {
  try {
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('plaid_items')
      .select('*')

    if (itemsError) throw itemsError

    let totalTransactions = 0

    for (const item of items) {
      const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
      const endDate = format(new Date(), 'yyyy-MM-dd')

      const response = await plaidClient.transactionsGet({
        access_token: item.plaid_access_token,
        start_date: startDate,
        end_date: endDate,
      })

      const transactions = response.data.transactions

      const transactionsToInsert = transactions.map((txn) => ({
        plaid_transaction_id: txn.transaction_id,
        plaid_item_id: item.id,
        account_id: txn.account_id,
        amount: txn.amount,
        date: txn.date,
        name: txn.name,
        merchant_name: txn.merchant_name || null,
        pending: txn.pending,
      }))

      const { error: txnError } = await supabaseAdmin
        .from('transactions')
        .upsert(transactionsToInsert, {
          onConflict: 'plaid_transaction_id',
          ignoreDuplicates: false,
        })

      if (txnError) {
        console.error('Error inserting transactions:', txnError)
        continue
      }

      totalTransactions += transactions.length

      const accountsResponse = await plaidClient.accountsBalanceGet({
        access_token: item.plaid_access_token,
      })

      const totalBalance = accountsResponse.data.accounts.reduce(
        (sum, account) => sum + (account.balances.current || 0),
        0
      )

      await supabaseAdmin.from('cash_snapshots').upsert(
        {
          snapshot_date: format(new Date(), 'yyyy-MM-dd'),
          balance: totalBalance,
          plaid_item_id: item.id,
        },
        {
          onConflict: 'snapshot_date,plaid_item_id',
          ignoreDuplicates: false,
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${totalTransactions} transactions`,
    })
  } catch (error) {
    console.error('Error syncing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
