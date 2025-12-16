import { BedrockRuntimeClient, InvokeModelCommand, } from '@aws-sdk/client-bedrock-runtime';
// Initialize Bedrock client
// Using ap-south-1 (Mumbai) region with global inference profile for Claude Sonnet 4.5
const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
/**
 * Extract transaction details from raw bank statement text using AWS Bedrock (Claude 3)
 * Returns structured transaction data with confidence score
 */
export async function extractTransactionWithBedrock(text) {
    try {
        // Prepare the prompt for Claude
        const prompt = `You are a financial transaction parser for Indian bank statements. Extract transaction details from the following bank statement text and return ONLY a valid JSON object with no additional text or markdown.

Bank Statement Text:
${text}

Extract the following information:
1. amount (number, always as positive value, null if not found)
   - Recognize Indian Rupee (₹, Rs, INR, Rs.)
   - Handle Indian number formats with commas (e.g., ₹1,00,000.00)
   - Extract only the absolute value (e.g., -420.00 should be extracted as 420.00)
   - Remove any negative signs or debit indicators
2. date (ISO 8601 format YYYY-MM-DD, null if not found)
   - Support DD/MM/YYYY, DD-MM-YYYY formats common in India
   - Support "DD Mon YYYY" format (e.g., 11 Dec 2025)
3. description (merchant or transaction description, max 255 chars, null if not found)
4. category (one of: "Food & Dining", "Shopping", "Transportation", "Entertainment", "Utilities", "Healthcare", "Transfer", "Income", "Other", null if uncertain)
5. confidence (number between 0 and 1 indicating extraction confidence)
6. reasoning (brief explanation of categorization)

Categories guidelines:
- Food & Dining: restaurants, cafes, coffee shops, food delivery, swiggy, zomato
- Shopping: retail stores, online shopping, groceries, flipkart, amazon, myntra
- Transportation: fuel, parking, ride-sharing, public transit, ola, uber, rapido
- Entertainment: movies, streaming, games, events, bookmyshow, netflix, hotstar
- Utilities: electricity, water, internet, phone bills, airtel, jio, bsnl
- Healthcare: pharmacies, hospitals, medical services, apollo, fortis
- Transfer: peer-to-peer payments, bank transfers, UPI, NEFT, IMPS, paytm, phonepe, gpay
- Income: salary, refunds, deposits, credits
- Other: anything that doesn't fit above

Return ONLY valid JSON in this exact format:
{
  "amount": 420.00,
  "date": "2025-12-11",
  "description": "STARBUCKS COFFEE MUMBAI",
  "category": "Food & Dining",
  "confidence": 0.95,
  "reasoning": "Coffee shop transaction"
}`;
        // Prepare request for Claude Sonnet 4.5
        // Using the inference profile for global availability
        const modelId = 'global.anthropic.claude-sonnet-4-5-20250929-v1:0';
        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 1000,
            temperature: 0.1, // Low temperature for consistent extraction
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        };
        const command = new InvokeModelCommand({
            modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload),
        });
        // Call Bedrock
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        // Extract the response text
        const responseText = responseBody.content[0].text.trim();
        // Parse JSON from response
        let extracted;
        try {
            // Try to parse the response as JSON directly
            extracted = JSON.parse(responseText);
        }
        catch (e) {
            // If JSON parsing fails, try to extract JSON from markdown code blocks
            const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                extracted = JSON.parse(jsonMatch[1]);
            }
            else {
                // Try to find any JSON object in the response
                const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonObjectMatch) {
                    extracted = JSON.parse(jsonObjectMatch[0]);
                }
                else {
                    throw new Error('Could not extract JSON from response');
                }
            }
        }
        // Validate and sanitize the response
        const result = {
            amount: typeof extracted.amount === 'number' && !isNaN(extracted.amount)
                ? Math.abs(extracted.amount) // Always return positive amount
                : null,
            date: extracted.date || null,
            description: extracted.description
                ? extracted.description.substring(0, 255)
                : null,
            category: extracted.category || null,
            confidence: typeof extracted.confidence === 'number' &&
                extracted.confidence >= 0 &&
                extracted.confidence <= 1
                ? extracted.confidence
                : 0.5,
            reasoning: extracted.reasoning,
        };
        return result;
    }
    catch (error) {
        console.error('Bedrock extraction error:', error);
        // Return a low-confidence result on error
        return {
            amount: null,
            date: null,
            description: null,
            category: null,
            confidence: 0,
            reasoning: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}
/**
 * Check if Bedrock is properly configured
 */
export function isBedrockConfigured() {
    return !!(process.env.AWS_REGION &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY);
}
