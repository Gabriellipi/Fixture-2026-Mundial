import { useEffect, useState } from "react";

function LiveGoalNotification({ goalEvent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!goalEvent) {
      return undefined;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 5_000);
    return () => window.clearTimeout(timer);
  }, [goalEvent]);

  if (!goalEvent || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-28 right-4 z-50 max-w-sm rounded-[24px] border border-red-400/25 bg-[linear-gradient(135deg,rgba(239,68,68,0.2),rgba(15,23,42,0.95))] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-200">GOL</p>
      <p className="mt-2 text-lg font-black text-white">{goalEvent.player_name ?? "Jugador"}</p>
      <p className="mt-1 text-sm text-slate-200">
        {goalEvent.team_name ?? "Equipo"} · {goalEvent.minute ?? "?"}'
      </p>
    </div>
  );
}

export default LiveGoalNotification;
