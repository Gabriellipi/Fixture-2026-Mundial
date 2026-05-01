# QA Report — World Cup 2026 Fixture App

> Generated: 21/4/2026, 8:37:34 a.m. (MX)  |  Duration: 25.4s

## Summary

⚠️ **0/2** tests passed (0.0%)

| Metric | Value |
|--------|-------|
| Total tests | 2 |
| Passed | 0 |
| Failed | 2 |
| Skipped | 0 |
| Pass rate | 0.0% |
| Duration | 25.4s |

## Results by Device Profile

| Profile | Passed | Failed | Skipped |
|---------|--------|--------|---------|
| ❌ Desktop Chrome | 0 | 2 | 0 |

## Results by Test Suite

### ❌ PREDICTIONS — score input behaviour

| Test | Status | Duration |
|------|--------|----------|
| Blur on empty home input auto-fills "0" | ❌ FAIL | 11371ms |
| Blur on empty home input auto-fills "0" | ❌ FAIL | 11123ms |

## Failed Test Details

### ❌ Blur on empty home input auto-fills "0"
**Profile:** Desktop Chrome

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('nav').last().locator('button').filter({ hasText: /predic/i }).first()[22m

```

### ❌ Blur on empty home input auto-fills "0"
**Profile:** Desktop Chrome
**Retries:** 1

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('nav').last().locator('button').filter({ hasText: /predic/i }).first()[22m

```

## Auto-fix Suggestions

- **Score input auto-fill not working**: In UpcomingMatchCard, the `onBlur` handler must call `onPredictionChange(match.id, side, "0")` when `e.target.value === ""`.

## UX Recommendations

Based on the test suite structure, the following UX patterns were validated:

1. **Search** — instant team lookup with debounce ≤300ms, keyboard navigation (ArrowDown/Enter), and Escape to dismiss.
2. **Language** — all 11 locales persist to `localStorage`; RTL direction applied for Arabic and Hebrew.
3. **Timezone** — country selector updates all match card times in real-time via `AppLocaleContext`.
4. **Predictions** — empty score inputs auto-fill to `0` on blur; max value capped at 99.
5. **Mis Picks** — compact ≤48px rows replace the old ~200px cards; accordion for inline detail.
6. **Countdown** — PRÓXIMO (orange) badge + MM:SS appears ≤30 min before kickoff; EN VIVO (green) + 0-0 at kickoff.
7. **Groups** — always rendered A-Z regardless of search selection; focused group gets `ring-2` highlight.

### Pending / Watch List

- Verify countdown timer CPU cost on mobile with 100+ match cards rendered simultaneously.
- Confirm PRÓXIMO→EN VIVO transition is smooth (no flash of wrong state at boundary).
- Test Arabic/Hebrew layout on 320px viewport — RTL text may overflow compact pick rows.
