/** Shared receipt formatting helpers (UI, print HTML, PDF). */

export function toReceiptNum(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  if (!v) return 0;
  return Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
}

export function formatReceiptMoney(v: number | string | undefined): string {
  return toReceiptNum(v).toFixed(2);
}

export function displayReceiptNumber(id: string): string {
  if (/INV-|^[A-Z]/i.test(id)) return id;
  const digits = id.replace(/\D/g, "");
  if (digits.length > 0) return digits.slice(-6).padStart(6, "0");
  return id;
}

export function splitReceiptDateTime(
  iso?: string,
  dateOnly?: string
): { date: string; time: string } {
  const parsed = iso ? new Date(iso) : dateOnly ? new Date(dateOnly) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return { date: dateOnly || "—", time: "—" };
  }
  return {
    date: parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export function paymentLabel(method?: string): string {
  if (!method) return "—";
  const m = method.toLowerCase();
  if (m === "cash") return "Cash";
  if (m === "telebirr") return "Telebirr";
  if (m === "card") return "Card";
  if (m === "bank transfer") return "Bank Transfer";
  return method;
}

export const GAMO_LOGO_PATH = "/gamo-logo.jpg";
export const GAMO_SUPPORT = "Supported by Gamo Development Association";
export const GAMO_TAGLINE =
  "Working together for healthier and stronger communities.";
