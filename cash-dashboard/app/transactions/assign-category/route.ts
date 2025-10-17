import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, category_id } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update({ 
        category_id,
        updated_at: new Date().toISOString() 
      })
      .eq('id', transaction_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating transaction category:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction category' },
      { status: 500 }
    )
  }
}
