import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { Hono } from 'hono'
import { prisma } from '../../lib/db.js'
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  parseTransactionText,
} from '../../lib/transaction.js'
import {
  createOrganization,
  addUserToOrganization,
} from '../../lib/organization.js'

describe('Transaction API', () => {
  let testUser1: any
  let testUser2: any
  let testOrg1: any
  let testOrg2: any

  beforeAll(async () => {
    // Clean up any existing test data first
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'txnuser',
        },
      },
    })

    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: `txnuser1${Date.now()}@test.com`,
        name: 'Transaction User 1',
        emailVerified: true,
      },
    })

    testUser2 = await prisma.user.create({
      data: {
        email: `txnuser2${Date.now()}@test.com`,
        name: 'Transaction User 2',
        emailVerified: true,
      },
    })

    // Verify users were created
    expect(testUser1).toBeDefined()
    expect(testUser1.id).toBeDefined()
    expect(testUser2).toBeDefined()
    expect(testUser2.id).toBeDefined()

    // Create test organizations
    testOrg1 = await createOrganization({
      name: 'Test Org 1',
      slug: `test-org-1-${Date.now()}`,
      creatorUserId: testUser1.id,
    })

    testOrg2 = await createOrganization({
      name: 'Test Org 2',
      slug: `test-org-2-${Date.now()}`,
      creatorUserId: testUser2.id,
    })

    // Verify organizations were created
    expect(testOrg1).toBeDefined()
    expect(testOrg1.id).toBeDefined()
    expect(testOrg2).toBeDefined()
    expect(testOrg2.id).toBeDefined()
  })

  afterAll(async () => {
    // Clean up test data in correct order
    try {
      // First delete all transactions
      await prisma.transaction.deleteMany({
        where: {
          organizationId: {
            in: [testOrg1?.id, testOrg2?.id].filter(Boolean),
          },
        },
      })

      // Then delete organization members
      await prisma.organizationMember.deleteMany({
        where: {
          organizationId: {
            in: [testOrg1?.id, testOrg2?.id].filter(Boolean),
          },
        },
      })

      // Then delete organizations
      await prisma.organization.deleteMany({
        where: {
          id: {
            in: [testOrg1?.id, testOrg2?.id].filter(Boolean),
          },
        },
      })

      // Finally delete users
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [testUser1?.id, testUser2?.id].filter(Boolean),
          },
        },
      })
    } catch (error) {
      console.error('Cleanup error:', error)
    } finally {
      await prisma.$disconnect()
    }
  })

  describe('Transaction Parsing', () => {
    it('should parse transaction with amount and date', async () => {
      const text = 'Starbucks Coffee - ₹420.00 on 11 Dec 2024'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      expect(parsed.amount).toBeGreaterThan(0)
      expect(parsed.date).toBeDefined()
      expect(parsed.confidence).toBeGreaterThan(0)
    })

    it('should parse transaction with Indian currency format', async () => {
      const text = 'Amazon Purchase Rs. 1,500.50 dated 15-12-2024'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      expect(parsed.amount).toBe(1500.5)
    })

    it('should handle transactions without clear amount', async () => {
      const text = 'Some random transaction text'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      expect(parsed.confidence).toBeLessThan(1)
    })

    it('should categorize food transactions', async () => {
      const text = 'Starbucks Coffee ₹450.00'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      expect(parsed.category).toContain('Food')
    })

    it('should categorize shopping transactions', async () => {
      const text = 'Amazon.in Rs 2,500.00'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      expect(parsed.category).toContain('Shopping')
    })

    it('should return positive amounts for debits', async () => {
      const text = 'Debit: -₹1,000.00'

      const parsed = await parseTransactionText(text)

      expect(parsed).toBeDefined()
      if (parsed.amount) {
        expect(parsed.amount).toBeGreaterThan(0)
      }
    })
  })

  describe('Transaction Creation', () => {
    it('should create transaction with all fields', async () => {
      const transaction = await createTransaction({
        text: 'Test transaction ₹100.00',
        amount: 100,
        date: new Date('2024-12-15'),
        description: 'Test purchase',
        category: 'Shopping',
        confidence: 0.95,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      expect(transaction).toBeDefined()
      expect(transaction.id).toBeDefined()
      expect(transaction.amount).toBe(100)
      expect(transaction.organizationId).toBe(testOrg1.id)
      expect(transaction.userId).toBe(testUser1.id)
    })

    it('should create transaction with null optional fields', async () => {
      const transaction = await createTransaction({
        text: 'Unknown transaction',
        amount: null,
        date: null,
        description: null,
        category: null,
        confidence: 0.1,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      expect(transaction).toBeDefined()
      expect(transaction.amount).toBeNull()
      expect(transaction.date).toBeNull()
      expect(transaction.confidence).toBe(0.1)
    })

    it('should store raw text for transactions', async () => {
      const rawText = 'Original bank statement text ₹500.00'
      
      const transaction = await createTransaction({
        text: rawText,
        amount: 500,
        date: new Date(),
        description: 'Parsed description',
        category: 'Other',
        confidence: 0.8,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      expect(transaction.text).toBe(rawText)
    })
  })

  describe('Transaction Retrieval', () => {
    beforeEach(async () => {
      // Clean up existing transactions
      await prisma.transaction.deleteMany({
        where: {
          organizationId: testOrg1.id,
        },
      })
    })

    it('should retrieve transactions for an organization', async () => {
      // Create some test transactions
      await createTransaction({
        text: 'Transaction 1',
        amount: 100,
        date: new Date(),
        description: 'Test 1',
        category: 'Shopping',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      await createTransaction({
        text: 'Transaction 2',
        amount: 200,
        date: new Date(),
        description: 'Test 2',
        category: 'Food & Dining',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      const result = await getTransactions({
        organizationId: testOrg1.id,
        limit: 20,
      })

      expect(result.items).toHaveLength(2)
      expect(result.items[0].organizationId).toBe(testOrg1.id)
    })

    it('should support cursor-based pagination', async () => {
      // Create 5 transactions
      for (let i = 0; i < 5; i++) {
        await createTransaction({
          text: `Transaction ${i}`,
          amount: 100 * (i + 1),
          date: new Date(),
          description: `Test ${i}`,
          category: 'Other',
          confidence: 0.8,
          organizationId: testOrg1.id,
          userId: testUser1.id,
        })
      }

      // Get first page
      const page1 = await getTransactions({
        organizationId: testOrg1.id,
        limit: 2,
      })

      expect(page1.items).toHaveLength(2)
      expect(page1.hasMore).toBe(true)
      expect(page1.nextCursor).toBeDefined()

      // Get second page
      const page2 = await getTransactions({
        organizationId: testOrg1.id,
        limit: 2,
        cursor: page1.nextCursor!,
      })

      expect(page2.items).toHaveLength(2)
      expect(page2.items[0].id).not.toBe(page1.items[0].id)
    })

    it('should retrieve transaction by ID', async () => {
      const created = await createTransaction({
        text: 'Single transaction',
        amount: 150,
        date: new Date(),
        description: 'Single test',
        category: 'Transportation',
        confidence: 0.85,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      const retrieved = await getTransactionById(created.id, testOrg1.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.amount).toBe(150)
    })

    it('should not retrieve transaction from different organization', async () => {
      const created = await createTransaction({
        text: 'Org 1 transaction',
        amount: 300,
        date: new Date(),
        description: 'Private',
        category: 'Other',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      // Try to get with wrong org ID
      const retrieved = await getTransactionById(created.id, testOrg2.id)

      expect(retrieved).toBeNull()
    })
  })

  describe('Data Isolation', () => {
    it('should only return transactions for specified organization', async () => {
      // Create transactions for both orgs
      await createTransaction({
        text: 'Org 1 Txn',
        amount: 100,
        date: new Date(),
        description: 'Org 1',
        category: 'Other',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      await createTransaction({
        text: 'Org 2 Txn',
        amount: 200,
        date: new Date(),
        description: 'Org 2',
        category: 'Other',
        confidence: 0.9,
        organizationId: testOrg2.id,
        userId: testUser2.id,
      })

      // Get transactions for org 1
      const org1Txns = await getTransactions({
        organizationId: testOrg1.id,
        limit: 20,
      })

      // Verify all transactions belong to org 1
      expect(org1Txns.items.length).toBeGreaterThan(0)
      org1Txns.items.forEach((txn) => {
        expect(txn.organizationId).toBe(testOrg1.id)
      })

      // Get transactions for org 2
      const org2Txns = await getTransactions({
        organizationId: testOrg2.id,
        limit: 20,
      })

      // Verify all transactions belong to org 2
      expect(org2Txns.items.length).toBeGreaterThan(0)
      org2Txns.items.forEach((txn) => {
        expect(txn.organizationId).toBe(testOrg2.id)
      })
    })

    it('should enforce organization boundary on retrieval', async () => {
      const org1Transaction = await createTransaction({
        text: 'Sensitive Org 1 data',
        amount: 5000,
        date: new Date(),
        description: 'Private transaction',
        category: 'Transfer',
        confidence: 0.95,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      // User from org 2 should not be able to access org 1 transaction
      const result = await getTransactionById(org1Transaction.id, testOrg2.id)

      expect(result).toBeNull()
    })
  })

  describe('Transaction Sorting', () => {
    beforeEach(async () => {
      await prisma.transaction.deleteMany({
        where: {
          organizationId: testOrg1.id,
        },
      })
    })

    it('should return transactions in descending order by createdAt', async () => {
      // Create transactions with slight delays
      const txn1 = await createTransaction({
        text: 'First',
        amount: 100,
        date: new Date(),
        description: 'First',
        category: 'Other',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const txn2 = await createTransaction({
        text: 'Second',
        amount: 200,
        date: new Date(),
        description: 'Second',
        category: 'Other',
        confidence: 0.9,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      const result = await getTransactions({
        organizationId: testOrg1.id,
        limit: 20,
      })

      expect(result.items[0].id).toBe(txn2.id) // Newest first
      expect(result.items[1].id).toBe(txn1.id)
    })
  })

  describe('Confidence Scores', () => {
    it('should store confidence score with transaction', async () => {
      const transaction = await createTransaction({
        text: 'High confidence transaction ₹500.00',
        amount: 500,
        date: new Date(),
        description: 'Clear transaction',
        category: 'Shopping',
        confidence: 0.98,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      expect(transaction.confidence).toBe(0.98)
    })

    it('should allow low confidence transactions', async () => {
      const transaction = await createTransaction({
        text: 'Unclear text',
        amount: null,
        date: null,
        description: null,
        category: null,
        confidence: 0.05,
        organizationId: testOrg1.id,
        userId: testUser1.id,
      })

      expect(transaction.confidence).toBe(0.05)
      expect(transaction.amount).toBeNull()
    })
  })
})
