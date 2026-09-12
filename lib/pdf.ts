import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const SECONDARY = rgb(255 / 255, 199 / 255, 0 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);
const WHITE = rgb(1, 1, 1);
const PAPER = rgb(0.995, 0.998, 0.998);

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  return rgb(
    c1.red + (c2.red - c1.red) * t,
    c1.green + (c2.green - c1.green) * t,
    c1.blue + (c2.blue - c1.blue) * t
  );
}
const PALE_PRIMARY = lerpColor(PAPER, PRIMARY, 0.09);

const MM_TO_PT = 2.834645669;
const PAGE_W = 210 * MM_TO_PT;
const PAGE_H = 297 * MM_TO_PT;
const MARGIN = 18 * MM_TO_PT * 0.9; // ~16mm
const GUTTER = 4 * MM_TO_PT;
const COLS = 2;
const ROWS = 5;
const CARD_W = (PAGE_W - MARGIN * 2 - GUTTER * (COLS - 1)) / COLS;
const CARD_H = (PAGE_H - MARGIN * 2 - GUTTER * (ROWS - 1)) / ROWS;
const RADIUS = Math.min(CARD_W, CARD_H) * 0.14;

/**
 * pdf-lib has no native rounded-rectangle. Instead we draw everything with
 * sharp corners and, once every fill for a shape is in place, punch 4
 * circles of the surrounding color at its corners — cheap and reliable,
 * with none of the coordinate-flip surprises `drawSvgPath` has for arcs.
 * Only safe for a *small* radius relative to the shape (well under half its
 * height) — past that the corner circles eat into the middle of the shape
 * instead of just rounding its edges.
 */
function roundCorners(page: PDFPage, x: number, y: number, w: number, h: number, r: number, bg: RGB) {
  page.drawCircle({ x: x + r, y: y + h - r, size: r, color: bg });
  page.drawCircle({ x: x + w - r, y: y + h - r, size: r, color: bg });
  page.drawCircle({ x: x + r, y: y + r, size: r, color: bg });
  page.drawCircle({ x: x + w - r, y: y + r, size: r, color: bg });
}

/** A true stadium/pill shape (radius = half the height) — additive (flat
 * middle + two full end-cap circles) so there's no seam, unlike the corner
 * mask trick above which only works for a small radius. */
function pill(page: PDFPage, x: number, y: number, w: number, h: number, color: RGB) {
  const r = h / 2;
  page.drawRectangle({ x: x + r, y, width: Math.max(w - r * 2, 0), height: h, color });
  page.drawCircle({ x: x + r, y: y + r, size: r, color });
  page.drawCircle({ x: x + w - r, y: y + r, size: r, color });
}

/** Fakes a soft gaussian-blur glow by stacking translucent circles that
 * grow while fading out. Callers must keep `maxR` inside the card's own
 * bounds (with margin) — there's no real clip path, so an oversized blob
 * would bleed onto the page and into the print gutter between cards. */
function softBlob(page: PDFPage, cx: number, cy: number, maxR: number, color: RGB, steps = 6, peakOpacity = 0.35) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    page.drawCircle({ x: cx, y: cy, size: maxR * t, color, opacity: peakOpacity * (1 - t) * 0.9 + 0.02 });
  }
}

export type CardItem = { code: string; question?: string };

type Fonts = { regular: PDFFont; bold: PDFFont };

async function drawCard(
  page: PDFPage,
  x: number,
  y: number,
  item: CardItem,
  baseUrl: string,
  fonts: Fonts,
  qrCache: Map<string, any>,
  pdfDoc: PDFDocument
) {
  const w = CARD_W;
  const h = CARD_H;
  const r = RADIUS;

  // 1. paper base + hairline border
  page.drawRectangle({ x, y, width: w, height: h, color: PAPER });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: PRIMARY, borderWidth: 0.8, borderOpacity: 0.3 });

  // 2. soft blurred glow accents — a splash of the site's "glass" look on
  // paper. Kept well inset so they can never reach the card's edge.
  softBlob(page, x + w - w * 0.16, y + h - h * 0.25, Math.min(w, h) * 0.24, PRIMARY, 6, 0.35);
  softBlob(page, x + w - w * 0.12, y + h * 0.22, Math.min(w, h) * 0.15, SECONDARY, 6, 0.32);

  // 3. round the card's 4 outer corners in one pass
  roundCorners(page, x, y, w, h, r, WHITE);

  // 4. QR chip — a fully-rounded floating module instead of a rectangle
  // bleeding to the card's edge, so the design reads as "few, soft corners"
  // rather than stacked boxes.
  const chipSize = h * 0.75;
  const chipX = x + w * 0.058;
  const chipY = y + (h - chipSize) / 2;
  const chipR = chipSize * 0.09;
  page.drawRectangle({ x: chipX, y: chipY, width: chipSize, height: chipSize, color: PRIMARY });
  roundCorners(page, chipX, chipY, chipSize, chipSize, chipR, PAPER);

  const plateSize = chipSize * 0.68;
  const plateX = chipX + (chipSize - plateSize) / 2;
  const plateTopPad = chipSize * 0.083;
  const plateY = chipY + chipSize - plateTopPad - plateSize;
  const qrPad = plateSize * 0.075;
  const qrSize = plateSize - qrPad * 2;

  let qrPng = qrCache.get(item.code);
  if (!qrPng) {
    const url = `${baseUrl}/q/${item.code}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 0, width: 480, color: { dark: "#0a0a0a", light: "#ffffff" } });
    const bytes = Uint8Array.from(Buffer.from(dataUrl.split(",")[1], "base64"));
    qrPng = await pdfDoc.embedPng(bytes);
    qrCache.set(item.code, qrPng);
  }

  page.drawRectangle({ x: plateX, y: plateY, width: plateSize, height: plateSize, color: WHITE });
  roundCorners(page, plateX, plateY, plateSize, plateSize, plateSize * 0.085, PRIMARY);
  page.drawImage(qrPng, { x: plateX + qrPad, y: plateY + qrPad, width: qrSize, height: qrSize });

  const scanText = "S K A N   Q I L I N G";
  const scanSize = 5.6;
  const scanWidth = fonts.bold.widthOfTextAtSize(scanText, scanSize);
  const scanY = chipY + (plateY - chipY - scanSize) / 2 - 1;
  page.drawText(scanText, {
    x: chipX + (chipSize - scanWidth) / 2,
    y: scanY,
    size: scanSize,
    font: fonts.bold,
    color: WHITE,
  });

  // 5. right text zone — "scan OR enter this code at <site>", explicitly
  const rightX = chipX + chipSize + 14;
  let cy = y + h - 24;

  page.drawCircle({ x: rightX + 2, y: cy + 2.3, size: 2, color: PRIMARY });
  page.drawText("PDP University", { x: rightX + 8, y: cy, size: 7, font: fonts.bold, color: PRIMARY });
  cy -= 17;
  page.drawText("QUIZZES WEEK", { x: rightX, y: cy, size: 13, font: fonts.bold, color: DARK });
  cy -= 17;

  const siteHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  page.drawText("QR kodni skaner qiling", { x: rightX, y: cy, size: 6.2, font: fonts.regular, color: GRAY });
  cy -= 10;
  page.drawText("yoki", { x: rightX, y: cy, size: 6.2, font: fonts.bold, color: PRIMARY });
  cy -= 10;
  page.drawText(siteHost, { x: rightX, y: cy, size: 6.2, font: fonts.bold, color: PRIMARY });
  const hostW = fonts.bold.widthOfTextAtSize(siteHost, 6.2);
  page.drawText(" saytiga", { x: rightX + hostW, y: cy, size: 6.2, font: fonts.regular, color: GRAY });
  cy -= 10;
  page.drawText("quyidagi kodni kiriting:", { x: rightX, y: cy, size: 6.2, font: fonts.regular, color: GRAY });

  // 6. code — a single-color pill highlight (no filled box with hard corners)
  const codeSize = 21;
  const codeW = fonts.bold.widthOfTextAtSize(item.code, codeSize);
  const padX = 15;
  const pillH = 33;
  const pillW = codeW + padX * 2;
  const pillX = rightX;
  const pillY = y + 12;
  pill(page, pillX, pillY, pillW, pillH, PALE_PRIMARY);
  page.drawText(item.code, {
    x: pillX + padX,
    y: pillY + (pillH - codeSize) / 2 + 1,
    size: codeSize,
    font: fonts.bold,
    color: PRIMARY,
  });
}

export async function generateCardsPdf(items: CardItem[], baseUrl: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  const qrCache = new Map<string, any>();
  const perPage = COLS * ROWS;
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  for (let p = 0; p < pageCount; p++) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: WHITE });
    const pageItems = items.slice(p * perPage, p * perPage + perPage);

    for (let i = 0; i < pageItems.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = MARGIN + col * (CARD_W + GUTTER);
      const yTop = PAGE_H - MARGIN - row * (CARD_H + GUTTER);
      const y = yTop - CARD_H;

      await drawCard(page, x, y, pageItems[i], baseUrl, fonts, qrCache, pdfDoc);
    }
  }

  return pdfDoc.save();
}
