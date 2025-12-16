export interface Transaction {
  id: string
  text: string
  amount: number | null
  date: string | null
  description: string | null
  category: string | null
  confidence: number
  organizationId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TransactionListResponse {
  items: Transaction[]
  nextCursor: string | null
  hasMore: boolean
  count: number
}

export interface ExtractTransactionRequest {
  text: string
  organizationId: string
}

export interface ExtractTransactionResponse extends Transaction {}
