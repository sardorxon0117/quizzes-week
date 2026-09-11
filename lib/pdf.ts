import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const PRIMARY = rgb(0 / 255, 175 / 255, 166 / 255);
const SECONDARY = rgb(255 / 255, 199 / 255, 0 / 255);
const DARK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);

const MM_TO_PT = 2.834645669;
const PAGE_W = 210 * MM_TO_PT;
const PAGE_H = 297 * MM_TO_PT;
const MARGIN = 18 * MM_TO_PT * 0.9; // ~16mm
const GUTTER = 6 * MM_TO_PT;
const COLS = 2;
const ROWS = 4;
const CARD_W = (PAGE_W - MARGIN * 2 - GUTTER * (COLS - 1)) / COLS;
const CARD_H = (PAGE_H - MARGIN * 2 - GUTTER * (ROWS - 1)) / ROWS;

export type CardItem = { code: string; question?: string };

export async function generateCardsPdf(items: CardItem[], baseUrl: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const qrCache = new Map<string, any>();

  const perPage = COLS * ROWS;
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  for (let p = 0; p < pageCount; p++) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const pageItems = items.slice(p * perPage, p * perPage + perPage);

    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i];
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      const x = MARGIN + col * (CARD_W + GUTTER);
      const yTop = PAGE_H - MARGIN - row * (CARD_H + GUTTER);
      const y = yTop - CARD_H;

      // card border (thin, geometric — no radius)
      page.drawRectangle({
        x,
        y,
        width: CARD_W,
        height: CARD_H,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.75,
      });

      // left teal geometric block
      const leftW = CARD_W * 0.42;
      page.drawRectangle({
        x,
        y,
        width: leftW,
        height: CARD_H,
        color: PRIMARY,
      });

      // secondary accent strip
      page.drawRectangle({
        x: x + leftW - 4,
        y,
        width: 4,
        height: CARD_H,
        color: SECONDARY,
      });

      // QR code (white plate inside teal block)
      let qrPng = qrCache.get(item.code);
      if (!qrPng) {
        const url = `${baseUrl}/q/${item.code}`;
        const dataUrl = await QRCode.toDataURL(url, {
          margin: 1,
          width: 480,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        const base64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
        qrPng = await pdfDoc.embedPng(bytes);
        qrCache.set(item.code, qrPng);
      }

      const qrSize = Math.min(leftW, CARD_H) - 20;
      const qrPlatePad = 8;
      const plateSize = qrSize + qrPlatePad * 2;
      const plateX = x + (leftW - plateSize) / 2;
      const plateY = y + (CARD_H - plateSize) / 2;

      page.drawRectangle({
        x: plateX,
        y: plateY,
        width: plateSize,
        height: plateSize,
        color: rgb(1, 1, 1),
      });
      page.drawImage(qrPng, {
        x: plateX + qrPlatePad,
        y: plateY + qrPlatePad,
        width: qrSize,
        height: qrSize,
      });

      // right text zone
      const rightX = x + leftW + 14;
      const rightW = CARD_W - leftW - 24;
      let cursorY = y + CARD_H - 26;

      page.drawText("QUIZZES", {
        x: rightX,
        y: cursorY,
        size: 15,
        font: helveticaBold,
        color: DARK,
      });
      cursorY -= 16;
      page.drawText("WEEK", {
        x: rightX,
        y: cursorY,
        size: 15,
        font: helveticaBold,
        color: PRIMARY,
      });
      cursorY -= 14;
      page.drawText("PDP University", {
        x: rightX,
        y: cursorY,
        size: 8,
        font: helvetica,
        color: GRAY,
      });

      cursorY -= 20;
      page.drawText("QR kodni skanerlang", {
        x: rightX,
        y: cursorY,
        size: 7.5,
        font: helvetica,
        color: GRAY,
      });

      // code at bottom, large & bold
      const codeSize = 24;
      page.drawText(item.code, {
        x: rightX,
        y: y + 16,
        size: codeSize,
        font: helveticaBold,
        color: DARK,
      });

      // baseline rule above code
      page.drawLine({
        start: { x: rightX, y: y + 40 },
        end: { x: x + CARD_W - 12, y: y + 40 },
        thickness: 0.75,
        color: rgb(0.85, 0.85, 0.85),
      });
    }
  }

  return pdfDoc.save();
}
