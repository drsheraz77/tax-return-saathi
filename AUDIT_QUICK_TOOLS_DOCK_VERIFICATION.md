# Consolidated Quick-Tools Dock Verification

**Scope:** Replaces the competing fixed supplemental launchers with one Urdu-first quick-tools dock and positions the initial privacy notice above it.

| Check | Observation |
| --- | --- |
| Desktop viewport (1280 × 720) | The single dock remains fully visible along the bottom edge. The initial privacy notice sits above it rather than covering it, while the primary preparation controls remain reachable after a choice is made. |
| Mobile viewport (375 × 812) | The dock presents five compact, labelled actions in one row. The initial privacy choice is visually separated above the dock; it is intentionally prominent until a visitor makes a choice. |
| Access model | Checklist, resources, Tax Year, preferences, and privacy choices remain reachable through the dock. The Pilot Feedback action closes supplemental panels before opening the existing feedback form. |
| Boundary | The consent surface remains a local optional-processing choice. It adds no advertising, analytics, tracking, or new personal-data collection. |

## Automated evidence

The focused quick-tools UI test passed. Full-suite and production-build verification passed after the dock migration: **20 test files / 102 tests**. The existing expected mocked managed-AI upstream error remains covered by its dedicated test; the Vite main-chunk advisory is non-blocking.
