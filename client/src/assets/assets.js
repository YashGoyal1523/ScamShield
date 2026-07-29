// Central data store - all static data used across multiple components lives here
// Changing a value here updates it everywhere it's used automatically

// Array of all 6 scan types - used in Home page cards and Dashboard scan shortcuts
export const scanTypes = [
  {
    id: 'text',
    label: 'Text / Message',
    description: 'Analyze suspicious WhatsApp messages, SMS, or any text',
    path: '/scan/text',
    icon: 'MSG',
    color: '#3b82f6'
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Detect phishing emails, spoofed senders, and malicious links',
    path: '/scan/email',
    icon: 'MAIL',
    color: '#8b5cf6'
  },
  {
    id: 'job',
    label: 'Job Post',
    description: 'Identify fake job offers, recruitment scams, and fraudulent listings',
    path: '/scan/job',
    icon: 'JOB',
    color: '#f97316'
  },
  {
    id: 'url',
    label: 'URL / Link',
    description: 'Check if a website or link is malicious using AI + VirusTotal',
    path: '/scan/url',
    icon: 'URL',
    color: '#eab308'
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    description: 'Upload screenshots of fake payments, chats, or notifications',
    path: '/scan/screenshot',
    icon: 'IMG',
    color: '#ec4899'
  },
  {
    id: 'document',
    label: 'Document',
    description: 'Verify offer letters, invoices, and certificates for forgery',
    path: '/scan/document',
    icon: 'DOC',
    color: '#14b8a6'
  }
]

// Pre-written scam samples for the "Try an example" button on each scan page
// Clicking the button sets the textarea content to these values
export const exampleContent = {
  text: `URGENT: Your SBI bank account will be blocked in 24 hours! Verify immediately: http://sbi-verify-now.xyz and enter your OTP. Failure to do so will result in permanent suspension. Customer Care: +91-9876543210`,
  email: `From: support@paypa1-secure.net
Subject: Your PayPal account has been permanently limited

Dear Valued Customer,

We have noticed unauthorized activity on your PayPal account. To protect you, we have temporarily suspended your account.

Click here to restore access: http://paypal-account-restore.xyz/login

You must verify your identity within 48 hours by entering your login credentials and credit card details, otherwise your account will be permanently closed.

PayPal Security Department`,
  job: `URGENT HIRING - Work From Home - Earn Rs 50,000/month!

No experience required. Just a smartphone.
- Salary: Rs 800-1200 per hour
- Work: Only 2-3 hours daily
- Start immediately

Registration Fee: Rs 999 (Fully refundable after first payout)

Send Rs 999 to UPI: jobs@paytm and WhatsApp your screenshot to +91-9999999999.

Limited seats! Apply now!`
}

// Steps shown in the "How It Works" section on the landing page
export const howItWorks = [
  {
    step: '01',
    title: 'Submit Content',
    description: 'Paste suspicious text, URL, or upload an image of the content you want to check'
  },
  {
    step: '02',
    title: 'AI Analyzes',
    description: 'Gemini AI scans for scam patterns, phishing signals, and fraud indicators instantly'
  },
  {
    step: '03',
    title: 'Get Your Report',
    description: 'Receive a scam score, detailed red flags, and actionable safety suggestions'
  }
]

// Stats shown in the stats bar on the landing page
export const platformStats = [
  { value: '6', label: 'Scan Types' },
  { value: '< 5s', label: 'Analysis Time' },
  { value: 'Gemini', label: 'AI Powered' },
  { value: '100%', label: 'Free to Use' }
]

// Maps each verdict to its Tailwind color classes - used consistently across Result, History, Dashboard
export const verdictConfig = {
  SCAM: {
    label: 'SCAM DETECTED',
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500'
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500'
  },
  SAFE: {
    label: 'SAFE',
    color: '#22c55e',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-500'
  }
}

// Maps scan type IDs to human-readable labels - used in Result page, History list, Dashboard
export const scanTypeLabels = {
  text: 'Text / Message',
  email: 'Email',
  job: 'Job Post',
  url: 'URL / Link',
  screenshot: 'Screenshot',
  document: 'Document'
}
