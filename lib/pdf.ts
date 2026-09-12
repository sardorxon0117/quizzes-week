import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const WHITE = rgb(1, 1, 1);

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  return rgb(
    c1.red + (c2.red - c1.red) * t,
    c1.green + (c2.green - c1.green) * t,
    c1.blue + (c2.blue - c1.blue) * t
  );
}
// A white that leans slightly toward the brand color, instead of flat paper white.
const BG = lerpColor(WHITE, PRIMARY, 0.07);

const MM_TO_PT = 2.834645669;
const PAGE_W = 210 * MM_TO_PT;
const PAGE_H = 297 * MM_TO_PT;
const MARGIN = 18 * MM_TO_PT * 0.9; // ~16mm
const GUTTER = 4 * MM_TO_PT;
const COLS = 2;
const ROWS = 5;
const CARD_W = (PAGE_W - MARGIN * 2 - GUTTER * (COLS - 1)) / COLS;
const CARD_H = (PAGE_H - MARGIN * 2 - GUTTER * (ROWS - 1)) / ROWS;
const RADIUS = Math.min(CARD_W, CARD_H) * 0.15;

/**
 * pdf-lib has no native rounded-rectangle. Instead we draw the shape with
 * sharp corners (fill + border in one call) and, once it's fully drawn,
 * punch 4 circles of the surrounding color at its corners — cheap and
 * reliable, with none of the coordinate-flip surprises `drawSvgPath` has
 * for arcs. Only safe for a radius well under half the shape's height.
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

  // 1. card — pale brand-tinted background, one clean rounded border.
  // Built from two solid fills (outer color + inset inner color) rather
  // than pdf-lib's borderColor/borderWidth stroke — with many cards per
  // page the stroked version rendered with a rippled/wavy edge in poppler.
  const cardBorder = 1.4;
  page.drawRectangle({ x, y, width: w, height: h, color: PRIMARY, opacity: 0.55 });
  page.drawRectangle({ x: x + cardBorder, y: y + cardBorder, width: w - cardBorder * 2, height: h - cardBorder * 2, color: BG });
  roundCorners(page, x, y, w, h, r, WHITE);

  // 2. QR frame — a simple rounded primary-colored outline, white inside, QR centered
  const frameSize = h * 0.72;
  const frameX = x + w * 0.07;
  const frameY = y + (h - frameSize) / 2;
  const frameR = frameSize * 0.16;
  const frameBorder = 2.4;
  page.drawRectangle({ x: frameX, y: frameY, width: frameSize, height: frameSize, color: PRIMARY });
  page.drawRectangle({
    x: frameX + frameBorder,
    y: frameY + frameBorder,
    width: frameSize - frameBorder * 2,
    height: frameSize - frameBorder * 2,
    color: WHITE,
  });
  roundCorners(page, frameX, frameY, frameSize, frameSize, frameR, BG);

  const qrPad = frameSize * 0.13;
  const qrSize = frameSize - qrPad * 2;
  let qrPng = qrCache.get(item.code);
  if (!qrPng) {
    const url = `${baseUrl}/q/${item.code}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 0, width: 480, color: { dark: "#0a0a0a", light: "#ffffff" } });
    const bytes = Uint8Array.from(Buffer.from(dataUrl.split(",")[1], "base64"));
    qrPng = await pdfDoc.embedPng(bytes);
    qrCache.set(item.code, qrPng);
  }
  page.drawImage(qrPng, { x: frameX + qrPad, y: frameY + qrPad, width: qrSize, height: qrSize });

  // 3. right side — plain text, nothing else
  const rightX = frameX + frameSize + 20;
  let cy = y + h - 28;
  page.drawText("PDP University", { x: rightX, y: cy, size: 7.5, font: fonts.bold, color: PRIMARY });
  cy -= 19;
  page.drawText("QUIZZES WEEK", { x: rightX, y: cy, size: 14, font: fonts.bold, color: DARK });
  cy -= 20;
  const siteHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  page.drawText(siteHost, { x: rightX, y: cy, size: 7, font: fonts.bold, color: PRIMARY });
  cy -= 34;
  page.drawText(item.code, { x: rightX, y: cy, size: 26, font: fonts.bold, color: DARK });
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
