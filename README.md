# LeadForge — B2B Website Sales Lead Generator

**LeadForge** is a modern B2B lead generation platform and sales outreach CRM built with Next.js 15, TypeScript, Tailwind CSS, Apify, and OpenAI. It scrapes local businesses from Google Maps, performs automated website availability and technical audits, computes deterministic 1–10 sales opportunity scores, provides a full outreach CRM pipeline, generates AI-powered cold calling scripts, and exports data to format-safe CSV and native Excel (`.xlsx`) files.

---

## 🌟 Key Features

* **Google Maps Live Scraper**: Apify Actor (`compass/crawler-google-places`) integration for discovering local businesses by niche and location.
* **Lead Qualification & Technical Audit**: Safe server-side audits checking HTTP availability, SSL/HTTPS, mobile viewport tags, and response times.
* **Deterministic 1–10 Opportunity Scoring**:
  * `10/10` — No Website Found (*Highest Sales Priority*)
  * `9/10` — Social Media Only or Broken/Unreachable Website
  * `7–8/10` — Weak Website (missing HTTPS or mobile responsiveness)
  * `5–6/10` — Average Website
  * `1–4/10` — Strong Website
* **Mini Sales CRM (`/my-leads`)**:
  * Status Pipeline: `New`, `Contacted`, `Follow Up`, `Interested`, `Not Interested`, `Closed / Won`.
  * Quick Outreach: Direct 📞 **Call** (`tel:`), 💬 **WhatsApp** (`wa.me`), 🌐 **Website**, and 🗺️ **Google Maps**.
  * Notes & Call Log recording with scheduled follow-up calendar date pickers.
* **OpenAI Sales Pitch & Cold-Call Generator**:
  * Tailored pitch angles based on Google reputation (review volume & star rating).
  * Identified website weaknesses and 30-second conversational opening scripts with 1-click clipboard copy.
  * Intelligent deterministic copywriting fallback when unconfigured.
* **Format-Safe CSV & Excel Export**:
  * One-click downloads with text-protected phone numbers preventing scientific notation in Excel.
* **Executive Analytics Dashboard (`/dashboard`)**:
  * Visual metrics for total leads, high opportunities, active outreach, and conversion rates.
* **Targeted Campaigns (`/campaigns`)**:
  * Create and organize outreach blitzes by city and niche.
* **Pure White Soft UI (Neumorphic) Theme**:
  * Clean daylight tactile aesthetic with pure white raised cards and high-contrast typography.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/ArhamAmjad96/LEAD-GENERATOR.git
cd LEAD-GENERATOR
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:
```env
# Required for live Google Maps scraper
APIFY_TOKEN=your_apify_token_here

# Optional: for OpenAI GPT-4o-mini sales pitch generation
OPENAI_API_KEY=your_openai_key_here

# Optional: for Supabase Cloud PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Scraper**: Apify REST API (`compass/crawler-google-places`)
* **AI Engine**: OpenAI API (`gpt-4o-mini`)
* **Excel Engine**: SheetJS (`xlsx`)
* **Icons**: Lucide React
