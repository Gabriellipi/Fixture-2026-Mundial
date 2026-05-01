import { Globe, LogOut, Search, User2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import BrandLogo from "./BrandLogo";
import { getCountryName, useAppLocale } from "../context/AppLocaleContext";

function TopNav({ activeTab, onChange, onSignOut, onSearchTeam, groups = [], user, onShowPrivacy, onShowTerms, onDeleteAccount }) {
  const { t, language, setLanguage, availableLanguages } = useAppLocale();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const languageRef = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const navItems = useMemo(
    () => [
      { id: "inicio", label: t("nav_home") },
      { id: "sedes", label: t("nav_hosts") },
      { id: "grupos", label: t("nav_groups") },
      { id: "live", label: t("nav_live") },
      { id: "predicciones", label: t("nav_predictions") },
      { id: "mispicks", label: t("nav_my_picks") },
      { id: "ranking", label: t("nav_ranking") },
      { id: "eliminatorias", label: t("nav_knockout") },
    ],
    [t],
  );

  const searchableTeams = useMemo(
    () =>
      groups.flatMap((group) =>
        group.teams.map((team) => ({
          ...team,
          groupId: group.id,
          localizedName: getCountryName(team, t),
        })),
      ),
    [groups, t],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [debouncedQuery]);

  const searchResults = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return searchableTeams
      .filter((team) => {
        const haystack = [
          team.name,
          team.localizedName,
          team.code,
          team.fifaCode,
          ...(team.aliases ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [debouncedQuery, searchableTeams]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setLanguageOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLanguageOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSearchSelect = (team) => {
    onSearchTeam?.(team);
    setQuery("");
    setSearchOpen(false);
  };

  const handleSearchSubmit = () => {
    if (searchResults[0]) {
      handleSearchSelect(searchResults[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/95 backdrop-blur-md">
      <div className="bg-[#111111]">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange("inicio")}
              className="flex items-center gap-3"
            >
              <BrandLogo alt={t("ui.brand.title")} className="h-10 w-auto object-contain sm:h-11" />
            </button>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = item.id === activeTab;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`relative text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-75 ${
                    isActive ? "opacity-100" : "opacity-90"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-3 left-0 h-px bg-white transition-all ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-white">
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((current) => !current);
                  setLanguageOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition hover:bg-white/5"
                aria-label={t("nav_searchPlaceholder")}
                aria-expanded={searchOpen}
              >
                <Search size={19} />
              </button>

              {searchOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-[#0f0f0f] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3">
                    <Search size={16} className="text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setActiveSuggestion((prev) => Math.min(prev + 1, searchResults.length - 1));
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setActiveSuggestion((prev) => Math.max(prev - 1, -1));
                        } else if (event.key === "Enter") {
                          event.preventDefault();
                          const target = activeSuggestion >= 0 ? searchResults[activeSuggestion] : searchResults[0];
                          if (target) handleSearchSelect(target);
                        }
                      }}
                      placeholder={t("nav_searchPlaceholder")}
                      className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <div className="mt-3">
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {t("nav_searchResults")}
                    </p>
                    <div className="mt-2 space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map((team, idx) => (
                          <button
                            key={team.code}
                            type="button"
                            onClick={() => handleSearchSelect(team)}
                            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                              idx === activeSuggestion ? "bg-white/10" : "hover:bg-white/5"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <img src={team.flag} alt={team.localizedName} className="h-7 w-7 shrink-0 rounded-full border border-white/10 object-cover" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{team.localizedName}</p>
                                <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  {t("tournament.group", { id: team.groupId })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : debouncedQuery.trim() ? (
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-4 text-sm text-slate-400">
                          {t("nav_searchNoResults")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative" ref={languageRef}>
              <button
                type="button"
                onClick={() => {
                  setLanguageOpen((current) => !current);
                  setSearchOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition hover:bg-white/5"
                aria-label={t("nav_languageMenu")}
                aria-expanded={languageOpen}
                title={language.toUpperCase()}
              >
                <Globe size={19} />
              </button>

              {languageOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-3xl border border-white/10 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
                  style={{ backgroundColor: "rgb(2, 15, 42)" }}
                >
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {t("nav_languageMenu")}
                  </p>
                  <div className="space-y-0.5">
                    {availableLanguages.map((option) => {
                      const isActive = option.value === language;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setLanguage(option.value);
                            setLanguageOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition"
                          style={
                            isActive
                              ? { color: "rgb(0, 184, 255)", backgroundColor: "rgba(0, 184, 255, 0.1)" }
                              : undefined
                          }
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.color = "rgb(0, 184, 255)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.color = "";
                          }}
                        >
                          <span className={isActive ? "font-semibold" : "text-slate-300"}>{option.label}</span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: isActive ? "rgb(0, 184, 255)" : undefined, opacity: isActive ? 1 : undefined }}
                          >
                            {option.value !== language ? option.value : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((current) => !current);
                  setSearchOpen(false);
                  setLanguageOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 transition hover:border-white/20"
                aria-label={t("identity_badge")}
                aria-expanded={userMenuOpen}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={t("ui.brand.avatarOf", { name: user.name ?? "User" })} className="h-full w-full object-cover" />
                ) : (
                  <User2 size={18} />
                )}
              </button>

              {userMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-3xl border border-white/10 bg-[#0f0f0f] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  {user?.name ? (
                    <p className="truncate px-3 py-2 text-[11px] font-semibold text-slate-400">
                      {user.name}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onShowPrivacy?.(); }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <span className="w-[15px] text-center text-slate-500 text-xs">🔒</span>
                    Privacidad
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onShowTerms?.(); }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <span className="w-[15px] text-center text-slate-500 text-xs">📄</span>
                    Términos
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); onDeleteAccount?.(); }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <span className="w-[15px] text-center text-xs">🗑</span>
                    Eliminar cuenta
                  </button>
                  <div className="my-1 h-px bg-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onSignOut?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <LogOut size={15} className="text-slate-500" />
                    {t("close_session")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
