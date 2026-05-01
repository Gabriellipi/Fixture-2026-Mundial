const API_BASE_URL = import.meta.env.VITE_MATCH_CENTER_API_BASE_URL ?? "";
const REQUEST_TIMEOUT_MS = 10_000;
const MATCH_TTL_MS = 15_000;
const EVENTS_TTL_MS = 15_000;

const matchCache = new Map();
const eventsCache = new Map();

function buildUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(path, { retries = 2 } = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = new Error(`Internal match center failed with status ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (retries > 0) {
      const attempt = 3 - retries;
      await sleep(500 * 2 ** attempt);
      return fetchJson(path, { retries: retries - 1 });
    }

    if (error.name === "AbortError") {
      const timeoutError = new Error("Internal match center timeout");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getCached(cache, key, ttl) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCached(cache, key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  });
}

export function isInternalMatchCenterEnabled() {
  return Boolean(API_BASE_URL);
}

export async function getMatchCenterState(matchId) {
  const cacheKey = String(matchId);
  const cached = getCached(matchCache, cacheKey, MATCH_TTL_MS);
  if (cached) {
    return cached;
  }

  const payload = await fetchJson(`/matches/${matchId}`);
  setCached(matchCache, cacheKey, payload);
  return payload;
}

export async function getMatchCenterEvents(matchId, { since = null, type = null } = {}) {
  const query = new URLSearchParams();
  if (since) {
    query.set("since", since);
  }
  if (type) {
    query.set("type", type);
  }

  const cacheKey = `${matchId}:${query.toString()}`;
  const cached = getCached(eventsCache, cacheKey, EVENTS_TTL_MS);
  if (cached) {
    return cached;
  }

  const payload = await fetchJson(`/matches/${matchId}/events${query.toString() ? `?${query.toString()}` : ""}`);
  setCached(eventsCache, cacheKey, payload);
  return payload;
}

export function subscribeMatchCenter(matchId, { onMessage, onError } = {}) {
  if (!isInternalMatchCenterEnabled()) {
    return () => {};
  }

  const streamBase = API_BASE_URL.replace(/\/$/, "");
  const source = new EventSource(`${streamBase}/matches/${matchId}/stream`);

  source.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch (error) {
      onError?.(error);
    }
  };

  source.onerror = (error) => {
    onError?.(error);
  };

  return () => source.close();
}
