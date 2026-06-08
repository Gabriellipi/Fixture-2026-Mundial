import { FolderHeart, House, MapPinned, Medal, Radio, Rows3, Target, Trophy } from "lucide-react";
import { useAppLocale } from "../context/AppLocaleContext";

function BottomNav({ activeTab, onChange, pendingCount = 0 }) {
  const { t } = useAppLocale();
  const navItems = [
    { id: "inicio", label: t("nav_home"), icon: House },
    { id: "sedes", label: t("nav_hosts"), icon: MapPinned },
    { id: "grupos", label: t("nav_groups"), icon: Rows3 },
    { id: "live", label: t("nav_live"), icon: Radio },
    { id: "predicciones", label: t("nav_predictions"), icon: Target, badge: pendingCount },
    { id: "mispicks", label: t("nav_my_picks"), icon: FolderHeart },
    { id: "ranking", label: t("nav_ranking"), icon: Medal },
    { id: "eliminatorias", label: t("nav_knockout"), icon: Trophy },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4 pb-5 sm:max-w-xl md:hidden lg:max-w-5xl lg:px-6">
      <div className="panel mx-auto grid grid-cols-8 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          const badge = item.badge ?? 0;

          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => onChange(item.id)}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[10px] font-semibold leading-tight transition sm:px-2 sm:text-[11px] ${
                isActive
                  ? "bg-emerald-400/12 text-emerald-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="relative">
                <Icon size={16} className="sm:h-[18px] sm:w-[18px]" />
                {badge > 0 && !isActive && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-0.5 text-[9px] font-black text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className="text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
