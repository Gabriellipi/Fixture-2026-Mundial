// Centralised selector constants — updated from actual component class inspection.
// Prefer getByRole / getByText in tests; use these for hard-to-describe elements.

export const SEL = {
  // ── Auth screen ──────────────────────────────────────────────────────────────
  authGoogleBtn:    'button:has-text("Google")',
  authFacebookBtn:  'button:has-text("Facebook")',
  authEmailInput:   'input[type="email"]',
  authEmailSubmit:  'button:has-text("email")',

  // ── Top navigation ───────────────────────────────────────────────────────────
  topNav:           'nav[aria-label="Primary"]',
  searchToggle:     'header button[aria-label]',   // search icon button
  languageToggle:   'header button[aria-label*="idioma"], header button[aria-label*="language"], header button[aria-label*="Choose"]',
  userMenuToggle:   'header button[aria-label*="identidad"], header button[aria-label*="identity"], header button[aria-label*="Perfil"]',

  // ── Search ───────────────────────────────────────────────────────────────────
  searchInput:      'input[placeholder]',          // inside search dropdown
  searchResults:    'button:has(img + div)',        // result rows (flag + name)

  // ── Language dropdown ────────────────────────────────────────────────────────
  langDropdown:     'div[style*="rgb(2, 15, 42)"]',

  // ── Group tables ─────────────────────────────────────────────────────────────
  groupArticle:     'article[id^="group-"]',
  groupFocusedRing: 'article.ring-2',

  // ── Prediction inputs ────────────────────────────────────────────────────────
  scoreInput:       'input[type="number"][min="0"]',

  // ── Mis Picks rows ───────────────────────────────────────────────────────────
  picksRow:         'button:has(.rounded-full)',    // compact row toggle
  accordion:        '.border-t.border-white\\/5.bg-white\\/\\[0\\.025\\]',

  // ── Countdown / badges ───────────────────────────────────────────────────────
  proximoBadge:     '.border-orange-400\\/30',
  liveSoonBadge:    '.border-emerald-400\\/30.animate-ping',

  // ── Sign out ─────────────────────────────────────────────────────────────────
  signOutBtn:       'button:has(.lucide-log-out), button:has-text("sesión"), button:has-text("Sign out")',
};

/** Tab IDs used by the app's state router */
export const TABS = {
  home:          'inicio',
  hosts:         'sedes',
  groups:        'grupos',
  predictions:   'predicciones',
  myPicks:       'mispicks',
  knockout:      'eliminatorias',
  ranking:       'ranking',
};

export const LANGUAGES = ['es', 'en', 'fr', 'de', 'pt', 'it', 'id', 'ko', 'ja', 'ar', 'he'];
export const RTL_LANGS = ['ar', 'he'];
