export type WebsiteStatus = 'none' | 'social_only' | 'unreachable' | 'website';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'follow_up'
  | 'interested'
  | 'not_interested'
  | 'closed';

export interface WebsiteAuditResult {
  reachable: boolean;
  https: boolean;
  statusCode: number | null;
  mobileViewport: boolean;
  pageTitle: boolean;
  metaDescription: boolean;
  phoneVisible: boolean;
  whatsappAvailable: boolean;
  contactCTA: boolean;
  bookingCTA: boolean;
  responseTimeMs: number | null;
}

export interface AIAnalysis {
  whyContact: string;
  pitchAngle: string;
  websiteWeaknesses: string[];
  coldCallScript: string;
  generatedAt?: string;
}

export interface Lead {
  id: string;
  businessName: string;
  category: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string | null;
  score: number; // 1 - 10
  leadReason?: string;
  websiteStatus?: WebsiteStatus;
  status?: LeadStatus;
  city?: string;
  notes?: string;
  lastContactedAt?: string | null;
  followUpAt?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  savedAt?: string;
  updatedAt?: string;
  audit?: WebsiteAuditResult | null;
  aiAnalysis?: AIAnalysis | null;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  targetCategory?: string;
  targetLocation?: string;
  createdAt: string;
  leadsCount?: number;
  newCount?: number;
  contactedCount?: number;
  followUpCount?: number;
  interestedCount?: number;
  closedCount?: number;
}

export interface LeadFilterParams {
  phoneRequired: boolean;
  includeNoWebsite: boolean;
  includeHasWebsite: boolean;
  minRating: number; // 0 for Any, 3.0, 4.0, 4.5
  minReviews: number; // 0 for Any, 10, 25, 50, 100
  minScore: number; // 0 for Any, 6, 7, 8, 9, 10
}

export interface LeadSearchParams extends Partial<LeadFilterParams> {
  category: string;
  location: string;
  limit: number;
}

export interface LeadSearchMetrics {
  discoveredCount: number;
  qualifiedCount: number;
  duplicatesRemoved: number;
  noPhoneRemoved: number;
  closedRemoved: number;
}

export interface LeadSearchResponse {
  success: boolean;
  category: string;
  location: string;
  limit: number;
  runId: string;
  datasetId: string;
  status: string;
  metrics: LeadSearchMetrics;
  leads: Lead[];
}
