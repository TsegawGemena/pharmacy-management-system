import { apiFetch } from "@/lib/api/client";

export interface AlertSettings {
  enabled?: boolean;
  threshold?: number;
  daysBeforeExpiry?: number;
  [key: string]: unknown;
}

export interface OrganizationProfile {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  [key: string]: unknown;
}

export async function getStockAlertSettings(): Promise<AlertSettings> {
  const response = await apiFetch<unknown>("/settings/stock-alerts");
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: AlertSettings }).data;
  }
  return response as AlertSettings;
}

export async function updateStockAlertSettings(
  settings: AlertSettings
): Promise<AlertSettings> {
  const response = await apiFetch<unknown>("/settings/stock-alerts", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: AlertSettings }).data;
  }
  return response as AlertSettings;
}

export async function getExpiryAlertSettings(): Promise<AlertSettings> {
  const response = await apiFetch<unknown>("/settings/expiry-alerts");
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: AlertSettings }).data;
  }
  return response as AlertSettings;
}

export async function updateExpiryAlertSettings(
  settings: AlertSettings
): Promise<AlertSettings> {
  const response = await apiFetch<unknown>("/settings/expiry-alerts", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: AlertSettings }).data;
  }
  return response as AlertSettings;
}

export async function getOrganization(): Promise<OrganizationProfile> {
  const response = await apiFetch<unknown>("/organization");
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: OrganizationProfile }).data;
  }
  return response as OrganizationProfile;
}

export async function updateOrganization(
  profile: OrganizationProfile
): Promise<OrganizationProfile> {
  const response = await apiFetch<unknown>("/organization", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: OrganizationProfile }).data;
  }
  return response as OrganizationProfile;
}
