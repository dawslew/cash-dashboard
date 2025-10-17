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
