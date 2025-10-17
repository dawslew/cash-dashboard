# Complete Setup Guide

This guide contains all the code you need to set up the Cash Dashboard application.

## Step 1: Initialize Project

```bash
npx create-next-app@latest cash-dashboard --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd cash-dashboard
npm install plaid @supabase/supabase-js react-plaid-link recharts lucide-react date-fns
```

## Step 2: Create Environment Files

Create `.env.local`:
```env
PLAID_CLIENT_ID=68ec3c489729400023001939
PLAID_SECRET=5bf8c87568da6804f15bd68bf374c4
PLAID_ENV=sandbox

NEXT_PUBLIC_SUPABASE_URL=https://oyteknvlkzxvceyybbod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dGVrbnZsa3p4dmNleXliYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzYwMDgsImV4cCI6MjA3NjIxMjAwOH0.WkeoAwIT4X-yByRxUm9bVOJxcFNoX5nzGoNb6HenO_A
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_here>
```

## Step 3: Set Up Supabase Database

Run this SQL in your Supabase SQL Editor (see supabase-schema.sql file).

## Step 4: Create Directory Structure

```bash
mkdir -p app/{api/{plaid,categories,transactions},dashboard,transactions,admin}
mkdir -p lib types
```

## Step 5: Create Core Files

All file contents are provided below. Create each file in your project.

---

## File Contents

### `/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `/lib/supabase-admin.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### `/lib/plaid.ts`
```typescript
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)
```

### `/types/index.ts`
```typescript
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
```

### `/app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `/app/layout.tsx`
```typescript
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cash Dashboard",
  description: "Weekly insights into cash transactions and balance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold text-gray-900">
                💰 Cash Dashboard
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Transactions
                </Link>
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

---

### API Routes

Create these files in the corresponding directories:

- `/app/api/plaid/create-link-token/route.ts` - See previous chat for code
- `/app/api/plaid/exchange-token/route.ts` - See previous chat for code
- `/app/api/plaid/sync-transactions/route.ts` - See previous chat for code
- `/app/api/categories/route.ts` - See previous chat for code
- `/app/api/categories/manage/route.ts` - See previous chat for code
- `/app/api/transactions/assign-category/route.ts` - See previous chat for code

### Pages

Create these files in the corresponding directories:

- `/app/page.tsx` - Home page with Plaid Link (see previous chat)
- `/app/dashboard/page.tsx` - Dashboard with charts (see previous chat)
- `/app/transactions/page.tsx` - Transactions table (see previous chat)
- `/app/admin/page.tsx` - Admin category management (see previous chat)

---

## Step 6: Run the Application

```bash
npm run dev
```

Open http://localhost:3000

## Step 7: Connect Bank Account

1. Click "Connect Bank" button
2. Use credentials: `user_good` / `pass_good`
3. Select any test bank
4. Click "Sync Now" to pull transactions

## Step 8: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Important Notes

1. Make sure to run the Supabase SQL schema before starting the app
2. Replace `<your_service_role_key_here>` with your actual Supabase service role key
3. All Plaid credentials are already filled in for Sandbox mode
4. The app uses the App Router (Next.js 13+) structure

## Need the Full Code?

All the page and API route code was provided in our earlier conversation. Copy each file from there into your project structure.

Happy coding! 🚀
