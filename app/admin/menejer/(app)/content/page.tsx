export const dynamic = "force-dynamic";
import { getSetting, COMPETITION_INFO_KEY } from "@/lib/settings";
import { getGamePeriod, getGameState, toTashkentInput } from "@/lib/gamePeriod";
import CompetitionInfoManager from "@/components/admin/CompetitionInfoManager";
import GamePeriodManager from "@/components/admin/GamePeriodManager";

export default async function ContentPage() {
  const [competitionInfo, period, state] = await Promise.all([
    getSetting(COMPETITION_INFO_KEY),
    getGamePeriod(),
    getGameState(),
  ]);
  return (
    <div className="p-6 sm:p-10">
      <GamePeriodManager
        initialStart={toTashkentInput(period.start)}
        initialEnd={toTashkentInput(period.end)}
        initialStatus={state.status}
      />
      <CompetitionInfoManager initialValue={competitionInfo ?? ""} />
    </div>
  );
}
