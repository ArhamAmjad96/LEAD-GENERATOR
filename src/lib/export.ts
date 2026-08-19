import * as XLSX from "xlsx";
import { Lead } from "@/types/lead";

/**
 * Prepares lead data rows for clean export
 */
export function formatLeadsForExport(leads: Lead[]) {
  return leads.map((lead) => ({
    "Lead Score": `${lead.score}/10`,
    "Business Name": lead.businessName,
    Category: lead.category || "N/A",
    // Prefix phone with quote or format as string so Excel displays raw number correctly
    Phone: lead.phone ? `${lead.phone}` : "No Phone",
    Website: lead.website || "None",
    "Website Status":
      lead.websiteStatus === "none"
        ? "No Website"
        : lead.websiteStatus === "social_only"
        ? "Social Page Only"
        : lead.websiteStatus === "unreachable"
        ? "Unreachable / Down"
        : "Active Website",
    Rating: lead.rating !== null ? lead.rating : "N/A",
    "Review Count": lead.reviewCount !== null ? lead.reviewCount : 0,
    Address: lead.address || "N/A",
    "Google Maps URL": lead.googleMapsUrl || "N/A",
    "Opportunity Reason": lead.leadReason || "",
    "CRM Status": (lead.status || "new").toUpperCase().replace("_", " "),
    Notes: lead.notes || "",
    "Last Contacted": lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "",
    "Follow-up Date": lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : "",
    Campaign: lead.campaignName || "General",
  }));
}

/**
 * Generates and triggers download of formatted CSV file
 */
export function exportLeadsToCSV(leads: Lead[], baseFilename: string = "leads_export") {
  const formattedData = formatLeadsForExport(leads);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(["\ufeff" + csvOutput], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${baseFilename}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers download of native Excel (.xlsx) file with custom column widths
 */
export function exportLeadsToExcel(leads: Lead[], baseFilename: string = "leads_export") {
  const formattedData = formatLeadsForExport(leads);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set nice column widths for readability
  worksheet["!cols"] = [
    { wch: 12 }, // Score
    { wch: 32 }, // Business Name
    { wch: 20 }, // Category
    { wch: 18 }, // Phone
    { wch: 30 }, // Website
    { wch: 18 }, // Website Status
    { wch: 10 }, // Rating
    { wch: 14 }, // Reviews
    { wch: 45 }, // Address
    { wch: 35 }, // Maps URL
    { wch: 45 }, // Opportunity Reason
    { wch: 14 }, // CRM Status
    { wch: 30 }, // Notes
    { wch: 16 }, // Last Contacted
    { wch: 16 }, // Follow-up Date
    { wch: 20 }, // Campaign
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Qualified Leads");

  XLSX.writeFile(workbook, `${baseFilename}_${Date.now()}.xlsx`);
}
