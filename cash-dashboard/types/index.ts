export interface Category {
  id: string
  name: string
  type: 'inflow' | 'outflow'
  color?: string
  created_at: string
  updated_at: string
}

export interface PlaidItem {
  id: string
  plaid_item_id: string
  plaid_access_token: string
  institution_id?: string
  institution_name?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  plaid_transaction_id: string
  plaid_item_id: string
  account_id: string
  amount: number
  date: string
  name: string
  merchant_name?: string
  category_id?: string
  category?: Category
  pending: boolean
  created_at: string
  updated_at: string
}

export interface CashSnapshot {
  id: string
  snapshot_date: string
  balance: number
  plaid_item_id: string
  created_at: string
}

export interface SankeyData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}
