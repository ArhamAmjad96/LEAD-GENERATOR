import fs from "fs";
import path from "path";
import { Lead, Campaign, LeadStatus } from "@/types/lead";

interface DatabaseStore {
  leads: Lead[];
  campaigns: Campaign[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "crm_store.json");

// Ensure DB directory and file exist
function initializeDatabase(): DatabaseStore {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseStore = {
      leads: [],
      campaigns: [
        {
          id: "camp-default-1",
          name: "Islamabad Dentists — August Outreach",
          description: "High rating clinics with no web presence",
          targetCategory: "Dentist",
          targetLocation: "Islamabad, Pakistan",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Database read error, reinitializing:", error);
    return { leads: [], campaigns: [] };
  }
}

function writeDatabase(store: DatabaseStore) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function getSavedLeads(options?: {
  status?: LeadStatus | "all";
  campaignId?: string;
  search?: string;
}): Lead[] {
  const store = initializeDatabase();
  let leads = store.leads;

  if (options?.status && options.status !== "all") {
    leads = leads.filter((l) => (l.status || "new") === options.status);
  }

  if (options?.campaignId && options.campaignId !== "all") {
    leads = leads.filter((l) => l.campaignId === options.campaignId);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    leads = leads.filter(
      (l) =>
        l.businessName.toLowerCase().includes(q) ||
        (l.phone && l.phone.includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
    );
  }

  // Sort by updated/saved date descending
  return leads.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.savedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.savedAt || 0).getTime();
    return dateB - dateA;
  });
}

export function saveOrUpdateLead(lead: Lead, campaignId?: string): Lead {
  const store = initializeDatabase();
  const existingIdx = store.leads.findIndex(
    (l) => l.id === lead.id || (lead.phone && l.phone === lead.phone)
  );

  const now = new Date().toISOString();

  let matchedCampaignName: string | undefined = undefined;
  if (campaignId) {
    const camp = store.campaigns.find((c) => c.id === campaignId);
    if (camp) matchedCampaignName = camp.name;
  }

  if (existingIdx >= 0) {
    const existing = store.leads[existingIdx];
    const updated: Lead = {
      ...existing,
      ...lead,
      notes: lead.notes !== undefined ? lead.notes : existing.notes,
      status: lead.status || existing.status || "new",
      campaignId: campaignId || existing.campaignId,
      campaignName: matchedCampaignName || existing.campaignName,
      updatedAt: now,
    };
    store.leads[existingIdx] = updated;
    writeDatabase(store);
    return updated;
  } else {
    const created: Lead = {
      ...lead,
      status: lead.status || "new",
      notes: lead.notes || "",
      campaignId: campaignId || undefined,
      campaignName: matchedCampaignName,
      savedAt: now,
      updatedAt: now,
    };
    store.leads.push(created);
    writeDatabase(store);
    return created;
  }
}

export function bulkSaveLeads(leads: Lead[], campaignId?: string): { saved: number; leads: Lead[] } {
  const savedLeads: Lead[] = [];
  for (const lead of leads) {
    const saved = saveOrUpdateLead(lead, campaignId);
    savedLeads.push(saved);
  }
  return { saved: savedLeads.length, leads: savedLeads };
}

export function updateLeadDetails(
  id: string,
  updates: Partial<Lead>
): Lead | null {
  const store = initializeDatabase();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;

  const existing = store.leads[idx];
  const now = new Date().toISOString();

  const updated: Lead = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  store.leads[idx] = updated;
  writeDatabase(store);
  return updated;
}

export function deleteSavedLead(id: string): boolean {
  const store = initializeDatabase();
  const initialLen = store.leads.length;
  store.leads = store.leads.filter((l) => l.id !== id);
  if (store.leads.length !== initialLen) {
    writeDatabase(store);
    return true;
  }
  return false;
}

export function getCampaignsList(): Campaign[] {
  const store = initializeDatabase();
  const leads = store.leads;

  return store.campaigns.map((camp) => {
    const campLeads = leads.filter((l) => l.campaignId === camp.id);
    return {
      ...camp,
      leadsCount: campLeads.length,
      newCount: campLeads.filter((l) => (l.status || "new") === "new").length,
      contactedCount: campLeads.filter((l) => l.status === "contacted").length,
      followUpCount: campLeads.filter((l) => l.status === "follow_up").length,
      interestedCount: campLeads.filter((l) => l.status === "interested").length,
      closedCount: campLeads.filter((l) => l.status === "closed").length,
    };
  });
}

export function createNewCampaign(
  name: string,
  description?: string,
  targetCategory?: string,
  targetLocation?: string
): Campaign {
  const store = initializeDatabase();
  const newCamp: Campaign = {
    id: `camp-${Date.now()}`,
    name: name.trim(),
    description: description?.trim() || "",
    targetCategory: targetCategory?.trim() || "",
    targetLocation: targetLocation?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  store.campaigns.push(newCamp);
  writeDatabase(store);
  return newCamp;
}

export function deleteCampaignById(id: string): boolean {
  const store = initializeDatabase();
  const initialLen = store.campaigns.length;
  store.campaigns = store.campaigns.filter((c) => c.id !== id);
  if (store.campaigns.length !== initialLen) {
    writeDatabase(store);
    return true;
  }
  return false;
}
