# 🛡️ ScamShield

**AI-Powered Fraud & Scam Detection Platform**

An intelligent web application that analyzes messages, emails, job postings, URLs, screenshots, and documents to detect scams and phishing attempts in real-time using Google Gemini AI and VirusTotal security data.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [How It Works](#-how-it-works)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔍 6 Types of Scam Detection

1. **Text/Message Analysis** — WhatsApp, SMS, and plain text messages
2. **Email Analysis** — Phishing detection, spoofed senders, malicious links
3. **Job Posting Analysis** — Fake recruitment scams, unrealistic offers
4. **URL/Link Analysis** — Dual-source with Gemini AI + VirusTotal (90+ security engines)
5. **Screenshot Analysis** — Gemini Vision analyzes suspicious chat/payment screenshots
6. **Document Analysis** — Detects forged offer letters, invoices, certificates

### 🎯 Key Capabilities

- **Real-time AI Analysis** — Sub-5-second verdict using Google Gemini 2.5 Flash
- **Dual-Source URL Analysis** — VirusTotal integration for maximum accuracy
- **Vision-Based Detection** — Gemini Vision analyzes images without OCR
- **Detailed Red Flags** — Explains *why* content is flagged
- **Safety Suggestions** — Actionable advice from AI analysis
- **Scam Score** — 0-100 confidence metric with visual gauge
- **Scan History** — Paginated list with type/verdict filters
- **Dashboard Analytics** — Charts showing weekly activity and verdict breakdown
- **Multi-Image Upload** — Analyze multiple document pages together
- **User Accounts** — Persistent scan history across sessions

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js 5.1.0
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (7-day expiry)
- **Password Hashing**: bcrypt
- **AI**: Google Gemini 2.5 Flash API
- **Security Scanning**: VirusTotal API
- **File Upload**: Multer (memory storage, 5MB limit)
- **Validation**: Express middleware

### Frontend
- **UI Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Charts**: Recharts
- **Notifications**: React Toastify
- **Icons**: SVG (custom ScamMeter gauge)

### Infrastructure
- **Database Hosting**: MongoDB Atlas
- **API Keys**: Gemini AI, VirusTotal
- **Environment**: Development via npm

---

## 📁 Project Structure

```
ScamShield/
├── server/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── mongodb.js              # Database connection
│   ├── models/
│   │   ├── userModel.js            # User schema
│   │   └── scanModel.js            # Scan results schema
│   ├── controllers/
│   │   ├── userController.js       # Auth: register, login, profile, delete
│   │   └── scanController.js       # All 6 scan analyzers + data retrieval
│   ├── middlewares/
│   │   └── auth.js                 # JWT verification middleware
│   ├── routes/
│   │   ├── userRoutes.js           # /api/user/* endpoints
│   │   └── scanRoutes.js           # /api/scan/* endpoints
│   ├── .env                        # Environment variables (NOT in git)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   # Entry point
│
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar with dropdown
│   │   │   ├── Login.jsx           # Auth modal (login + register)
│   │   │   ├── Footer.jsx          # Footer branding
│   │   │   └── ScamMeter.jsx       # Animated gauge component
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Dashboard.jsx       # Stats, charts, shortcuts
│   │   │   ├── History.jsx         # Paginated scan history
│   │   │   ├── Profile.jsx         # User account & settings
│   │   │   ├── Result.jsx          # Detailed scan analysis
│   │   │   ├── ScanText.jsx        # Text input form
│   │   │   ├── ScanEmail.jsx       # Email input form
│   │   │   ├── ScanJob.jsx         # Job posting form
│   │   │   ├── ScanUrl.jsx         # URL input form
│   │   │   ├── ScanScreenshot.jsx  # Image upload (drag-drop)
│   │   │   └── ScanDocument.jsx    # Multi-page upload
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global state & API functions
│   │   ├── assets/
│   │   │   └── assets.js           # Static data (scan types, configs)
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx                # App mount point
│   │   └── index.css               # Tailwind + global styles
│   ├── .env                        # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .gitignore                       # Root .gitignore
└── README.md                        # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+ and npm/yarn
- **MongoDB** account (free tier at mongodb.com)
- **Google Gemini API key** (free at ai.google.dev)
- **VirusTotal API key** (free at virustotal.com)

### Step 1: Clone & Navigate

```bash
cd /path/to/ScamShield
```

### Step 2: Server Setup

```bash
cd server
npm install
```

### Step 3: Client Setup

```bash
cd ../client
npm install
```

---

## 🔐 Environment Variables

### Server (.env)

```env
# Port for Express server
PORT=8000

# MongoDB connection string (Atlas or local)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=ScamShield

# JWT secret for signing tokens (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google Gemini API key (get from ai.google.dev)
GEMINI_API_KEY=your_gemini_api_key_here

# VirusTotal API key (get from virustotal.com)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

### Client (.env)

```env
# Backend API base URL
VITE_BACKEND_URL=http://localhost:8000
```

**⚠️ Important**: Never commit `.env` files. They're in `.gitignore` for security.

---

## 🏃 Running the Application

### Terminal 1: Start Backend

```bash
cd server
npm run server
# Listens on http://localhost:8000
# Uses nodemon for auto-reload on file changes
```

### Terminal 2: Start Frontend

```bash
cd client
npm run dev
# Opens http://localhost:5173
# Vite hot-reload enabled
```

### Production Build

```bash
# Server: just run with Node
cd server
node server.js

# Client: build then serve
cd client
npm run build
# Creates optimized dist/ folder
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/user/register` | `{name, email, password}` | `{token, user}` |
| POST | `/api/user/login` | `{email, password}` | `{token, user}` |
| GET | `/api/user/profile` | — | `{user}` |
| DELETE | `/api/user/delete` | — | `{message}` |

### Scan Analysis

| Method | Endpoint | Body/Upload | Returns |
|--------|----------|-------------|---------|
| POST | `/api/scan/text` | `{content}` | `{scan}` |
| POST | `/api/scan/email` | `{content}` | `{scan}` |
| POST | `/api/scan/job` | `{content}` | `{scan}` |
| POST | `/api/scan/url` | `{content}` | `{scan}` |
| POST | `/api/scan/screenshot` | FormData: `files` + `fileNames` | `{scan}` |
| POST | `/api/scan/document` | FormData: `files` + `fileNames` | `{scan}` |

### Data Retrieval

| Method | Endpoint | Query Params | Returns |
|--------|----------|--------------|---------|
| GET | `/api/scan/stats` | — | `{stats, typeStats, weeklyActivity, recentScans}` |
| GET | `/api/scan/history` | `?page=1&type=email&verdict=SCAM` | `{scans, pages, total}` |
| GET | `/api/scan/:id` | — | `{scan}` |
| DELETE | `/api/scan/:id` | — | `{message}` |

**All endpoints require**: `headers: { token: "jwt_token" }` (except register/login)

---

## 🧠 How It Works

### Text/Email/Job/URL Analysis

1. User submits content (form or paste)
2. Frontend calls `/api/scan/{type}` with content
3. Backend sends to Gemini 2.5 Flash with specialized prompt
4. Gemini returns: `{verdict, score, explanation, redFlags[], suggestions[]}`
5. Result saved to MongoDB
6. Frontend navigates to `/result/:id` to display analysis

### URL Analysis (Dual-Source)

1. User submits URL
2. Backend submits to VirusTotal API
3. Waits 3 seconds for VirusTotal to scan (90+ security engines)
4. Fetches VirusTotal results: `{malicious, suspicious, harmless, undetected}`
5. Sends URL + VT stats to Gemini
6. Gemini provides context-aware verdict
7. Result saved and displayed

### Screenshot/Document Analysis

1. User uploads 1-5 image files (drag-drop or click)
2. Files stored in React state as Buffers with blob URL previews
3. Frontend submits FormData with all files + file names
4. Multer middleware parses multipart request
5. Files converted to base64 inlineData for Gemini Vision
6. Gemini Vision analyzes ALL images together (useful for multi-page docs)
7. Single verdict returned for all images combined
8. Result saved with file names

### Authentication Flow

1. User registers → password hashed with bcrypt → user saved to DB
2. Backend generates JWT (expires 7 days) → frontend stores in localStorage
3. Every protected request sends token in headers
4. Middleware verifies JWT → attaches `userId` to `req`
5. Controllers use `req.userId` to filter data (privacy)
6. On page reload, token restored from localStorage → user data refetched
7. Expired token → user sees logout + redirected to home

---

## 📖 Usage Examples

### Example 1: Analyze a Text Message

```javascript
// Frontend: User pastes suspicious SMS
const content = "URGENT: Your bank account will be blocked! Click https://bank-verify.xyz";
await submitTextScan('text', content);

// Backend receives and sends to Gemini with prompt:
// "You are a precise fraud detection AI. Analyze the following text message..."
// Gemini returns:
{
  verdict: "SCAM",
  score: 92,
  explanation: "Classic phishing attempt impersonating bank with urgency and suspicious link",
  redFlags: [
    { flag: "Urgency Language", explanation: "Threatens account blocking" },
    { flag: "Suspicious Domain", explanation: "bank-verify.xyz is not official" },
    { flag: "Social Engineering", explanation: "Creates false time pressure" }
  ],
  suggestions: [
    "Never click links in unsolicited messages",
    "Official banks never ask for passwords via SMS",
    "Visit the website directly by typing the URL"
  ]
}
```

### Example 2: Analyze a URL with VirusTotal

```javascript
// Frontend: User enters suspicious URL
const url = "http://amaz0n-account-verify.com/login";
await submitTextScan('url', url);

// Backend:
// 1. Submits to VirusTotal API
// 2. Waits 3 seconds
// 3. Fetches results: { malicious: 45, suspicious: 12, harmless: 8, undetected: 20 }
// 4. Sends to Gemini with context

// Gemini responds:
{
  verdict: "SCAM",
  score: 98,
  explanation: "VirusTotal flagged by 45+ security engines. Typosquatting of Amazon.",
  redFlags: [
    { flag: "Typosquatting Domain", explanation: "'amaz0n' instead of 'amazon'" },
    { flag: "High Threat Detection", explanation: "45 engines detected as malicious" }
  ]
}
```

### Example 3: Dashboard Analytics

```javascript
// Frontend: User views dashboard
GET /api/scan/stats

// Backend runs 7 MongoDB queries in parallel:
{
  stats: { total: 45, scams: 18, suspicious: 12, safe: 15 },
  typeStats: [
    { _id: 'email', count: 20 },
    { _id: 'url', count: 15 },
    { _id: 'text', count: 10 }
  ],
  weeklyActivity: [
    { _id: "2026-06-01", count: 5 },
    { _id: "2026-06-02", count: 8 },
    ...
  ],
  recentScans: [
    { _id: "...", type: "email", verdict: "SCAM", score: 85 }
  ]
}

// Frontend renders:
// - 4 stat cards (total, scams, suspicious, safe)
// - Bar chart of weekly activity
// - Pie chart of verdict breakdown
// - Horizontal bar of scans by type
// - List of 5 recent scans
```

---

## 🔒 Security

### Protected by Default

- ✅ **JWT Authentication** — 7-day expiry, stored in localStorage
- ✅ **Password Hashing** — bcrypt with 10 rounds
- ✅ **CORS Enabled** — prevents unauthorized cross-origin requests
- ✅ **MongoDB Indexing** — compound index on userId + createdAt for query performance
- ✅ **Ownership Checks** — users can only access their own scans
- ✅ **API Key Protection** — .env excluded from git
- ✅ **No Persistent Storage** — uploaded images sent to Gemini then discarded
- ✅ **Form Validation** — server-side validation on all inputs
- ✅ **Error Messages** — generic messages (e.g., "Invalid email or password" for both cases)

### Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS in Production**: Use HTTPS to protect JWT tokens
3. **Rate Limiting**: Implement on production (prevent brute-force)
4. **MongoDB**: Use strong password, IP whitelist
5. **API Keys**: Rotate regularly, use separate keys for dev/prod
6. **CORS**: Whitelist specific frontend domain in production

---

```
⚠️  Disclaimer: ScamShield provides analysis but is not 100% accurate.
Always use your judgment and report actual scams to authorities.
Stay safe online! 🛡️
```
