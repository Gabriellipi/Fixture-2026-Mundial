// Supabase project ref extracted from VITE_SUPABASE_URL
const SUPABASE_PROJECT_REF = 'gxuptahqmaxhglckygcg';
const SUPABASE_URL = 'https://gxuptahqmaxhglckygcg.supabase.co';
const STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

export const MOCK_USER = {
  id: 'qa-test-user-001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'qa@fixture2026.dev',
  email_confirmed_at: '2025-01-01T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {
    full_name: 'QA Test User',
    name: 'QA Test User',
    email: 'qa@fixture2026.dev',
  },
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

export const MOCK_SESSION = {
  access_token: 'mock-qa-access-token-fixture2026',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 7200,
  refresh_token: 'mock-qa-refresh-token',
  user: MOCK_USER,
};

export const MOCK_PROFILE = {
  id: 'qa-test-user-001',
  full_name: 'QA Test User',
  favorite_team: 'AR',
  preferred_language: 'es',
  reminder_opt_in: false,
  avatar_url: null,
  timezone: 'America/Argentina/Buenos_Aires',
  email: 'qa@fixture2026.dev',
};

const MOCK_PREDICTIONS = [
  {
    id: 'pred-001',
    user_id: 'qa-test-user-001',
    match_id: 'group-A-1',
    home_score: 2,
    away_score: 1,
    status: 'submitted',
    created_at: new Date().toISOString(),
  },
  {
    id: 'pred-002',
    user_id: 'qa-test-user-001',
    match_id: 'group-B-1',
    home_score: 0,
    away_score: 0,
    status: 'draft',
    created_at: new Date().toISOString(),
  },
];

/**
 * Intercepts Supabase REST + auth calls and injects localStorage session.
 * Call before page.goto().
 */
export async function setupAuthMock(page) {
  // Inject session into localStorage before any app script runs
  await page.addInitScript(
    ({ key, session }) => {
      try {
        localStorage.setItem(key, JSON.stringify(session));
      } catch {}
    },
    { key: STORAGE_KEY, session: MOCK_SESSION },
  );

  // Mock auth endpoints
  await page.route(`${SUPABASE_URL}/auth/v1/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USER),
      });
    }
    if (url.includes('/auth/v1/token') || url.includes('/auth/v1/session')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SESSION),
      });
    }
    if (url.includes('/auth/v1/logout')) {
      return route.fulfill({
        status: 204,
        body: '',
      });
    }
    return route.continue();
  });

  // Mock profiles table
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_PROFILE]),
      });
    }
    // POST / PATCH upsert
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PROFILE),
    });
  });

  // Mock predictions table
  await page.route(`${SUPABASE_URL}/rest/v1/predictions*`, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PREDICTIONS),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  // Mock champion_predictions table
  await page.route(`${SUPABASE_URL}/rest/v1/champion_predictions*`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Let everything else through (static assets, etc.)
}

export { SUPABASE_URL, STORAGE_KEY, MOCK_PREDICTIONS };
