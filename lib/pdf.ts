import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const PRIMARY_LIGHT = rgb(72 / 255, 208 / 255, 199 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);
const WHITE = rgb(1, 1, 1);
const PAPER = rgb(0.978, 0.992, 0.99);

const MM_TO_PT = 2.834645669;
const PAGE_W = 210 * MM_TO_PT;
const PAGE_H = 297 * MM_TO_PT;
const MARGIN = 18 * MM_TO_PT * 0.9; // ~16mm
const GUTTER = 4 * MM_TO_PT;
const COLS = 2;
const ROWS = 5;
const CARD_W = (PAGE_W - MARGIN * 2 - GUTTER * (COLS - 1)) / COLS;
const CARD_H = (PAGE_H - MARGIN * 2 - GUTTER * (ROWS - 1)) / ROWS;
const RADIUS = Math.min(CARD_W, CARD_H) * 0.09;

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  return rgb(
    c1.red + (c2.red - c1.red) * t,
    c1.green + (c2.green - c1.green) * t,
    c1.blue + (c2.blue - c1.blue) * t
  );
}

/**
 * pdf-lib has no native rounded-rectangle. Instead we draw everything with
 * sharp corners and, once every fill for a shape is in place, punch 4
 * circles of the surrounding color at its corners — cheap and reliable,
 * with none of the coordinate-flip surprises `drawSvgPath` has for arcs.
 */
function roundCorners(page: PDFPage, x: number, y: number, w: number, h: number, r: number, bg: RGB) {
  page.drawCircle({ x: x + r, y: y + h - r, size: r, color: bg });
  page.drawCircle({ x: x + w - r, y: y + h - r, size: r, color: bg });
  page.drawCircle({ x: x + r, y: y + r, size: r, color: bg });
  page.drawCircle({ x: x + w - r, y: y + r, size: r, color: bg });
}

function verticalGradient(page: PDFPage, x: number, y: number, w: number, h: number, bottom: RGB, top: RGB, steps = 28) {
  const bandH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    page.drawRectangle({ x, y: y + i * bandH, width: w, height: bandH + 0.6, color: lerpColor(bottom, top, t) });
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
  const leftW = w * 0.4;

  // 1. paper base + soft border (sharp for now — the corner mask below rounds it)
  page.drawRectangle({ x, y, width: w, height: h, color: PAPER });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: PRIMARY_LIGHT, borderWidth: 1.1, borderOpacity: 0.6 });

  // 2. left QR block, soft vertical gradient
  verticalGradient(page, x, y, leftW, h, PRIMARY, PRIMARY_LIGHT);

  // 3. round the whole card's 4 outer corners in one pass (works regardless of what's under each corner)
  roundCorners(page, x, y, w, h, r, WHITE);

  // 4. soft glow accent, fully inset so it never bleeds past the teal block
  const glowR = Math.min(leftW, h) * 0.34;
  page.drawCircle({ x: x + leftW * 0.32, y: y + h * 0.78, size: glowR, color: WHITE, opacity: 0.14 });

  // 5. QR plate
  let qrPng = qrCache.get(item.code);
  if (!qrPng) {
    const url = `${baseUrl}/q/${item.code}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 0, width: 480, color: { dark: "#0a0a0a", light: "#ffffff" } });
    const bytes = Uint8Array.from(Buffer.from(dataUrl.split(",")[1], "base64"));
    qrPng = await pdfDoc.embedPng(bytes);
    qrCache.set(item.code, qrPng);
  }

  const qrSize = Math.min(leftW, h) - 40;
  const pad = 7;
  const plateSize = qrSize + pad * 2;
  const plateX = x + (leftW - plateSize) / 2;
  const plateY = y + (h - plateSize) / 2 + 10;
  const plateMaskColor = lerpColor(PRIMARY, PRIMARY_LIGHT, (plateY + plateSize / 2 - y) / h);

  page.drawRectangle({ x: plateX, y: plateY, width: plateSize, height: plateSize, color: WHITE });
  roundCorners(page, plateX, plateY, plateSize, plateSize, 7, plateMaskColor);
  page.drawImage(qrPng, { x: plateX + pad, y: plateY + pad, width: qrSize, height: qrSize });

  // 6. "SCAN ME" pill — opaque white so the text stays crisp.
  // A true stadium shape (radius = half the height) needs the *additive*
  // construction (flat middle + two full end-caps) — the corner-mask trick
  // above only works for small radii, it over-subtracts once r reaches h/2.
  const pillW = 58;
  const pillH = 12;
  const pillR = pillH / 2;
  const pillX = x + (leftW - pillW) / 2;
  const pillY = plateY - pillH - 9;
  page.drawRectangle({ x: pillX + pillR, y: pillY, width: pillW - pillR * 2, height: pillH, color: WHITE });
  page.drawCircle({ x: pillX + pillR, y: pillY + pillR, size: pillR, color: WHITE });
  page.drawCircle({ x: pillX + pillW - pillR, y: pillY + pillR, size: pillR, color: WHITE });
  page.drawText("SCAN ME", { x: pillX + 11, y: pillY + 3.7, size: 5.3, font: fonts.bold, color: PRIMARY });

  // 7. right text zone
  const rightX = x + leftW + 15;
  const rightW = w - leftW - 29;
  let cy = y + h - 24;

  page.drawCircle({ x: rightX + 2, y: cy + 2.3, size: 2, color: PRIMARY });
  page.drawText("PDP University", { x: rightX + 8, y: cy, size: 7, font: fonts.bold, color: PRIMARY });
  cy -= 17;
  page.drawText("QUIZZES WEEK", { x: rightX, y: cy, size: 15, font: fonts.bold, color: DARK });
  cy -= 15;

  const siteHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  page.drawText("QR kodni skanerlang", { x: rightX, y: cy, size: 6, font: fonts.regular, color: GRAY });
  cy -= 9;
  page.drawText(siteHost, { x: rightX, y: cy, size: 6, font: fonts.bold, color: PRIMARY });
  cy -= 9;
  page.drawText("saytida kodni kiriting", { x: rightX, y: cy, size: 6, font: fonts.regular, color: GRAY });

  // 8. code chip — pale teal tint, rounded (masked with PAPER since it sits on the flat paper zone)
  page.drawText("SAVOL KODI", { x: rightX, y: y + 48, size: 5.5, font: fonts.bold, color: GRAY });
  const chipY = y + 17;
  const chipH = 27;
  const chipW = rightW;
  page.drawRectangle({ x: rightX, y: chipY, width: chipW, height: chipH, color: PRIMARY, opacity: 0.07 });
  roundCorners(page, rightX, chipY, chipW, chipH, 8, PAPER);
  page.drawText(item.code, { x: rightX + 13, y: chipY + 7.5, size: 19, font: fonts.bold, color: PRIMARY });
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
