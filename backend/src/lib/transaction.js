import { prisma } from './db.js';
import { extractTransactionWithBedrock, isBedrockConfigured, } from './bedrock.js';
/**
 * Parse raw bank statement text to extract transaction details
 * Uses AWS Bedrock AI if configured, otherwise falls back to regex patterns
 */
export async function parseTransactionText(text) {
    // Try using AWS Bedrock if configured
    if (isBedrockConfigured()) {
        try {
            const extracted = await extractTransactionWithBedrock(text);
            // Convert date string to Date object
            let dateObj = null;
            if (extracted.date) {
                try {
                    dateObj = new Date(extracted.date);
                    if (isNaN(dateObj.getTime())) {
                        dateObj = null;
                    }
                }
                catch (e) {
                    dateObj = null;
                }
            }
            return {
                amount: extracted.amount,
                date: dateObj,
                description: extracted.description,
                category: extracted.category,
                confidence: extracted.confidence,
            };
        }
        catch (error) {
            console.error('Bedrock extraction failed, falling back to regex:', error);
            // Fall through to regex parsing
        }
    }
    // Fallback to regex-based parsing
    return parseTransactionTextWithRegex(text);
}
/**
 * Legacy regex-based parsing (fallback)
 * Uses regex patterns to identify amounts, dates, and descriptions
 */
function parseTransactionTextWithRegex(text) {
    let confidence = 0;
    let confidenceFactors = 0;
    // Extract amount - look for Indian Rupee and currency symbols
    let amount = null;
    const amountPatterns = [
        /[₹Rs\.]\s*(-?\d{1,2}(?:,\d{2})*(?:,\d{3})*(?:\.\d{2})?)/, // ₹1,00,000.00 or Rs. 1,234.56
        /(-?\d{1,2}(?:,\d{2})*(?:,\d{3})*(?:\.\d{2})?)\s*(?:INR|Rs|₹)/i, // 1,234.56 INR or Rs
        /Amount:\s*(-?\d{1,3}(?:,\d{2})*(?:,\d{3})*(?:\.\d{2})?)/i, // Amount: -420.00
        /\$\s*(-?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/, // $1,234.56 (fallback)
        /(?:^|\s)(-?\d{1,3}(?:,\d{2})*(?:,\d{3})*(?:\.\d{2})?)(?:\s|$)/, // -1,234.56
    ];
    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            amount = Math.abs(parseFloat(match[1].replace(/,/g, ''))); // Always return positive
            confidence += 0.3;
            confidenceFactors++;
            break;
        }
    }
    // Extract date
    let date = null;
    const datePatterns = [
        /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i, // 11 Dec 2025 (Indian format)
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i, // Jan 15, 2024
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, // DD/MM/YYYY or MM/DD/YYYY
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD
        /Date:\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i, // Date: 11 Dec 2025
    ];
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            try {
                if (match[0].match(/^[A-Za-z]/) || match[0].match(/Date:/i)) {
                    // Month name format - handle both "11 Dec 2025" and "Dec 11, 2025"
                    if (match[1] && match[1].match(/^[A-Za-z]/)) {
                        // "Dec 11, 2025" format
                        date = new Date(`${match[1]} ${match[2]}, ${match[3]}`);
                    }
                    else {
                        // "11 Dec 2025" format
                        date = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
                    }
                }
                else if (match[1].length === 4) {
                    // YYYY-MM-DD
                    date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
                }
                else {
                    // DD/MM/YYYY (Indian format) - swap to MM/DD/YYYY for Date constructor
                    date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
                }
                if (!isNaN(date.getTime())) {
                    confidence += 0.3;
                    confidenceFactors++;
                    break;
                }
                else {
                    date = null;
                }
            }
            catch (e) {
                date = null;
            }
        }
    }
    // Extract description - try to identify merchant or transaction description
    let description = null;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    // Look for lines that aren't just numbers or dates
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip lines that are only numbers, dates, or amounts
        if (trimmed.match(/^[\d\$\.,\/\-\s]+$/))
            continue;
        // Found a descriptive line
        description = trimmed.substring(0, 255); // Limit length
        confidence += 0.2;
        confidenceFactors++;
        break;
    }
    // If we didn't find a description, use the first non-empty line
    if (!description && lines.length > 0) {
        description = lines[0].substring(0, 255);
        confidence += 0.1;
        confidenceFactors++;
    }
    // Extract category - simple keyword matching with Indian brands
    let category = null;
    const categoryKeywords = {
        'Food & Dining': ['restaurant', 'food', 'coffee', 'cafe', 'pizza', 'burger', 'dining', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'starbucks', 'mcdonald', 'kfc', 'domino', 'subway'],
        'Shopping': ['amazon', 'flipkart', 'myntra', 'walmart', 'target', 'store', 'shop', 'retail', 'purchase', 'mall', 'market', 'reliance', 'dmart'],
        'Transportation': ['uber', 'ola', 'rapido', 'lyft', 'gas', 'fuel', 'parking', 'transit', 'taxi', 'train', 'bus', 'metro', 'petrol', 'diesel'],
        'Entertainment': ['movie', 'theater', 'netflix', 'hotstar', 'prime', 'spotify', 'game', 'concert', 'ticket', 'bookmyshow', 'pvr', 'inox'],
        'Utilities': ['electric', 'electricity', 'water', 'internet', 'phone', 'utility', 'bill', 'airtel', 'jio', 'bsnl', 'vodafone', 'mseb', 'bescom'],
        'Healthcare': ['pharmacy', 'doctor', 'medical', 'hospital', 'health', 'dental', 'apollo', 'fortis', 'medplus', 'clinic'],
        'Transfer': ['transfer', 'payment', 'upi', 'neft', 'imps', 'rtgs', 'paytm', 'phonepe', 'gpay', 'googlepay', 'venmo', 'paypal', 'zelle', 'cashapp'],
    };
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            category = cat;
            confidence += 0.2;
            confidenceFactors++;
            break;
        }
    }
    // Normalize confidence to 0-1 range
    const finalConfidence = confidenceFactors > 0 ? Math.min(confidence, 1.0) : 0;
    return {
        amount,
        date,
        description,
        category,
        confidence: finalConfidence,
    };
}
/**
 * Create a transaction in the database
 */
export async function createTransaction(data) {
    return await prisma.transaction.create({
        data,
    });
}
/**
 * Get transactions for an organization with cursor-based pagination
 */
export async function getTransactions(params) {
    const limit = params.limit || 20;
    const cursor = params.cursor;
    const transactions = await prisma.transaction.findMany({
        where: {
            organizationId: params.organizationId,
        },
        take: limit + 1, // Get one extra to check if there are more
        ...(cursor && {
            cursor: {
                id: cursor,
            },
            skip: 1, // Skip the cursor itself
        }),
        orderBy: {
            createdAt: 'desc',
        },
    });
    const hasMore = transactions.length > limit;
    const items = hasMore ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return {
        items,
        nextCursor,
        hasMore,
    };
}
/**
 * Get a single transaction by ID (with organization check)
 */
export async function getTransactionById(id, organizationId) {
    return await prisma.transaction.findFirst({
        where: {
            id,
            organizationId,
        },
    });
}
