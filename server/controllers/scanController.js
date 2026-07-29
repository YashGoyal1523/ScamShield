// ============================================================
// scanController.js - Core AI analysis logic for all 6 scan types
// Uses Gemini AI for all analysis + VirusTotal for URL scans
// ============================================================

import mongoose from 'mongoose'               // Needed for ObjectId conversion in aggregation
import { GoogleGenerativeAI } from '@google/generative-ai' // Google's official Gemini SDK
import axios from 'axios'                      // HTTP client for VirusTotal API calls
import scanModel from '../models/scanModel.js' // MongoDB scan model for saving results

// Initialize Gemini client once at the top - reused for all scan requests
// The API key is loaded from process.env (set in .env file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ----------------------------------------------------------------
// buildPrompt - Creates the text prompt sent to Gemini
// This is "prompt engineering" - carefully crafted instructions
// to get structured, accurate, balanced responses from the AI
// ----------------------------------------------------------------
const buildPrompt = (type, content) => `
You are a precise and balanced fraud detection AI. Analyze the following ${type} and give an accurate, honest verdict.

Today's date: ${new Date().toDateString()}
// We include today's date so Gemini doesn't make date-based mistakes (e.g. thinking a past date is "future")

THESE ARE NORMAL - DO NOT FLAG:
- OTP messages from banks, apps, or services (this is standard authentication)
- Delivery notifications from Amazon, Flipkart, Swiggy, Zomato, etc.
- Transactional SMS from banks (debited, credited, balance alerts)
- Marketing emails from known brands even if promotional or urgent
- Job offers with reasonable salary, proper company name, no upfront fee
- Internship offers asking for joining within a week - common in India
- Emails from HR asking for documents like PAN, Aadhaar, college ID
- Newsletters, subscription confirmations, password reset emails you requested
- KYC reminders from banks or RBI-regulated apps via official channels
- URLs from well-known domains: google.com, amazon.in, flipkart.com, paytm.com, phonepe.com, razorpay.com, linkedin.com, naukri.com, etc.

VERDICT GUIDELINES:

SAFE (score 0-30):
- Clean, legitimate content with no concerning elements
- Standard communications from real companies and services
- Score 0-10: Completely clean. Score 11-30: Minor uncertainty but overall fine.

SUSPICIOUS (score 31-60):
- Has one or two concerning elements but NOT conclusive
- KYC reminder or account update request WITHOUT a suspicious link = SUSPICIOUS
- Generic urgency without asking for OTP or money = SUSPICIOUS
- Unknown sender but no clear fraud indicators = SUSPICIOUS
- Score 31-45: Slightly concerning. Score 46-60: Moderately concerning.

SCAM (score 61-100):
- MULTIPLE clear fraud indicators present at the same time
- Urgency + suspicious link + request for OTP/password/money = SCAM
- Upfront fee, registration fee, processing fee to get job or prize = SCAM
- Fake domains impersonating real brands = SCAM
- Lottery or prize you never entered = SCAM
- Score 61-80: Strong indicators. Score 81-100: Definitive scam.

Classic scam patterns (need MULTIPLE to qualify as SCAM):
- Account blocked/suspended + suspicious link + OTP request
- Work from home earning Rs 500-1000/hour for data entry with no experience
- Pay a fee first to unlock salary, prize, or job offer
- Fake domains: sbi-verify.xyz, paypa1.com, gov-india.net, incometax-refund.com
- Threatening arrest or legal action unless you pay immediately
- WhatsApp/Telegram job offers asking to like YouTube videos for money

Content to analyze:
"""
${content}
"""

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "verdict": "SAFE",
  "score": 10,
  "explanation": "2-3 sentences explaining exactly why this verdict was given",
  "redFlags": [],
  "suggestions": ["Relevant suggestion 1", "Relevant suggestion 2"]
}

Rules:
- verdict must match score range exactly
- redFlags must be [] when verdict is SAFE
- suggestions should be relevant to the specific content, not generic
- Do not invent red flags if content is clean
- When uncertain, prefer SAFE or SUSPICIOUS over SCAM
`

// ----------------------------------------------------------------
// parseGeminiResponse - Converts Gemini's text output to a JS object
// Gemini sometimes wraps JSON in markdown code blocks like ```json ... ```
// We strip those and parse the clean JSON
// ----------------------------------------------------------------
const parseGeminiResponse = (text) => {
  try {
    // Remove ```json at the start and ``` at the end if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleaned) // Parse the clean JSON string into a JS object
  } catch {
    // If standard parsing fails, try to find JSON anywhere in the response using regex
    // \{[\s\S]*\} matches everything between the first { and last }
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    // If still can't parse, throw an error - caught by the calling function's catch block
    throw new Error('Failed to parse AI response')
  }
}

// ----------------------------------------------------------------
// normalizeRedFlags - Handles inconsistent redFlags format from Gemini
// Despite our prompt, Gemini sometimes returns strings instead of objects
// This function converts any format into our expected { flag, explanation } structure
// ----------------------------------------------------------------
const normalizeRedFlags = (redFlags) => {
  if (!Array.isArray(redFlags)) return [] // If it's not an array at all, return empty

  return redFlags.map(f => {
    if (typeof f === 'string') {
      // Gemini returned: ["Some flag text"]
      // Convert to: [{ flag: "Some flag text", explanation: "" }]
      return { flag: f, explanation: '' }
    }
    if (typeof f === 'object' && f.flag) {
      // Gemini returned the correct format: [{ flag: "...", explanation: "..." }]
      return f
    }
    return null // Unknown format - filter it out below
  }).filter(Boolean) // Remove any null values
}

// ----------------------------------------------------------------
// saveScan - Saves the Gemini analysis result to MongoDB
// Called by all 6 scan types after getting Gemini's response
// ----------------------------------------------------------------
const saveScan = async (userId, type, content, result) => {
  const scan = new scanModel({
    userId,                               // The logged-in user's MongoDB _id
    type,                                 // 'text', 'email', 'job', 'url', 'screenshot', 'document'
    content,                              // Original text content or file names
    verdict: result.verdict,              // 'SCAM', 'SUSPICIOUS', or 'SAFE'
    score: result.score,                  // 0-100 number from Gemini
    explanation: result.explanation,      // Gemini's written analysis
    redFlags: normalizeRedFlags(result.redFlags), // Normalized red flags array
    suggestions: result.suggestions || [] // Safety suggestions - fallback to empty array
  })
  await scan.save() // Write to MongoDB
  return scan       // Return the saved document (includes MongoDB _id used for navigation)
}

// ================================================================
// SCAN CONTROLLERS - One for each of the 6 scan types
// Pattern: validate input → call Gemini → parse response → save → return
// ================================================================

// ---- TEXT SCAN ----
// Analyzes SMS, WhatsApp messages, or any plain text
const analyzeText = async (req, res) => {
  const content = req.body.content?.trim() // Trim whitespace from user input
  if (!content) return res.status(400).json({ success: false, message: 'Content is required' })

  try {
    // Get the Gemini model - gemini-2.5-flash is fast and supports the free tier
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Send the prompt to Gemini - result.response.text() returns Gemini's text response
    const result = await model.generateContent(buildPrompt('text message / SMS / WhatsApp message', content))

    // Parse Gemini's text response into a JS object
    const parsed = parseGeminiResponse(result.response.text())

    // Save to MongoDB and get the saved document with its _id
    const scan = await saveScan(req.userId, 'text', content, parsed)

    // Return the saved scan - frontend navigates to /result/:id using scan._id
    res.status(200).json({ success: true, scan })
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- EMAIL SCAN ----
// Analyzes email body for phishing, spoofing, and malicious links
const analyzeEmail = async (req, res) => {
  const content = req.body.content?.trim()
  if (!content) return res.status(400).json({ success: false, message: 'Content is required' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    // We pass extra context in the type string to make Gemini focus on email-specific patterns
    const result = await model.generateContent(buildPrompt('email (check for phishing, spoofing, malicious links, impersonation)', content))
    const parsed = parseGeminiResponse(result.response.text())
    const scan = await saveScan(req.userId, 'email', content, parsed)
    res.status(200).json({ success: true, scan })
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- JOB SCAN ----
// Analyzes job postings for fake recruitment scams
const analyzeJob = async (req, res) => {
  const content = req.body.content?.trim()
  if (!content) return res.status(400).json({ success: false, message: 'Content is required' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(buildPrompt('job posting (check for fake jobs, unrealistic salary, registration fees, work-from-home scams)', content))
    const parsed = parseGeminiResponse(result.response.text())
    const scan = await saveScan(req.userId, 'job', content, parsed)
    res.status(200).json({ success: true, scan })
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- URL SCAN ----
// Dual-source analysis: VirusTotal (90+ security engines) + Gemini AI
const analyzeUrl = async (req, res) => {
  const content = req.body.content?.trim()
  if (!content) return res.status(400).json({ success: false, message: 'URL is required' })

  try {
    let vtContext = '' // Will hold VirusTotal results to append to Gemini prompt

    try {
      // ---- Step 1: Submit URL to VirusTotal ----
      // URLSearchParams formats the URL as form data (required by VirusTotal API)
      const vtSubmit = await axios.post(
        'https://www.virustotal.com/api/v3/urls',
        new URLSearchParams({ url: content }),
        { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      // VirusTotal returns an analysis ID - we use this to fetch the results
      const analysisId = vtSubmit.data.data.id

      // ---- Step 2: Wait 3 seconds ----
      // VirusTotal's 90+ engines need time to scan - if we fetch immediately, results aren't ready
      await new Promise(resolve => setTimeout(resolve, 3000))

      // ---- Step 3: Fetch analysis results ----
      const vtResult = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
      )

      // stats contains: { malicious, suspicious, harmless, undetected }
      const stats = vtResult.data.data.attributes.stats

      // Build a summary string to inject into the Gemini prompt
      vtContext = `\nVirusTotal scan: ${stats.malicious} engines flagged malicious, ${stats.suspicious} flagged suspicious out of ${stats.harmless + stats.malicious + stats.suspicious + stats.undetected} total engines.`

    } catch (vtError) {
      // VirusTotal failure is non-fatal - could be rate limit or API key issue
      // We log it but continue - Gemini will still analyze the URL without VT data
      console.error('VirusTotal error:', vtError.message)
    }

    // Gemini analyzes the URL with VirusTotal context included in the prompt
    // vtContext is either a stats string or '' (empty) if VT failed
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(buildPrompt(`URL/link${vtContext}`, content))
    const parsed = parseGeminiResponse(result.response.text())
    const scan = await saveScan(req.userId, 'url', content, parsed)
    res.status(200).json({ success: true, scan })

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- SCREENSHOT SCAN ----
// Uses Gemini Vision to analyze uploaded images - no OCR needed, Gemini reads images directly
const analyzeScreenshot = async (req, res) => {
  // req.files is populated by multer upload.array() middleware
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'At least one image is required' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Convert each uploaded file to the format Gemini Vision expects
    // req.files[].buffer is the raw image data as a Node.js Buffer
    // .toString('base64') converts binary data to base64 string
    // mimeType tells Gemini what image format it is (image/jpeg, image/png, etc.)
    const imageParts = req.files.map(file => ({
      inlineData: {
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype
      }
    }))

    // Separate prompt for screenshots - focuses on visual fraud indicators
    const prompt = `You are a balanced fraud detection AI. Analyze ${req.files.length > 1 ? 'these screenshots' : 'this screenshot'} and give an honest verdict.

Today's date: ${new Date().toDateString()}

THESE ARE NORMAL - DO NOT FLAG:
- Real UPI payment confirmations from GPay, PhonePe, Paytm, BHIM
- Legitimate bank transaction screenshots (HDFC, SBI, ICICI, Axis, Kotak)
- Normal WhatsApp or SMS conversations even if about money - context matters
- Screenshots of real job offers, invoices, or receipts from known companies
- Payment requests between friends/family for splitting bills

Only flag as SCAM if you see:
- Manipulated or photoshopped transaction amounts or dates
- Fake payment confirmations designed to deceive (wrong sender name, edited amounts)
- Lottery, prize, or inheritance notifications
- Requests to pay a fee to claim a prize or job
- Impersonation of real banks or government bodies with suspicious instructions
- QR codes asking for money (receiving money never requires scanning QR)

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "verdict": "SAFE",
  "score": 10,
  "explanation": "2-3 sentence explanation",
  "redFlags": [],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Scoring: 0-30 SAFE, 31-60 SUSPICIOUS, 61-100 SCAM. redFlags must be [] if SAFE.
When uncertain, prefer SAFE or SUSPICIOUS over SCAM.`

    // Spread imageParts - Gemini receives [prompt, image1, image2, ...]
    // Gemini Vision analyzes ALL images together as a single combined analysis
    const result = await model.generateContent([prompt, ...imageParts])
    const parsed = parseGeminiResponse(result.response.text())

    // Use file names sent from frontend (via FormData 'fileNames' field)
    // Fallback to originalname from multer if fileNames not provided
    const fileNames = req.body.fileNames || req.files.map(f => f.originalname).join(', ')

    // Save file names as content - user can see which files were analyzed in history
    const scan = await saveScan(req.userId, 'screenshot', fileNames, parsed)
    res.status(200).json({ success: true, scan })

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- DOCUMENT SCAN ----
// Uses Gemini Vision to detect forged documents (offer letters, invoices, certificates)
const analyzeDocument = async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'At least one document image is required' })

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const imageParts = req.files.map(file => ({
      inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype }
    }))

    // Separate prompt for documents - focuses on document forgery indicators
    // Includes Indian-specific context (PAN, Aadhaar, remote work + office address)
    const prompt = `You are an expert fraud and document forgery detection AI. Analyze ${req.files.length > 1 ? 'these document images' : 'this document image'} for signs of forgery or fraud.

Today's date: ${new Date().toDateString()}

IMPORTANT - These are NORMAL and should NOT be flagged:
- Company having both a registered office address AND offering remote work - this is standard
- Short acceptance deadlines (2-5 days) for job or internship offers - this is common
- Requesting PAN card, Aadhaar, college ID, or bank details for onboarding - legally required in India
- Internship stipends that seem low or high - not a fraud indicator
- Do NOT speculate about future scams that haven't happened in the document

Only flag as SCAM if there is clear evidence of:
- Upfront payment or registration/processing fee demanded
- Completely fake or unverifiable company name with no web presence
- Visually forged or manipulated document (mismatched fonts, cut-paste signs)
- Requests for OTP, passwords, or financial account credentials
- Lottery, prize, or inheritance claims

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "verdict": "SAFE",
  "score": 10,
  "explanation": "2-3 sentence explanation",
  "redFlags": [],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Scoring: 0-30 SAFE, 31-60 SUSPICIOUS, 61-100 SCAM. redFlags must be [] if SAFE.`

    const result = await model.generateContent([prompt, ...imageParts])
    const parsed = parseGeminiResponse(result.response.text())
    const fileNames = req.body.fileNames || req.files.map(f => f.originalname).join(', ')
    const scan = await saveScan(req.userId, 'document', fileNames, parsed)
    res.status(200).json({ success: true, scan })

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ================================================================
// DATA RETRIEVAL CONTROLLERS
// ================================================================

// ---- GET SCAN HISTORY ----
// Returns paginated list of user's scans with optional filters
// GET /api/scan/history?type=email&verdict=SCAM&page=2
const getScanHistory = async (req, res) => {
  const { type, verdict, page = 1 } = req.query // Extract query params, default page to 1
  const limit = 10 // Show 10 scans per page

  try {
    // Build filter object dynamically
    const filter = { userId: req.userId } // Always filter by current user's scans
    if (type) filter.type = type           // Add type filter only if provided
    if (verdict) filter.verdict = verdict  // Add verdict filter only if provided

    // Count total matching documents for pagination calculation
    const total = await scanModel.countDocuments(filter)

    const scans = await scanModel.find(filter)
      .sort({ createdAt: -1 })              // Newest scans first
      .skip((page - 1) * limit)             // Skip scans from previous pages
      .limit(limit)                          // Only return 10 scans
      .select('type verdict score content createdAt')
      // .select() - only return these fields; leave out redFlags, suggestions, explanation
      // This reduces response size for the list view (full data fetched on result page)

    // pages = total number of pages for frontend pagination buttons
    res.status(200).json({ success: true, scans, total, pages: Math.ceil(total / limit) })

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- GET SCAN BY ID ----
// Returns full details of a single scan for the Result page
const getScanById = async (req, res) => {
  try {
    // findOne with BOTH _id AND userId ensures users can only access their own scans
    // If user A tries to access user B's scan ID, userId won't match → returns null → 404
    const scan = await scanModel.findOne({ _id: req.params.id, userId: req.userId })
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' })
    res.status(200).json({ success: true, scan }) // Returns full scan with all fields
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- DELETE SCAN ----
// Permanently removes a single scan from MongoDB
const deleteScan = async (req, res) => {
  try {
    // findOneAndDelete finds the document AND deletes it in a single atomic operation
    // userId check prevents deleting someone else's scan
    const scan = await scanModel.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' })
    res.status(200).json({ success: true, message: 'Scan deleted successfully' })
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ---- GET DASHBOARD STATS ----
// Returns all data needed for the dashboard in a single API call
// Runs 7 MongoDB queries simultaneously using Promise.all for performance
const getDashboardStats = async (req, res) => {
  try {
    // Convert string userId to MongoDB ObjectId - required for aggregation pipeline $match
    // req.userId comes from JWT as a string, but MongoDB stores it as ObjectId
    const userId = new mongoose.Types.ObjectId(req.userId)

    // Promise.all runs all 7 queries simultaneously (in parallel)
    // Much faster than running them sequentially one by one
    const [total, scams, suspicious, safe, typeStats, weeklyActivity, recentScans] = await Promise.all([

      // 1. Total scans count
      scanModel.countDocuments({ userId }),

      // 2. Scam count
      scanModel.countDocuments({ userId, verdict: 'SCAM' }),

      // 3. Suspicious count
      scanModel.countDocuments({ userId, verdict: 'SUSPICIOUS' }),

      // 4. Safe count
      scanModel.countDocuments({ userId, verdict: 'SAFE' }),

      // 5. Scan count grouped by type - used for horizontal bar chart
      // $match: filter by userId
      // $group: group documents by type field, count each group
      // Result: [{ _id: 'email', count: 5 }, { _id: 'url', count: 3 }, ...]
      scanModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),

      // 6. Daily scan counts for last 7 days - used for weekly bar chart
      // $match: only scans from last 7 days
      // $group: group by date string (formatted as YYYY-MM-DD), count each day
      // $sort: sort chronologically so chart shows oldest to newest
      scanModel.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            // Date.now() - 7 days in milliseconds = date 7 days ago
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            // $dateToString converts MongoDB Date to string like "2026-06-05"
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } } // Sort by date ascending (oldest first)
      ]),

      // 7. Last 5 scans for the recent scans list
      scanModel.find({ userId })
        .sort({ createdAt: -1 })  // Newest first
        .limit(5)                  // Only 5 items for the dashboard list
        .select('type verdict score content createdAt') // Only fields needed for list display
    ])

    res.status(200).json({
      success: true,
      stats: { total, scams, suspicious, safe }, // Summary numbers for stat cards
      typeStats,      // Array for bar chart - scan types breakdown
      weeklyActivity, // Array for bar chart - last 7 days activity
      recentScans     // Array for recent scans list
    })

  } catch (e) {
    console.error(`[${new Date().toISOString()}] Error:`, e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

export {
  analyzeText, analyzeEmail, analyzeJob, analyzeUrl,
  analyzeScreenshot, analyzeDocument,
  getScanHistory, getScanById, deleteScan, getDashboardStats
}
