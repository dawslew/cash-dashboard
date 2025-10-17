'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CashSnapshot, Transaction, Category } from '@/types'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Sankey,
  Rectangle,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const [snapshots, setSnapshots] = useState<CashSnapshot[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [weeklyChange, setWeeklyChange] = useState<number>(0)
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    const { data: snapshotData } = await supabase
      .from('cash_snapshots')
      .select('*')
      .gte('snapshot_date', format(subDays(new Date(), 90), 'yyyy-MM-dd'))
      .order('snapshot_date', { ascending: true })

    if (snapshotData) {
      setSnapshots(snapshotData)
      if (snapshotData.length > 0) {
        setCurrentBalance(snapshotData[snapshotData.length - 1].balance)
      }
    }

    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd')
    
    const { data: txnData } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: false })

    if (txnData) {
      setTransactions(txnData)
      
      const inflows = txnData
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const outflows = txnData
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      
      setWeeklyChange(inflows - outflows)
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

  const prepareSankeyData = () => {
    const inflowsByCategory: { [key: string]: number } = {}
    const outflowsByCategory: { [key: string]: number } = {}

    transactions.forEach((txn) => {
      const categoryName = txn.category?.name || 'Uncategorized'
      if (txn.amount < 0) {
        inflowsByCategory[categoryName] = 
          (inflowsByCategory[categoryName] || 0) + Math.abs(txn.amount)
      } else {
        outflowsByCategory[categoryName] = 
          (outflowsByCategory[categoryName] || 0) + txn.amount
      }
    })

    const nodes: any[] = [{ name: 'Cash Balance' }]
    const links: any[] = []

    Object.entries(inflowsByCategory).forEach(([category, amount]) => {
      const sourceIndex = nodes.findIndex((n) => n.name === category)
      if (sourceIndex === -1) {
        nodes.push({ name: category })
      }
      const source = nodes.findIndex((n) => n.name === category)
      links.push({
        source,
        target: 0,
        value: amount,
      })
    })

    Object.entries(outflowsByCategory).forEach(([category, amount]) => {
      const targetIndex = nodes.findIndex((n) => n.name === category)
      if (targetIndex === -1) {
        nodes.push({ name: category })
      }
      const target = nodes.findIndex((n) => n.name === category)
      links.push({
        source: 0,
        target,
        value: amount,
      })
    })

    return { nodes, links }
  }

  const sankeyData = prepareSankeyData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Cash Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-3xl font-bold">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weekly Change</p>
              <p className={`text-3xl font-bold ${weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(weeklyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {weeklyChange >= 0 ? (
              <TrendingUp className="w-12 h-12 text-green-500" />
            ) : (
              <TrendingDown className="w-12 h-12 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-3xl font-bold">{transactions.length}</p>
              <p className="text-sm text-gray-500">transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cash Balance Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={snapshots}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="snapshot_date" 
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance']}
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Cash Flows (This Week)</h2>
        {sankeyData.links.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <Sankey
              data={sankeyData}
              node={<Rectangle fill="#3b82f6" />}
              nodePadding={50}
              margin={{ left: 20, right: 200, top: 20, bottom: 20 }}
              link={{ stroke: '#94a3b8' }}
            >
              <Tooltip 
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No transactions this week to display
          </p>
        )}
      </div>
    </div>
  )
}
