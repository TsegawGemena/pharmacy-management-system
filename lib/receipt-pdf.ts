import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { buildReceiptHtml, type ReceiptData } from "@/lib/receipt";

const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;

function waitForImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images);
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }
        })
    )
  ).then(() => undefined);
}

/**
 * Render the shared receipt HTML template to a true A5 PDF.
 * Uses the same markup/CSS as print preview — no separate PDF layout.
 */
export async function buildReceiptPdfBlob(data: ReceiptData): Promise<Blob> {
  const html = buildReceiptHtml(data);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:148mm;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Unable to render receipt for PDF.");

    doc.open();
    doc.write(html);
    doc.close();

    await waitForImages(doc);
    await new Promise((resolve) => setTimeout(resolve, 150));

    const page = doc.querySelector(".page") as HTMLElement | null;
    if (!page) throw new Error("Receipt page markup not found.");

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: page.scrollWidth,
      height: page.scrollHeight,
      windowWidth: page.scrollWidth,
      windowHeight: page.scrollHeight,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const imgW = A5_WIDTH_MM;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= A5_HEIGHT_MM) {
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.98),
        "JPEG",
        0,
        0,
        imgW,
        imgH,
        undefined,
        "FAST"
      );
    } else {
      const pxPerMm = canvas.width / A5_WIDTH_MM;
      const pageHeightPx = A5_HEIGHT_MM * pxPerMm;
      let offsetY = 0;
      let pageIndex = 0;

      while (offsetY < canvas.height) {
        if (pageIndex > 0) pdf.addPage("a5", "portrait");

        const sliceH = Math.min(pageHeightPx, canvas.height - offsetY);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d");
        if (!ctx) throw new Error("Unable to slice receipt for PDF pages.");

        ctx.drawImage(
          canvas,
          0,
          offsetY,
          canvas.width,
          sliceH,
          0,
          0,
          canvas.width,
          sliceH
        );

        const sliceHmm = (sliceH * A5_WIDTH_MM) / canvas.width;
        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.98),
          "JPEG",
          0,
          0,
          A5_WIDTH_MM,
          sliceHmm,
          undefined,
          "FAST"
        );

        offsetY += sliceH;
        pageIndex += 1;
      }
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(iframe);
  }
}
