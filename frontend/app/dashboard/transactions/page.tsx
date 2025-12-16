'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import TransactionForm from '@/components/transaction-form'
import TransactionsList from '@/components/transactions-list'
import { OrganizationSelector } from '@/components/organization-selector'
import DashboardNavbar from '@/components/dashboard-navbar'

interface Organization {
  id: string
  name: string
  role: string
}

function TransactionsContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Get organization ID from URL or use the first available
    const orgIdFromUrl = searchParams.get('org')
    if (orgIdFromUrl) {
      setSelectedOrgId(orgIdFromUrl)
    }
  }, [searchParams])

  const handleOrgChange = (org: Organization | null) => {
    if (org) {
      setSelectedOrgId(org.id)
      // Update URL with selected org
      const params = new URLSearchParams(searchParams.toString())
      params.set('org', org.id)
      router.push(`?${params.toString()}`)
    } else {
      setSelectedOrgId(null)
    }
  }

  const handleTransactionSuccess = () => {
    // Trigger a refresh of the transactions list
    setRefreshTrigger((prev) => prev + 1)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Extract and manage transactions from bank statements
            </p>
          </div>

          {/* Organization Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization
            </label>
            <OrganizationSelector
              onOrganizationChange={handleOrgChange}
            />
          </div>

          {selectedOrgId ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Transaction Form */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Extract Transaction</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Paste your bank statement text to automatically extract transaction details.
                    </p>
                  </div>
                  <TransactionForm
                    organizationId={selectedOrgId}
                    onSuccess={handleTransactionSuccess}
                  />
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">How it works</h3>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Paste raw bank statement text</li>
                        <li>AI extracts amount, date, description, and category</li>
                        <li>Confidence score shows extraction accuracy</li>
                        <li>All transactions are saved to your organization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Transactions List */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Your Transactions</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      All transactions extracted for this organization.
                    </p>
                  </div>
                  <TransactionsList
                    organizationId={selectedOrgId}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Organization Selected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please select an organization above to start managing transactions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  )
}
