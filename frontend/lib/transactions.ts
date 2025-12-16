import type {
  Transaction,
  TransactionListResponse,
  ExtractTransactionRequest,
  ExtractTransactionResponse,
} from '@/types/transaction'

const API_BASE = '/api/proxy'

/**
 * Extract and save a transaction from raw bank statement text
 */
export async function extractTransaction(
  data: ExtractTransactionRequest
): Promise<ExtractTransactionResponse> {
  const response = await fetch(`${API_BASE}/transactions/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to extract transaction' }))
    throw new Error(error.error || 'Failed to extract transaction')
  }

  return response.json()
}

/**
 * Get transactions for an organization with pagination
 */
export async function getTransactions(params: {
  organizationId: string
  limit?: number
  cursor?: string
}): Promise<TransactionListResponse> {
  const searchParams = new URLSearchParams({
    organizationId: params.organizationId,
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.cursor && { cursor: params.cursor }),
  })

  const response = await fetch(`${API_BASE}/transactions?${searchParams}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch transactions' }))
    throw new Error(error.error || 'Failed to fetch transactions')
  }

  return response.json()
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(
  id: string,
  organizationId: string
): Promise<Transaction> {
  const searchParams = new URLSearchParams({ organizationId })

  const response = await fetch(`${API_BASE}/transactions/${id}?${searchParams}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch transaction' }))
    throw new Error(error.error || 'Failed to fetch transaction')
  }

  return response.json()
}
