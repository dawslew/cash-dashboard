'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction, Category } from '@/types'
import { format } from 'date-fns'
import { Tag } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const { data: txnData } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .order('date', { ascending: false })
      .limit(100)

    if (txnData) {
      setTransactions(txnData)
    }

    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (catData) {
      setCategories(catData)
    }

    setLoading(false)
  }

  const handleCategoryChange = async (transactionId: string, categoryId: string) => {
    try {
      const response = await fetch('/api/transactions/assign-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          category_id: categoryId || null,
        }),
      })

      if (response.ok) {
        await fetchData()
        setSelectedTransaction(null)
      }
    } catch (error) {
      console.error('Error assigning category:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Transactions</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(txn.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {txn.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {txn.merchant_name || '-'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  txn.amount < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {txn.amount < 0 ? '+' : '-'}$
                  {Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {selectedTransaction === txn.id ? (
                    <select
                      autoFocus
                      value={txn.category_id || ''}
                      onChange={(e) => handleCategoryChange(txn.id, e.target.value)}
                      onBlur={() => setSelectedTransaction(null)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setSelectedTransaction(txn.id)}
                      className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                    >
                      {txn.category ? (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: txn.category.color || '#e5e7eb',
                            color: '#000',
                          }}
                        >
                          {txn.category.name}
                        </span>
                      ) : (
                        <>
                          <Tag className="w-4 h-4" />
                          <span className="text-gray-400">Add category</span>
                        </>
                      )}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  {txn.pending ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Posted
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No transactions found. Connect a bank account to get started.
          </div>
        )}
      </div>
    </div>
  )
}
