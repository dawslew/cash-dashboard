import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { public_token } = await request.json()

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    })

    const institutionId = itemResponse.data.item.institution_id
    let institutionName = 'Unknown Institution'

    if (institutionId) {
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: ['US' as any],
      })
      institutionName = institutionResponse.data.institution.name
    }

    const { data, error } = await supabaseAdmin
      .from('plaid_items')
      .insert({
        plaid_item_id: itemId,
        plaid_access_token: accessToken,
        institution_id: institutionId,
        institution_name: institutionName,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}
