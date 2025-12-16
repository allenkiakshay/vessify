'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <div className="flex space-x-2">
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              <Link
                href="/dashboard/transactions"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${
                  pathname?.startsWith('/dashboard/transactions')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Transactions</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.email && (
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
