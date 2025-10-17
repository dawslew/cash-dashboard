'use client'

import { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DollarSign, RefreshCw, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<number>(0)

  useEffect(() => {
    fetchLinkToken()
    fetchConnectedAccounts()
  }, [])

  const fetchLinkToken = async () => {
    const response = await fetch('/api/plaid/create-link-token', {
      method: 'POST',
    })
    const data = await response.json()
    setLinkToken(data.link_token)
  }

  const fetchConnectedAccounts = async () => {
    const { data } = await supabase
      .from('plaid_items')
      .select('id', { count: 'exact' })
    
    if (data) {
      setConnectedAccounts(data.length)
    }
  }

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      })

      if (response.ok) {
        alert('Bank account connected successfully!')
        fetchConnectedAccounts()
        handleSync()
      }
    },
  })

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message || 'Transactions synced successfully!')
      } else {
        alert('Failed to sync transactions')
      }
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Error syncing transactions')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cash Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Weekly insights into your cash transactions and balance
          </p>
        </div>

        {connectedAccounts > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Connected Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {connectedAccounts}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => open()}
            disabled={!ready}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Bank
            </h3>
            <p className="text-sm text-gray-600">
              Link your bank account to start tracking
            </p>
          </button>

          <Link
            href="/dashboard"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Dashboard
            </h3>
            <p className="text-sm text-gray-600">
              View cash metrics and charts
            </p>
          </Link>

          <Link
            href="/transactions"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transactions
            </h3>
            <p className="text-sm text-gray-600">
              Review and categorize transactions
            </p>
          </Link>

          <Link
            href="/admin"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Admin
            </h3>
            <p className="text-sm text-gray-600">
              Manage categories
            </p>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Real-time Dashboard
              </h3>
              <p className="text-gray-600">
                Track your cash balance, weekly changes, and trends over time
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🏷️ Category Management
              </h3>
              <p className="text-gray-600">
                Organize transactions with customizable categories
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📈 Cash Flow Visualization
              </h3>
              <p className="text-gray-600">
                Sankey diagrams show inflows and outflows clearly
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔄 Automatic Sync
              </h3>
              <p className="text-gray-600">
                Pull transaction data directly from your bank via Plaid
              </p>
            </div>
          </div>
        </div>

        {connectedAccounts === 0 && (
          <div className="max-w-2xl mx-auto mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              👋 Getting Started
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Connect Bank" to link your bank account (Sandbox mode)</li>
              <li>Use credentials: username: <code className="bg-blue-100 px-1 rounded">user_good</code>, password: <code className="bg-blue-100 px-1 rounded">pass_good</code></li>
              <li>Transactions will sync automatically</li>
              <li>Visit the Dashboard to see your cash metrics</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
