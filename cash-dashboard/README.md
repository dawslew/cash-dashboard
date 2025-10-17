# Cash Dashboard

A Next.js application for tracking and analyzing cash transactions using Plaid Sandbox API and Supabase.

## Features

- 🏦 Bank account integration via Plaid Sandbox API
- 📊 Interactive cash dashboard with charts and metrics
- 💰 Transaction management with category coding
- 📈 Cash flow visualization with Sankey diagrams
- ⚙️ Admin panel for category configuration
- 📅 Weekly cash reporting and insights

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **APIs**: Plaid Sandbox API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Plaid Sandbox account
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Run the SQL from `supabase-schema.sql` to create tables and default categories

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Plaid API Keys  
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using Plaid Sandbox

When connecting a bank account:
- **Username**: `user_good`
- **Password**: `pass_good`
- Select any test institution (e.g., "First Platypus Bank")

## Project Structure

```
cash-dashboard/
├── app/
│   ├── page.tsx                 # Home page with Plaid Link
│   ├── layout.tsx               # Root layout with navigation
│   ├── globals.css              # Global styles
│   ├── dashboard/
│   │   └── page.tsx             # Cash dashboard with charts
│   ├── transactions/
│   │   └── page.tsx             # Transaction management
│   ├── admin/
│   │   └── page.tsx             # Category administration
│   └── api/
│       ├── plaid/
│       │   ├── create-link-token/
│       │   ├── exchange-token/
│       │   └── sync-transactions/
│       ├── categories/
│       │   ├── route.ts
│       │   └── manage/
│       └── transactions/
│           └── assign-category/
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── supabase-admin.ts        # Supabase admin client
│   └── plaid.ts                 # Plaid client configuration
├── types/
│   └── index.ts                 # TypeScript type definitions
├── supabase-schema.sql          # Database schema
└── package.json
```

## Key Components

### Dashboard (`/dashboard`)
- Current cash balance
- Weekly cash change metrics
- Line chart showing balance over time
- Sankey diagram for cash flows

### Transactions (`/transactions`)
- Table view of all transactions
- Category assignment interface
- Filter by date and status
- Pending/posted transaction indicators

### Admin (`/admin`)
- Create/edit/delete categories
- Separate inflow and outflow categories
- Color coding for visual organization

## API Routes

### Plaid Integration
- `POST /api/plaid/create-link-token` - Generate Plaid Link token
- `POST /api/plaid/exchange-token` - Exchange public token for access token
- `POST /api/plaid/sync-transactions` - Sync transactions from Plaid

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories/manage` - Create category
- `PUT /api/categories/manage` - Update category
- `DELETE /api/categories/manage` - Delete category

### Transactions
- `POST /api/transactions/assign-category` - Assign category to transaction

## Database Schema

### Tables
- `categories` - Transaction categories (inflow/outflow)
- `plaid_items` - Connected bank accounts
- `transactions` - Transaction records
- `cash_snapshots` - Daily cash balance snapshots

See `supabase-schema.sql` for complete schema.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up serverless functions for API routes
- Provide a production URL

## Development Workflow

1. **Connect Bank Account**: Use Plaid Link on home page
2. **Sync Transactions**: Click "Sync Now" to pull transactions
3. **Categorize**: Go to Transactions page and assign categories
4. **View Insights**: Check Dashboard for metrics and charts
5. **Manage Categories**: Use Admin page to customize categories

## Troubleshooting

### Plaid Connection Issues
- Verify your Plaid credentials in `.env.local`
- Ensure you're using Sandbox environment
- Check Plaid Dashboard for API logs

### Supabase Errors
- Verify database schema is properly set up
- Check Row Level Security (RLS) policies if needed
- Ensure environment variables are correct

### Transaction Sync Issues
- Check that Plaid items are properly stored in database
- Verify access tokens are valid
- Check API route logs for errors

## Next Steps

- [ ] Add authentication (Supabase Auth)
- [ ] Implement row-level security
- [ ] Add transaction search and filtering
- [ ] Create weekly email reports
- [ ] Add budget tracking
- [ ] Implement transaction rules for auto-categorization
- [ ] Add export functionality (CSV/PDF)

## License

MIT

---

Built with ❤️ using Next.js, Plaid, and Supabase
