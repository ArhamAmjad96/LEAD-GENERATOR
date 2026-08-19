-- =========================================================
-- LeadForge B2B Sales Generator - Supabase Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Searches Table
CREATE TABLE IF NOT EXISTS searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  requested_limit INT NOT NULL DEFAULT 20,
  result_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_category TEXT,
  target_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  apify_place_id TEXT,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  user_id UUID NULL,
  business_name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  rating NUMERIC(3, 1),
  review_count INT DEFAULT 0,
  google_maps_url TEXT,
  website_status TEXT CHECK (website_status IN ('none', 'social_only', 'unreachable', 'website')),
  score INT NOT NULL DEFAULT 6,
  lead_reason TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow_up', 'interested', 'not_interested', 'closed')),
  notes TEXT DEFAULT '',
  last_contacted_at TIMESTAMPTZ NULL,
  follow_up_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Website Audits Table
CREATE TABLE IF NOT EXISTS website_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  reachable BOOLEAN DEFAULT false,
  https BOOLEAN DEFAULT false,
  status_code INT,
  mobile_viewport BOOLEAN DEFAULT false,
  page_title BOOLEAN DEFAULT false,
  meta_description BOOLEAN DEFAULT false,
  phone_visible BOOLEAN DEFAULT false,
  whatsapp_available BOOLEAN DEFAULT false,
  contact_cta BOOLEAN DEFAULT false,
  booking_cta BOOLEAN DEFAULT false,
  response_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for CRM Performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
