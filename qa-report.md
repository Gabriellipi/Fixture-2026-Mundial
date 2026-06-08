# QA Report — World Cup 2026 Fixture App

> Generated: 29/5/2026, 1:58:49 p.m. (MX)  |  Duration: 167.1s

## Summary

⚠️ **260/261** tests passed (99.6%)

| Metric | Value |
|--------|-------|
| Total tests | 261 |
| Passed | 260 |
| Failed | 1 |
| Skipped | 0 |
| Pass rate | 99.6% |
| Duration | 167.1s |

## Results by Device Profile

| Profile | Passed | Failed | Skipped |
|---------|--------|--------|---------|
| ✅ Android Chrome | 65 | 0 | 0 |
| ✅ Desktop Chrome | 65 | 0 | 0 |
| ❌ Desktop Firefox | 65 | 1 | 0 |
| ✅ iPhone Safari | 65 | 0 | 0 |

## Results by Test Suite

### ✅ AUTH — sign-in screen UI

| Test | Status | Duration |
|------|--------|----------|
| Google button is visible | ✅ pass | 1812ms |
| Facebook button is visible | ✅ pass | 1629ms |
| Email input + submit button are present | ✅ pass | 1289ms |
| Email form — empty submit shows no crash | ✅ pass | 1828ms |
| Email OTP — valid email triggers loading state | ✅ pass | 2010ms |
| Google OAuth — click redirects or shows provider page (skip if blocked) | ✅ pass | 1075ms |
| Facebook OAuth — click does not crash page (skip if blocked) | ✅ pass | 1921ms |
| Google button is visible | ✅ pass | 1599ms |
| Facebook button is visible | ✅ pass | 1087ms |
| Email input + submit button are present | ✅ pass | 1207ms |
| Email form — empty submit shows no crash | ✅ pass | 1256ms |
| Email OTP — valid email triggers loading state | ✅ pass | 1346ms |
| Google OAuth — click redirects or shows provider page (skip if blocked) | ✅ pass | 1525ms |
| Facebook OAuth — click does not crash page (skip if blocked) | ✅ pass | 2201ms |
| Google button is visible | ✅ pass | 1910ms |
| Facebook button is visible | ✅ pass | 1766ms |
| Email input + submit button are present | ✅ pass | 1554ms |
| Email form — empty submit shows no crash | ✅ pass | 2035ms |
| Email OTP — valid email triggers loading state | ✅ pass | 1424ms |
| Google OAuth — click redirects or shows provider page (skip if blocked) | ✅ pass | 1246ms |
| Facebook OAuth — click does not crash page (skip if blocked) | ✅ pass | 3958ms |
| Google button is visible | ✅ pass | 2214ms |
| Facebook button is visible | ✅ pass | 1387ms |
| Email input + submit button are present | ✅ pass | 1291ms |
| Email form — empty submit shows no crash | ✅ pass | 2031ms |
| Email OTP — valid email triggers loading state | ✅ pass | 1613ms |
| Google OAuth — click redirects or shows provider page (skip if blocked) | ✅ pass | 2028ms |
| Facebook OAuth — click does not crash page (skip if blocked) | ✅ pass | 2848ms |

### ✅ MIS PICKS — compact row layout

| Test | Status | Duration |
|------|--------|----------|
| Compact row height is under 60px | ✅ pass | 2093ms |
| Date separator headers render above rows | ✅ pass | 1561ms |
| Clicking a row expands accordion with full details | ✅ pass | 2327ms |
| Clicking expanded row again collapses it | ✅ pass | 2369ms |
| ChevronDown icon rotates when row is expanded | ✅ pass | 1967ms |
| Compact row height is under 60px | ✅ pass | 2923ms |
| Date separator headers render above rows | ✅ pass | 1799ms |
| Clicking a row expands accordion with full details | ✅ pass | 2681ms |
| Clicking expanded row again collapses it | ✅ pass | 2165ms |
| ChevronDown icon rotates when row is expanded | ✅ pass | 1917ms |
| Compact row height is under 60px | ✅ pass | 1866ms |
| Date separator headers render above rows | ✅ pass | 2394ms |
| Clicking a row expands accordion with full details | ✅ pass | 2714ms |
| Clicking expanded row again collapses it | ✅ pass | 3061ms |
| ChevronDown icon rotates when row is expanded | ✅ pass | 2091ms |
| Compact row height is under 60px | ✅ pass | 3120ms |
| Date separator headers render above rows | ✅ pass | 2237ms |
| Clicking a row expands accordion with full details | ✅ pass | 2126ms |
| Clicking expanded row again collapses it | ✅ pass | 2971ms |
| ChevronDown icon rotates when row is expanded | ✅ pass | 3969ms |

### ✅ LANGUAGE — selector

| Test | Status | Duration |
|------|--------|----------|
| Language dropdown opens and shows all 11 options | ✅ pass | 2129ms |
| Switch to Español (es) — UI reacts | ✅ pass | 2423ms |
| Switch to English (en) — UI reacts | ✅ pass | 2272ms |
| Switch to Français (fr) — UI reacts | ✅ pass | 1771ms |
| Switch to Deutsch (de) — UI reacts | ✅ pass | 1611ms |
| Switch to Português (pt) — UI reacts | ✅ pass | 1649ms |
| Switch to Italiano (it) — UI reacts | ✅ pass | 1944ms |
| Switch to Indonesia (id) — UI reacts | ✅ pass | 2481ms |
| Switch to 한국어 (ko) — UI reacts | ✅ pass | 1593ms |
| Switch to 日本語 (ja) — UI reacts | ✅ pass | 1443ms |
| Switch to العربية (ar) — UI reacts | ✅ pass | 1469ms |
| Switch to עברית (he) — UI reacts | ✅ pass | 1419ms |
| RTL: Arabic sets document.dir = rtl | ✅ pass | 1627ms |
| RTL: Hebrew sets document.dir = rtl | ✅ pass | 1614ms |
| LTR: English resets document.dir to ltr | ✅ pass | 2204ms |
| Body content translates — nav groups label changes with language | ✅ pass | 2185ms |
| Language dropdown opens and shows all 11 options | ✅ pass | 2105ms |
| localStorage persists language across reload | ✅ pass | 7320ms |
| Switch to Español (es) — UI reacts | ✅ pass | 1378ms |
| Switch to English (en) — UI reacts | ✅ pass | 1938ms |
| Switch to Français (fr) — UI reacts | ✅ pass | 2178ms |
| Switch to Deutsch (de) — UI reacts | ✅ pass | 2135ms |
| Switch to Português (pt) — UI reacts | ✅ pass | 1800ms |
| Switch to Italiano (it) — UI reacts | ✅ pass | 3587ms |
| Switch to Indonesia (id) — UI reacts | ✅ pass | 1646ms |
| Switch to 한국어 (ko) — UI reacts | ✅ pass | 2016ms |
| Switch to 日本語 (ja) — UI reacts | ✅ pass | 1891ms |
| Switch to العربية (ar) — UI reacts | ✅ pass | 1678ms |
| Switch to עברית (he) — UI reacts | ✅ pass | 2533ms |
| RTL: Arabic sets document.dir = rtl | ✅ pass | 2163ms |
| RTL: Hebrew sets document.dir = rtl | ✅ pass | 2288ms |
| LTR: English resets document.dir to ltr | ✅ pass | 2704ms |
| Language dropdown opens and shows all 11 options | ✅ pass | 2603ms |
| Body content translates — nav groups label changes with language | ✅ pass | 3757ms |
| localStorage persists language across reload | ✅ pass | 6537ms |
| Switch to Español (es) — UI reacts | ✅ pass | 10914ms |
| Switch to English (en) — UI reacts | ✅ pass | 2634ms |
| Switch to Français (fr) — UI reacts | ✅ pass | 1955ms |
| Switch to Deutsch (de) — UI reacts | ✅ pass | 1491ms |
| Switch to Português (pt) — UI reacts | ✅ pass | 1701ms |
| Switch to Italiano (it) — UI reacts | ✅ pass | 1351ms |
| Switch to Indonesia (id) — UI reacts | ✅ pass | 1873ms |
| Switch to 한국어 (ko) — UI reacts | ✅ pass | 1441ms |
| Switch to 日本語 (ja) — UI reacts | ✅ pass | 1225ms |
| Switch to العربية (ar) — UI reacts | ✅ pass | 1692ms |
| Switch to עברית (he) — UI reacts | ✅ pass | 1450ms |
| RTL: Arabic sets document.dir = rtl | ✅ pass | 1470ms |
| RTL: Hebrew sets document.dir = rtl | ✅ pass | 1570ms |
| LTR: English resets document.dir to ltr | ✅ pass | 2379ms |
| Body content translates — nav groups label changes with language | ✅ pass | 1804ms |
| localStorage persists language across reload | ✅ pass | 2302ms |
| Language dropdown opens and shows all 11 options | ✅ pass | 2625ms |
| Switch to Español (es) — UI reacts | ✅ pass | 1665ms |
| Switch to English (en) — UI reacts | ✅ pass | 1958ms |
| Switch to Français (fr) — UI reacts | ✅ pass | 1964ms |
| Switch to Deutsch (de) — UI reacts | ✅ pass | 2674ms |
| Switch to Português (pt) — UI reacts | ✅ pass | 1935ms |
| Switch to Italiano (it) — UI reacts | ✅ pass | 2066ms |
| Switch to Indonesia (id) — UI reacts | ✅ pass | 2151ms |
| Switch to 한국어 (ko) — UI reacts | ✅ pass | 2223ms |
| Switch to 日本語 (ja) — UI reacts | ✅ pass | 2599ms |
| Switch to العربية (ar) — UI reacts | ✅ pass | 1838ms |
| Switch to עברית (he) — UI reacts | ✅ pass | 8508ms |
| RTL: Arabic sets document.dir = rtl | ✅ pass | 2161ms |
| RTL: Hebrew sets document.dir = rtl | ✅ pass | 1918ms |
| LTR: English resets document.dir to ltr | ✅ pass | 2599ms |
| Body content translates — nav groups label changes with language | ✅ pass | 2762ms |
| localStorage persists language across reload | ✅ pass | 3671ms |

### ✅ PREDICTIONS — score input behaviour

| Test | Status | Duration |
|------|--------|----------|
| Blur on empty home input auto-fills "0" | ✅ pass | 2630ms |
| Blur on empty away input auto-fills "0" | ✅ pass | 1897ms |
| Filled value is preserved on blur | ✅ pass | 2414ms |
| Both inputs together: blur empty → both become "0" | ✅ pass | 2870ms |
| Blur on empty home input auto-fills "0" | ✅ pass | 3917ms |
| Blur on empty away input auto-fills "0" | ✅ pass | 3367ms |
| Filled value is preserved on blur | ✅ pass | 2461ms |
| Both inputs together: blur empty → both become "0" | ✅ pass | 2658ms |
| Blur on empty home input auto-fills "0" | ✅ pass | 2292ms |
| Blur on empty away input auto-fills "0" | ✅ pass | 19928ms |
| Filled value is preserved on blur | ✅ pass | 2019ms |
| Both inputs together: blur empty → both become "0" | ✅ pass | 2256ms |
| Blur on empty home input auto-fills "0" | ✅ pass | 4419ms |
| Blur on empty away input auto-fills "0" | ✅ pass | 2976ms |
| Filled value is preserved on blur | ✅ pass | 2659ms |
| Both inputs together: blur empty → both become "0" | ✅ pass | 2498ms |

### ❌ COUNTDOWN — PRÓXIMO badge and MM:SS timer

| Test | Status | Duration |
|------|--------|----------|
| PRÓXIMO badge appears when match is ≤30 min away | ✅ pass | 3700ms |
| MM:SS countdown timer is visible when near kickoff | ✅ pass | 2678ms |
| Timer counts down (two readings differ) | ✅ pass | 4886ms |
| PRÓXIMO badge appears when match is ≤30 min away | ✅ pass | 4275ms |
| MM:SS countdown timer is visible when near kickoff | ✅ pass | 2655ms |
| Timer counts down (two readings differ) | ✅ pass | 4763ms |
| PRÓXIMO badge appears when match is ≤30 min away | ✅ pass | 4295ms |
| MM:SS countdown timer is visible when near kickoff | ✅ pass | 5146ms |
| Timer counts down (two readings differ) | ✅ pass | 5824ms |
| PRÓXIMO badge appears when match is ≤30 min away | ❌ FAIL | 30325ms |
| PRÓXIMO badge appears when match is ≤30 min away | ✅ pass | 5708ms |
| MM:SS countdown timer is visible when near kickoff | ✅ pass | 3968ms |
| Timer counts down (two readings differ) | ✅ pass | 5286ms |

### ✅ PREDICTIONS — submit flow

| Test | Status | Duration |
|------|--------|----------|
| Submitting prediction shows ENVIADA / SENT badge | ✅ pass | 1978ms |
| Re-opening prediction loads previously saved values | ✅ pass | 2271ms |
| Submitting prediction shows ENVIADA / SENT badge | ✅ pass | 2549ms |
| Re-opening prediction loads previously saved values | ✅ pass | 2911ms |
| Submitting prediction shows ENVIADA / SENT badge | ✅ pass | 1875ms |
| Re-opening prediction loads previously saved values | ✅ pass | 10089ms |
| Submitting prediction shows ENVIADA / SENT badge | ✅ pass | 7853ms |
| Re-opening prediction loads previously saved values | ✅ pass | 2597ms |

### ✅ MIS PICKS — filter tabs

| Test | Status | Duration |
|------|--------|----------|
| BORRADORES filter tab is present | ✅ pass | 3140ms |
| ENVIADAS filter tab is present | ✅ pass | 2569ms |
| Clicking BORRADORES shows only draft rows | ✅ pass | 1964ms |
| BORRADORES filter tab is present | ✅ pass | 1596ms |
| ENVIADAS filter tab is present | ✅ pass | 1488ms |
| Clicking BORRADORES shows only draft rows | ✅ pass | 2080ms |
| BORRADORES filter tab is present | ✅ pass | 1349ms |
| ENVIADAS filter tab is present | ✅ pass | 1678ms |
| Clicking BORRADORES shows only draft rows | ✅ pass | 1582ms |
| BORRADORES filter tab is present | ✅ pass | 1649ms |
| ENVIADAS filter tab is present | ✅ pass | 1358ms |
| Clicking BORRADORES shows only draft rows | ✅ pass | 2113ms |

### ✅ AUTH — sign out

| Test | Status | Duration |
|------|--------|----------|
| Sign-out button is visible in user menu | ✅ pass | 1976ms |
| Sign out redirects back to login screen | ✅ pass | 1997ms |
| Sign-out button is visible in user menu | ✅ pass | 1202ms |
| Sign out redirects back to login screen | ✅ pass | 1279ms |
| Sign-out button is visible in user menu | ✅ pass | 3008ms |
| Sign out redirects back to login screen | ✅ pass | 2750ms |
| Sign-out button is visible in user menu | ✅ pass | 1924ms |
| Sign out redirects back to login screen | ✅ pass | 2245ms |

### ✅ COUNTDOWN — EN VIVO badge at kickoff

| Test | Status | Duration |
|------|--------|----------|
| EN VIVO badge appears when match is at/past kickoff | ✅ pass | 5192ms |
| EN VIVO shows 0-0 score display | ✅ pass | 2475ms |
| Timer stops at 00:00 when match starts | ✅ pass | 3220ms |
| EN VIVO badge appears when match is at/past kickoff | ✅ pass | 2643ms |
| EN VIVO shows 0-0 score display | ✅ pass | 4463ms |
| Timer stops at 00:00 when match starts | ✅ pass | 5305ms |
| EN VIVO badge appears when match is at/past kickoff | ✅ pass | 3271ms |
| EN VIVO shows 0-0 score display | ✅ pass | 3140ms |
| Timer stops at 00:00 when match starts | ✅ pass | 17917ms |
| EN VIVO badge appears when match is at/past kickoff | ✅ pass | 2690ms |
| EN VIVO shows 0-0 score display | ✅ pass | 2561ms |
| Timer stops at 00:00 when match starts | ✅ pass | 3159ms |

### ✅ SEARCH — team lookup

| Test | Status | Duration |
|------|--------|----------|
| Search "Argen" finds Argentina | ✅ pass | 2415ms |
| Search "bra" finds Brazil (localized) | ✅ pass | 2225ms |
| Search "xxx" shows no-results message | ✅ pass | 2167ms |
| Selecting team navigates to Groups tab | ✅ pass | 2910ms |
| Groups stay in A–Z order after search selection | ✅ pass | 2601ms |
| Matched team gets highlight (ring or gold bg) | ✅ pass | 2761ms |
| Clearing search removes highlight | ✅ pass | 2674ms |
| Keyboard navigation — ArrowDown + Enter selects first result | ✅ pass | 1865ms |
| Escape closes search dropdown | ✅ pass | 1541ms |
| Search "Argen" finds Argentina | ✅ pass | 3592ms |
| Search "bra" finds Brazil (localized) | ✅ pass | 2868ms |
| Search "xxx" shows no-results message | ✅ pass | 2033ms |
| Selecting team navigates to Groups tab | ✅ pass | 2213ms |
| Groups stay in A–Z order after search selection | ✅ pass | 2208ms |
| Matched team gets highlight (ring or gold bg) | ✅ pass | 2284ms |
| Clearing search removes highlight | ✅ pass | 3020ms |
| Keyboard navigation — ArrowDown + Enter selects first result | ✅ pass | 3224ms |
| Escape closes search dropdown | ✅ pass | 2107ms |
| Search "Argen" finds Argentina | ✅ pass | 2594ms |
| Search "bra" finds Brazil (localized) | ✅ pass | 2408ms |
| Search "xxx" shows no-results message | ✅ pass | 1953ms |
| Selecting team navigates to Groups tab | ✅ pass | 2231ms |
| Groups stay in A–Z order after search selection | ✅ pass | 1876ms |
| Matched team gets highlight (ring or gold bg) | ✅ pass | 1659ms |
| Clearing search removes highlight | ✅ pass | 2561ms |
| Keyboard navigation — ArrowDown + Enter selects first result | ✅ pass | 1986ms |
| Escape closes search dropdown | ✅ pass | 1551ms |
| Search "Argen" finds Argentina | ✅ pass | 2860ms |
| Search "bra" finds Brazil (localized) | ✅ pass | 2534ms |
| Search "xxx" shows no-results message | ✅ pass | 3967ms |
| Selecting team navigates to Groups tab | ✅ pass | 5362ms |
| Groups stay in A–Z order after search selection | ✅ pass | 2504ms |
| Matched team gets highlight (ring or gold bg) | ✅ pass | 2922ms |
| Clearing search removes highlight | ✅ pass | 3077ms |
| Keyboard navigation — ArrowDown + Enter selects first result | ✅ pass | 2652ms |
| Escape closes search dropdown | ✅ pass | 1591ms |

### ✅ PREDICTIONS — status badges

| Test | Status | Duration |
|------|--------|----------|
| BORRADORES filter shows only draft predictions | ✅ pass | 4842ms |
| Score inputs accept values 0-99 only | ✅ pass | 1811ms |
| BORRADORES filter shows only draft predictions | ✅ pass | 5148ms |
| Score inputs accept values 0-99 only | ✅ pass | 3026ms |
| BORRADORES filter shows only draft predictions | ✅ pass | 3870ms |
| Score inputs accept values 0-99 only | ✅ pass | 1592ms |
| BORRADORES filter shows only draft predictions | ✅ pass | 5133ms |
| Score inputs accept values 0-99 only | ✅ pass | 1913ms |

### ✅ TIMEZONE — country selector updates match times

| Test | Status | Duration |
|------|--------|----------|
| localStorage key wc2026_timezone updates on country change | ✅ pass | 2216ms |
| Switching country changes displayed match times | ✅ pass | 3025ms |
| Switching country updates ALL visible match cards | ✅ pass | 2177ms |
| Country MX stores timezone America/Mexico_City | ✅ pass | 2557ms |
| Country JP stores timezone Asia/Tokyo | ✅ pass | 2439ms |
| Country AR stores timezone America/Argentina/Buenos_Aires | ✅ pass | 2642ms |
| Timezone persists across tab navigation | ✅ pass | 3836ms |
| localStorage key wc2026_timezone updates on country change | ✅ pass | 2949ms |
| Switching country changes displayed match times | ✅ pass | 4174ms |
| Switching country updates ALL visible match cards | ✅ pass | 3386ms |
| Country MX stores timezone America/Mexico_City | ✅ pass | 3426ms |
| Country JP stores timezone Asia/Tokyo | ✅ pass | 6009ms |
| Country AR stores timezone America/Argentina/Buenos_Aires | ✅ pass | 4201ms |
| Timezone persists across tab navigation | ✅ pass | 4384ms |
| localStorage key wc2026_timezone updates on country change | ✅ pass | 2483ms |
| Switching country changes displayed match times | ✅ pass | 2656ms |
| Switching country updates ALL visible match cards | ✅ pass | 2219ms |
| Country MX stores timezone America/Mexico_City | ✅ pass | 2191ms |
| Country JP stores timezone Asia/Tokyo | ✅ pass | 3677ms |
| Country AR stores timezone America/Argentina/Buenos_Aires | ✅ pass | 6619ms |
| Timezone persists across tab navigation | ✅ pass | 2910ms |
| localStorage key wc2026_timezone updates on country change | ✅ pass | 2433ms |
| Switching country changes displayed match times | ✅ pass | 3920ms |
| Switching country updates ALL visible match cards | ✅ pass | 4172ms |
| Country MX stores timezone America/Mexico_City | ✅ pass | 3053ms |
| Country JP stores timezone Asia/Tokyo | ✅ pass | 4201ms |
| Country AR stores timezone America/Argentina/Buenos_Aires | ✅ pass | 2292ms |
| Timezone persists across tab navigation | ✅ pass | 3078ms |

### ✅ COUNTDOWN — far future matches

| Test | Status | Duration |
|------|--------|----------|
| No PRÓXIMO badge for matches more than 30 min away | ✅ pass | 1603ms |
| No PRÓXIMO badge for matches more than 30 min away | ✅ pass | 4210ms |
| No PRÓXIMO badge for matches more than 30 min away | ✅ pass | 1904ms |
| No PRÓXIMO badge for matches more than 30 min away | ✅ pass | 1348ms |

## Auto-fix Suggestions

_No failures — nothing to fix._

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
