'use client'

import { useEffect, useState } from 'react'
import { getTransactions } from '@/lib/transactions'
import type { Transaction } from '@/types/transaction'

interface TransactionsListProps {
  organizationId: string
  refreshTrigger?: number
}

export default function TransactionsList({ organizationId, refreshTrigger = 0 }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadTransactions = async (cursor?: string, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const response = await getTransactions({
        organizationId,
        limit: 20,
        cursor,
      })

      if (append) {
        setTransactions((prev) => [...prev, ...response.items])
      } else {
        setTransactions(response.items)
      }
      
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions'
      setError(errorMessage)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadTransactions()
    }
  }, [organizationId, refreshTrigger])

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadTransactions(nextCursor, true)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-800 border-orange-200',
      'Shopping': 'bg-blue-100 text-blue-800 border-blue-200',
      'Transportation': 'bg-purple-100 text-purple-800 border-purple-200',
      'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
      'Utilities': 'bg-gray-100 text-gray-800 border-gray-200',
      'Healthcare': 'bg-red-100 text-red-800 border-red-200',
      'Transfer': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    }
    return category && colors[category] ? colors[category] : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Transactions</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadTransactions()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by extracting your first transaction above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Transactions ({transactions.length})
        </h3>
        <button
          onClick={() => loadTransactions()}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {transaction.category && (
                    <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(transaction.confidence)}`}>
                    {Math.round(transaction.confidence * 100)}% confidence
                  </span>
                </div>
                
                {transaction.description && (
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {transaction.description}
                  </h4>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  {transaction.date && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                {transaction.text && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View raw text
                    </summary>
                    <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                      {transaction.text}
                    </p>
                  </details>
                )}
              </div>

              {transaction.amount !== null && (
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ₹{transaction.amount.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
