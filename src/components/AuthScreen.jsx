import { Globe, Mail } from "lucide-react";
import { useState } from "react";
import { useAppLocale } from "../context/AppLocaleContext";
import BrandLogo from "./BrandLogo";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.805 10.023H12v3.955h5.617c-.242 1.273-.967 2.351-2.06 3.076v2.555h3.33c1.95-1.795 3.078-4.438 3.078-7.609 0-.676-.061-1.325-.16-1.977Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.805 0 5.156-.93 6.875-2.52l-3.33-2.555c-.93.625-2.119.998-3.545.998-2.717 0-5.021-1.834-5.844-4.301H2.713v2.635A9.997 9.997 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.156 13.622A5.982 5.982 0 0 1 5.83 11.7c0-.668.115-1.32.326-1.922V7.143H2.713A9.997 9.997 0 0 0 2 11.7c0 1.602.383 3.116 1.053 4.557l3.103-2.635Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.477c1.521 0 2.885.523 3.961 1.55l2.965-2.966C17.15 2.39 14.8 1.4 12 1.4a9.997 9.997 0 0 0-8.947 5.743l3.443 2.635C6.98 7.31 9.283 5.477 12 5.477Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}


function Divider({ label }) {
  return (
    <div className="relative py-2 text-center text-[10px] uppercase tracking-[0.24em] text-slate-500">
      <span className="relative z-10 bg-slate-950 px-3">{label}</span>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
    </div>
  );
}

function AuthScreen({
  onGoogleSignIn,
  onFacebookSignIn,
  onEmailSignIn,
  authMessage,
  loadingProvider,
  onShowPrivacy,
  onShowTerms,
}) {
  const { availableLanguages, language, setLanguage, t } = useAppLocale();
  const [email, setEmail] = useState("");

  const copy = {
    eyebrow: language === "he" ? "World Cup Fixture 2026" : language === "en" ? "World Cup Fixture 2026" : "Fixture Mundial 2026",
    headline: t("loginTitle"),
    subline: t("loginSub"),
    proof: t("loginFeatures"),
    hint: t("sinClave"),
    emailPlaceholder: t("emailPlaceholder"),
    logoAlt: language === "he" || language === "en" ? "Fixture Mundial 2026 logo" : "Logo Fixture Mundial 2026",
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (!email) return;
    await onEmailSignIn(email);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <section className="panel relative isolate w-full overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='280' height='280' viewBox='0 0 280 280' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 24H256V256H24V24Z' stroke='white' stroke-width='1.4'/%3E%3Cpath d='M140 24V256M24 140H256' stroke='white' stroke-width='1'/%3E%3Ccircle cx='140' cy='140' r='32' stroke='white' stroke-width='1'/%3E%3Cpath d='M24 84H64V196H24M256 84H216V196H256' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: "280px 280px",
          }}
        />

        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-7 sm:px-8 sm:py-9 lg:min-h-[620px] lg:px-10 lg:py-10">
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(247,214,122,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.42),rgba(15,23,42,0.26))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
                  <div className="absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/5" />
                  <div className="absolute inset-x-8 bottom-3 h-16 rounded-full bg-emerald-400/10 blur-3xl" />
                  <BrandLogo
                    alt={copy.logoAlt}
                    className="relative z-10 mx-auto h-auto w-full max-w-[320px] object-contain sm:max-w-[400px] lg:max-w-[460px]"
                  />
                </div>

                <div className="max-w-xl space-y-4 sm:space-y-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                    {copy.eyebrow}
                  </p>
                  <h1 className="max-w-md font-display text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
                    {copy.headline}
                  </h1>
                  <p className="max-w-md text-sm text-slate-300 sm:text-base">
                    {copy.subline}
                  </p>
                </div>
              </div>

              <p className="max-w-xl text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300 sm:text-xs">
                {copy.proof}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 left-4 font-display leading-none text-white/5 sm:left-6 lg:bottom-4"
              style={{ fontSize: "min(20vw, 15rem)" }}
            >
              2026
            </div>
          </div>

          <div className="panel-soft p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.9))] p-5 shadow-[0_28px_80px_rgba(2,6,23,0.45)] sm:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
              <div className="mb-6 flex items-center justify-center sm:mb-8">
                <BrandLogo
                  alt={copy.logoAlt}
                  className="h-14 w-auto object-contain opacity-95 sm:h-16"
                />
              </div>
              <label className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                <Globe size={18} className="text-emerald-400" />
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  aria-label={t("nav_languageMenu")}
                  className="w-full bg-transparent font-semibold text-white outline-none"
                >
                  {availableLanguages.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-3">
                {/* Google */}
                <button
                  onClick={onGoogleSignIn}
                  disabled={!!loadingProvider}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#747775] bg-white px-4 py-4 text-sm font-bold text-[#1f1f1f] shadow-[0_14px_30px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleIcon />
                  {loadingProvider === "google" ? t("auth_google_loading") : t("continuarConGoogle")}
                </button>

                {/* Facebook */}
                <button
                  onClick={onFacebookSignIn}
                  disabled={!!loadingProvider}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#1877F2]/40 bg-[#1877F2] px-4 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(24,119,242,0.15)] transition hover:-translate-y-0.5 hover:bg-[#1565D8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FacebookIcon />
                  {loadingProvider === "facebook" ? t("auth_facebook_loading") : t("continuarConFacebook")}
                </button>


                <Divider label={t("oConEmail")} />

                {/* Email magic link */}
                <form className="space-y-3" onSubmit={handleEmailSubmit}>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                    <Mail size={18} className="text-emerald-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="w-full bg-transparent text-sm text-white placeholder:text-slate-500"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!!loadingProvider}
                    className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-500 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingProvider === "email" ? t("auth_email_loading") : t("entrarConEmail")}
                  </button>
                </form>

                <p className="pt-1 text-center text-xs text-slate-400">
                  {copy.hint}
                </p>

                {authMessage ? (
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    {authMessage}
                  </div>
                ) : null}

                <p className="pt-2 text-center text-xs text-slate-500">
                  Al continuar aceptas nuestros{" "}
                  <button
                    type="button"
                    onClick={() => onShowTerms?.()}
                    className="underline underline-offset-2 transition hover:text-slate-300"
                  >
                    Términos y Condiciones
                  </button>{" "}
                  y{" "}
                  <button
                    type="button"
                    onClick={() => onShowPrivacy?.()}
                    className="underline underline-offset-2 transition hover:text-slate-300"
                  >
                    Política de Privacidad
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthScreen;
