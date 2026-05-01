import { X } from "lucide-react";
import { useEffect } from "react";
import { useAppLocale } from "../context/AppLocaleContext";

function RuleRow({ tone, title, description }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : tone === "gold"
        ? "border-gold-300/20 bg-gold-300/10 text-gold-300"
        : "border-red-400/20 bg-red-500/10 text-red-200";

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${toneClass}`}>
          {title}
        </span>
      </div>
    </div>
  );
}

function ScoringRulesModal({ open, onClose }) {
  const { t } = useAppLocale();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("rules_modal_title")}
        className="panel relative z-10 w-full max-w-2xl overflow-hidden p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="chip">{t("rules_modal_badge")}</span>
            <h3 className="mt-4 font-display text-2xl font-bold text-white">{t("rules_modal_title")}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{t("rules_modal_intro")}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label={t("rules_modal_close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <RuleRow
            tone="emerald"
            title={t("rules_exact_title")}
            description={t("rules_exact_desc")}
          />
          <RuleRow
            tone="gold"
            title={t("rules_partial_title")}
            description={t("rules_partial_desc")}
          />
          <RuleRow
            tone="red"
            title={t("rules_wrong_title")}
            description={t("rules_wrong_desc")}
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {t("rules_lock_title")}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t("rules_lock_desc")}</p>
        </div>
      </section>
    </div>
  );
}

export default ScoringRulesModal;
