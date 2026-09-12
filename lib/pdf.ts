import { PDFDocument, PDFFont, PDFPage, PDFPageDrawSVGOptions, StandardFonts, rgb, RGB } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);
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

function roundedRectPath(w: number, h: number, r: number): string {
  return `M ${r},0 H ${w - r} A ${r},${r} 0 0 1 ${w},${r} V ${h - r} A ${r},${r} 0 0 1 ${w - r},${h} H ${r} A ${r},${r} 0 0 1 0,${h - r} V ${r} A ${r},${r} 0 0 1 ${r},0 Z`;
}

/**
 * A genuine rounded rectangle (real arcs, like CSS border-radius) instead of
 * a sharp rect with circles punched over its corners. pdf-lib has no native
 * rounded-rect primitive, so this goes through `drawSvgPath` — the one
 * subtlety is that it expects the shape's *top*-left as `y` (SVG is
 * y-down), which for our normal PDF bottom-left (x, y, w, h) convention
 * means passing `y + h`.
 */
function drawRoundedRect(page: PDFPage, x: number, y: number, w: number, h: number, r: number, opts: PDFPageDrawSVGOptions) {
  page.drawSvgPath(roundedRectPath(w, h, r), { x, y: y + h, ...opts });
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

  // 1. card — pale brand-tinted background, one clean rounded border
  drawRoundedRect(page, x, y, w, h, RADIUS, {
    color: BG,
    borderColor: PRIMARY,
    borderWidth: 1.4,
    borderOpacity: 0.6,
  });

  // 2. QR frame — a simple rounded primary-colored outline, white inside, QR centered
  const frameSize = h * 0.72;
  const frameX = x + w * 0.07;
  const frameY = y + (h - frameSize) / 2;
  const frameR = frameSize * 0.16;
  drawRoundedRect(page, frameX, frameY, frameSize, frameSize, frameR, {
    color: WHITE,
    borderColor: PRIMARY,
    borderWidth: 2.4,
  });

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
  let cy = y + h - 22;
  page.drawText("PDP University", { x: rightX, y: cy, size: 7.5, font: fonts.bold, color: PRIMARY });
  cy -= 16;
  page.drawText("QUIZZES WEEK", { x: rightX, y: cy, size: 13, font: fonts.bold, color: DARK });
  cy -= 17;
  page.drawText("Skaner qiling", { x: rightX, y: cy, size: 7, font: fonts.regular, color: GRAY });
  cy -= 10;
  page.drawText("-- yoki --", { x: rightX, y: cy, size: 6.5, font: fonts.regular, color: GRAY });
  cy -= 10;
  const siteHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  page.drawText(siteHost, { x: rightX, y: cy, size: 7, font: fonts.bold, color: PRIMARY });
  cy -= 10;
  page.drawText("saytiga quyidagi", { x: rightX, y: cy, size: 7, font: fonts.regular, color: GRAY });
  cy -= 9;
  page.drawText("savol kodini kiriting", { x: rightX, y: cy, size: 7, font: fonts.regular, color: GRAY });
  cy -= 20;

  const codeLabel = "Savol kodi: ";
  const codeLabelSize = 7.5;
  const codeSize = 13;
  const formattedCode = item.code.length === 6 ? `${item.code.slice(0, 3)} ${item.code.slice(3)}` : item.code;
  page.drawText(codeLabel, { x: rightX, y: cy, size: codeLabelSize, font: fonts.regular, color: GRAY });
  const labelWidth = fonts.regular.widthOfTextAtSize(codeLabel, codeLabelSize);
  page.drawText(formattedCode, { x: rightX + labelWidth + 4, y: cy - 1, size: codeSize, font: fonts.bold, color: DARK });
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
