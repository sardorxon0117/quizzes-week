export type CodeCheckResult =
  | { kind: "ok" }
  | { kind: "not_found" }
  | { kind: "inactive" }
  | { kind: "already_answered"; groupName: string | null }
  | { kind: "network_error" };

/**
 * Shared check used by both the manual code entry and the QR scanner: does
 * this code exist, is it active, and has some group already answered it?
 * Reuses the existing public endpoints — no new API surface needed.
 */
export async function checkQuestionCode(code: string): Promise<CodeCheckResult> {
  try {
    const qRes = await fetch(`/api/questions/${code}`);
    if (qRes.status === 404) return { kind: "not_found" };
    if (!qRes.ok) return { kind: "network_error" };
    const question = await qRes.json();
    if (!question.is_active) return { kind: "inactive" };

    const sRes = await fetch(`/api/submissions?questionId=${question.id}`);
    if (!sRes.ok) return { kind: "network_error" };
    const subData = await sRes.json();
    if (subData.answered) {
      return { kind: "already_answered", groupName: subData.submission?.group_name ?? null };
    }

    return { kind: "ok" };
  } catch {
    return { kind: "network_error" };
  }
}

export function codeCheckMessage(result: CodeCheckResult): string {
  switch (result.kind) {
    case "not_found":
      return "Bunday savol kodi topilmadi.";
    case "inactive":
      return "Bu savol hozir faol emas.";
    case "already_answered":
      return `Bu savolga ${result.groupName ?? "boshqa guruh"} tomonidan javob berilgan.`;
    case "network_error":
      return "Tekshirishda xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}
