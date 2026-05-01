import { useAppLocale } from "../context/AppLocaleContext";

function ComingSoonScreen({ title, description }) {
  const { t } = useAppLocale();

  return (
    <section className="mt-8">
      <div className="panel premium-card overflow-hidden p-6 sm:p-7">
        <span className="chip">
          {t("ui.comingSoon.badge")}
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>

        <div className="mt-6 rounded-[24px] border border-dashed border-emerald-400/25 bg-emerald-400/5 px-5 py-6">
          <p className="text-sm font-semibold text-white">
            {t("ui.comingSoon.readyTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {t("ui.comingSoon.readyBody")}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ComingSoonScreen;
