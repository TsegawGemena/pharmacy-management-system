import type { PaymentMethod } from "@/lib/types";
import { getOrganization } from "@/lib/api/settings";
import {
  displayReceiptNumber,
  formatReceiptMoney,
  GAMO_LOGO_PATH,
  GAMO_SUPPORT,
  GAMO_TAGLINE,
  paymentLabel,
  splitReceiptDateTime,
  toReceiptNum,
} from "@/lib/receipt-format";

export interface ReceiptLineItem {
  name: string;
  qty: number;
  price: number | string;
  unit?: string;
}

export interface ReceiptData {
  pharmacyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  invoiceNumber: string;
  createdAt?: string;
  date?: string;
  items: ReceiptLineItem[];
  subtotal: number | string;
  vat: number | string;
  total: number | string;
  paymentMethod?: string | PaymentMethod;
  amountTendered?: number | string;
  changeDue?: number | string;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function logoAbsoluteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${GAMO_LOGO_PATH}`;
  }
  return GAMO_LOGO_PATH;
}

/** Fill pharmacy contact fields from organization settings when missing. */
export async function enrichReceiptData(
  data: ReceiptData
): Promise<ReceiptData> {
  try {
    const org = await getOrganization();
    return {
      ...data,
      pharmacyName: data.pharmacyName || org.name || "Gammo Pharmacy",
      address: data.address || "Arbaminch, Ethiopia",
      phone: data.phone || org.phone || undefined,
      email: data.email || org.email || undefined,
    };
  } catch {
    return {
      ...data,
      pharmacyName: data.pharmacyName || "Gammo Pharmacy",
      address: data.address || "Arbaminch, Ethiopia",
    };
  }
}

/** Shared A5 receipt HTML used for print and PDF. */
export function buildReceiptHtml(data: ReceiptData): string {
  const pharmacy = data.pharmacyName || "Gammo Pharmacy";
  const logoUrl = logoAbsoluteUrl();
  const { date, time } = splitReceiptDateTime(data.createdAt, data.date);
  const receiptNo = displayReceiptNumber(data.invoiceNumber);
  const addressLine = data.address || "Arbaminch, Ethiopia";
  const phoneLine = data.phone
    ? `Tel: ${data.phone}`
    : "Tel: +251 911 234 567";

  const rows = data.items
    .map((item, index) => {
      const unit = toReceiptNum(item.price);
      const line = unit * item.qty;
      const unitLine =
        item.unit && item.unit.trim()
          ? `<div class="unit">(${escapeHtml(item.unit.trim())})</div>`
          : "";
      return `<tr>
        <td class="n">${index + 1}</td>
        <td><div class="name">${escapeHtml(item.name)}</div>${unitLine}</td>
        <td class="c">${item.qty}</td>
        <td class="r">${unit.toFixed(2)}</td>
        <td class="r b">${line.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${escapeHtml(receiptNo)}</title>
  <style>
    @page { size: A5 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #0f172a;
      font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      position: relative;
      width: 148mm;
      min-height: 210mm;
      margin: 0 auto;
      padding: 13mm;
      overflow: hidden;
    }
    .watermark {
      position: absolute;
      left: 0;
      right: 0;
      top: 30%;
      height: 36%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 0;
    }
    .watermark img {
      width: 58%;
      max-width: 90mm;
      height: auto;
      opacity: 0.03;
      filter: grayscale(100%);
      object-fit: contain;
    }
    .content { position: relative; z-index: 1; }
    .hdr { text-align: center; }
    .hdr h1 {
      margin: 0;
      font-size: 20px;
      color: #0c4a6e;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    .hdr .sub {
      margin-top: 4px;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #64748b;
      font-weight: 600;
    }
    .divider { margin-top: 12px; border-bottom: 1px solid #cbd5e1; }
    .info {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 9.5px;
      line-height: 1.55;
    }
    .info .left { color: #475569; }
    .info .left strong { color: #1e293b; display: block; font-weight: 600; }
    .info .right { text-align: right; color: #334155; }
    .info .right .lbl { color: #64748b; }
    table.items { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 9.5px; }
    table.items thead { display: table-header-group; }
    table.items tr { page-break-inside: avoid; }
    table.items th {
      text-align: left;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 0 4px 8px;
      border-bottom: 1px solid #94a3b8;
      font-weight: 700;
    }
    table.items td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    table.items td.n { color: #94a3b8; font-family: monospace; width: 24px; }
    table.items td .name { font-weight: 500; color: #1e293b; }
    table.items td .unit { margin-top: 2px; font-size: 8.5px; color: #64748b; }
    table.items td.c, table.items th.c { text-align: center; width: 36px; }
    table.items td.r, table.items th.r { text-align: right; font-variant-numeric: tabular-nums; }
    table.items th.r { white-space: nowrap; }
    table.items td.b { font-weight: 600; color: #0f172a; }
    .totals { margin-top: 16px; margin-left: auto; width: 54%; min-width: 130px; font-size: 10px; }
    .totals .row { display: flex; justify-content: space-between; padding: 2px 0; color: #475569; }
    .totals .row span:last-child { font-variant-numeric: tabular-nums; font-weight: 600; color: #0f172a; }
    .totals .sep { border-top: 1px solid #94a3b8; margin: 6px 0; }
    .totals .grand {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .pay { margin-top: 16px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; }
    .pay-block { margin-left: auto; width: 54%; min-width: 130px; }
    .pay .row { display: flex; justify-content: space-between; }
    .pay .row + .row { margin-top: 4px; color: #475569; }
    .thanks {
      margin-top: 28px;
      text-align: center;
      font-size: 10px;
      color: #475569;
      font-weight: 500;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .gamo { margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .gamo .icon {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .gamo .icon img { width: 14px; height: 14px; object-fit: contain; }
    .gamo .t { font-size: 8.5px; font-weight: 600; color: #475569; }
    .tagline { margin-top: 4px; text-align: center; font-size: 8px; font-style: italic; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="page">
    <div class="watermark" aria-hidden="true">
      <img src="${escapeHtml(logoUrl)}" alt="" />
    </div>
    <div class="content">
      <div class="hdr">
        <h1>${escapeHtml(pharmacy)}</h1>
        <div class="sub">Pharmacy Sales Receipt</div>
      </div>

      <div class="divider"></div>

      <div class="info">
        <div class="left">
          <strong>${escapeHtml(pharmacy)}, Main Branch</strong>
          ${escapeHtml(addressLine)}<br/>
          ${escapeHtml(phoneLine)}
        </div>
        <div class="right">
          <div><span class="lbl">Receipt #:</span> <strong>${escapeHtml(receiptNo)}</strong></div>
          <div><span class="lbl">Date:</span> ${escapeHtml(date)}</div>
          <div><span class="lbl">Time:</span> ${escapeHtml(time)}</div>
        </div>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th class="n">No.</th>
            <th>Medication/Product</th>
            <th class="c">Qty</th>
            <th class="r">Unit Price</th>
            <th class="r">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal:</span><span>${formatReceiptMoney(data.subtotal)} ETB</span></div>
        <div class="row"><span>VAT (15%):</span><span>${formatReceiptMoney(data.vat)} ETB</span></div>
        <div class="sep"></div>
        <div class="grand"><span>Total:</span><span>${formatReceiptMoney(data.total)} ETB</span></div>
      </div>

      <div class="pay">
        <div class="pay-block">
          <div class="row"><strong>Payment Method:</strong><span>${escapeHtml(paymentLabel(data.paymentMethod))}</span></div>
          ${
            data.amountTendered !== undefined
              ? `<div class="row"><span>Amount Paid:</span><span>${formatReceiptMoney(data.amountTendered)} ETB</span></div>`
              : ""
          }
          ${
            data.changeDue !== undefined && toReceiptNum(data.changeDue) > 0
              ? `<div class="row"><span>Change:</span><span>${formatReceiptMoney(data.changeDue)} ETB</span></div>`
              : ""
          }
        </div>
      </div>

      <div class="thanks">Thank you for choosing our pharmacy.</div>
      <div class="gamo">
        <span class="icon"><img src="${escapeHtml(logoUrl)}" alt="" /></span>
        <span class="t">${escapeHtml(GAMO_SUPPORT)}</span>
      </div>
      <div class="tagline">${escapeHtml(GAMO_TAGLINE)}</div>
    </div>
  </div>
</body>
</html>`;
}

/** Open a print window sized for A5 — does not print the app chrome. */
export function printReceiptA5(data: ReceiptData): void {
  const html = buildReceiptHtml(data);
  const win = window.open("", "_blank", "width=560,height=800");
  if (!win) {
    alert("Please allow pop-ups to print the receipt.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  const trigger = () => {
    try {
      win.print();
    } catch {
      /* ignore */
    }
  };
  if (win.document.images.length) {
    let left = win.document.images.length;
    let fired = false;
    const runOnce = () => {
      if (fired) return;
      fired = true;
      setTimeout(trigger, 50);
    };
    const done = () => {
      left -= 1;
      if (left <= 0) runOnce();
    };
    Array.from(win.document.images).forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });
    setTimeout(runOnce, 1200);
  } else {
    setTimeout(trigger, 250);
  }
}

/** Generate and download an A5 PDF matching the printed receipt (with Gamo branding). */
export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const enriched = await enrichReceiptData(data);
  try {
    const { buildReceiptPdfBlob } = await import("@/lib/receipt-pdf");
    const blob = await buildReceiptPdfBlob(enriched);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${enriched.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    printReceiptA5(enriched);
  }
}

/** Print after enriching with organization contact details. */
export async function printReceiptA5Async(data: ReceiptData): Promise<void> {
  const enriched = await enrichReceiptData(data);
  printReceiptA5(enriched);
}
