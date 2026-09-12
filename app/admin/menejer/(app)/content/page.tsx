export const dynamic = "force-dynamic";
import { getSetting, COMPETITION_INFO_KEY } from "@/lib/settings";
import CompetitionInfoManager from "@/components/admin/CompetitionInfoManager";

export default async function ContentPage() {
  const competitionInfo = await getSetting(COMPETITION_INFO_KEY);
  return (
    <div className="p-6 sm:p-10">
      <CompetitionInfoManager initialValue={competitionInfo ?? ""} />
    </div>
  );
}
