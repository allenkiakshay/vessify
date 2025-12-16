'use client'

import { useState } from 'react'
import { extractTransaction } from '@/lib/transactions'
import type { Transaction } from '@/types/transaction'

interface TransactionFormProps {
  organizationId: string
  onSuccess?: (transaction: Transaction) => void
}

export default function TransactionForm({ organizationId, onSuccess }: TransactionFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Transaction | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError('Please enter bank statement text')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const transaction = await extractTransaction({
        text: text.trim(),
        organizationId,
      })
      
      setResult(transaction)
      setText('') // Clear form on success
      
      if (onSuccess) {
        onSuccess(transaction)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract transaction'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  const exampleTexts = [
    'Starbucks Coffee 12/15/2024 ₹420.00',
    'Amazon India Purchase Dec 15, 2024 ₹2499.00',
    'Uber Ride 2024-12-15 ₹350.00',
    'Transfer to Rajesh Kumar\nUPI Payment\n12/15/2024\n₹1500.00',
  ]

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Bank Statement Text
          </label>
          <textarea
            id="text"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Paste your bank statement text here...&#10;&#10;Example:&#10;Starbucks Coffee 12/15/2024 ₹420.00"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <p className="mt-2 text-sm text-gray-500">
            Paste raw bank statement text. The system will extract amount, date, description, and category.
          </p>
        </div>

        {/* Example Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center">Quick examples:</span>
          {exampleTexts.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(example)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              disabled={loading}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Transaction Extracted Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">The transaction has been saved to your organization.</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getConfidenceColor(result.confidence)} bg-white`}>
                {getConfidenceLabel(result.confidence)} Confidence ({Math.round(result.confidence * 100)}%)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {result.amount !== null && (
                <div>
                  <span className="text-xs text-green-700 font-medium">Amount</span>
                  <p className="text-sm font-semibold text-green-900">₹{result.amount.toFixed(2)}</p>
                </div>
              )}
              {result.date && (
                <div>
                  <span className="text-xs text-green-700 font-medium">Date</span>
                  <p className="text-sm font-semibold text-green-900">
                    {new Date(result.date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {result.description && (
                <div className="col-span-2">
                  <span className="text-xs text-green-700 font-medium">Description</span>
                  <p className="text-sm font-semibold text-green-900">{result.description}</p>
                </div>
              )}
              {result.category && (
                <div>
                  <span className="text-xs text-green-700 font-medium">Category</span>
                  <p className="text-sm font-semibold text-green-900">{result.category}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Extracting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Extract Transaction
            </>
          )}
        </button>
      </form>
    </div>
  )
}
