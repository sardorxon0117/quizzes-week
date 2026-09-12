import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);
const WHITE = rgb(1, 1, 1);
const PAPER = rgb(0.99, 0.995, 0.995);

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

  // 1. paper base + a hairline border (sharp for now — the corner mask below rounds it)
  page.drawRectangle({ x, y, width: w, height: h, color: PAPER });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: PRIMARY, borderWidth: 0.9, borderOpacity: 0.35 });

  // 2. left QR block — flat, solid color, no gradient/glow clutter
  page.drawRectangle({ x, y, width: leftW, height: h, color: PRIMARY });

  // 3. round the whole card's 4 outer corners in one pass (works regardless of what's under each corner)
  roundCorners(page, x, y, w, h, r, WHITE);

  // 4. QR plate
  let qrPng = qrCache.get(item.code);
  if (!qrPng) {
    const url = `${baseUrl}/q/${item.code}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 0, width: 480, color: { dark: "#0a0a0a", light: "#ffffff" } });
    const bytes = Uint8Array.from(Buffer.from(dataUrl.split(",")[1], "base64"));
    qrPng = await pdfDoc.embedPng(bytes);
    qrCache.set(item.code, qrPng);
  }

  const qrSize = Math.min(leftW, h) - 46;
  const pad = 7;
  const plateSize = qrSize + pad * 2;
  const plateX = x + (leftW - plateSize) / 2;
  const plateY = y + (h - plateSize) / 2 + 8;

  page.drawRectangle({ x: plateX, y: plateY, width: plateSize, height: plateSize, color: WHITE });
  roundCorners(page, plateX, plateY, plateSize, plateSize, 6, PRIMARY);
  page.drawImage(qrPng, { x: plateX + pad, y: plateY + pad, width: qrSize, height: qrSize });

  // 5. "SCAN ME" — plain letter-spaced caption, no button chrome
  const scanText = "S C A N   M E";
  const scanWidth = fonts.bold.widthOfTextAtSize(scanText, 6.5);
  page.drawText(scanText, {
    x: x + (leftW - scanWidth) / 2,
    y: plateY - 16,
    size: 6.5,
    font: fonts.bold,
    color: WHITE,
  });

  // 6. right text zone
  const rightX = x + leftW + 16;
  let cy = y + h - 24;

  page.drawText("PDP University", { x: rightX, y: cy, size: 7, font: fonts.bold, color: PRIMARY });
  cy -= 17;
  page.drawText("QUIZZES WEEK", { x: rightX, y: cy, size: 15, font: fonts.bold, color: DARK });
  cy -= 16;

  const siteHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  page.drawText("QR kodni skanerlang", { x: rightX, y: cy, size: 6, font: fonts.regular, color: GRAY });
  cy -= 9;
  page.drawText(siteHost, { x: rightX, y: cy, size: 6, font: fonts.bold, color: PRIMARY });
  cy -= 9;
  page.drawText("saytida kodni kiriting", { x: rightX, y: cy, size: 6, font: fonts.regular, color: GRAY });

  // 7. code — a hairline rule + small label + big bold number, no filled chip
  const ruleY = y + 40;
  page.drawLine({
    start: { x: rightX, y: ruleY },
    end: { x: x + w - 16, y: ruleY },
    thickness: 0.75,
    color: PRIMARY,
    opacity: 0.25,
  });
  page.drawText("SAVOL KODI", { x: rightX, y: ruleY - 12, size: 5.5, font: fonts.bold, color: GRAY });
  page.drawText(item.code, { x: rightX, y: y + 10, size: 20, font: fonts.bold, color: DARK });
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
