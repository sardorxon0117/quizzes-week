import { customAlphabet } from "nanoid";

const generateDigits = customAlphabet("0123456789", 6);

export async function generateUniqueCode(exists: (code: string) => Promise<boolean>): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = generateDigits();
    if (!(await exists(code))) return code;
  }
  throw new Error("Unikal kod generatsiya qilib bo'lmadi");
}
