# Local Draft Verification

## Privacy and entry-state check

On 2026-08-22, the managed preview was opened in a fresh browser session and the filing checklist prototype was launched. The panel identifies itself as **“Local-only prototype · browser save is optional”**. Its save notice states that only high-level checklist choices and progress marks are kept in this browser’s local storage, that nothing is sent to the server, and that users should avoid saving on shared devices.

At the untouched first question, **Save this draft on this device** was rendered but disabled. This confirms that saving requires affirmative user interaction and cannot occur before a user has started a checklist path.

## Explicit save check

After selecting **“This is my first return,”** the save control became available. Selecting it displayed the status message **“Saved on this browser only. You can resume or delete it at any time.”** and exposed both **Resume saved draft** and **Delete saved draft** controls. No network action was required for this flow.

## Resume check

The in-memory response was then changed to **“Yes, I have filed before”** without saving. Selecting **Resume saved draft** restored the saved **“This is my first return”** response and displayed **“Saved draft resumed. Nothing has been sent to the server.”** This verifies that resume reads the opted-in local draft rather than retaining later unsaved changes.

## Removal and console check

Selecting **Delete saved draft** displayed **“Saved draft removed from this browser.”** and removed the resume and deletion controls, leaving only the explicit save action. The browser console produced no output after the save, resume, and removal journey.

## Refresh persistence check

After saving a new opted-in draft, the managed preview was reloaded at the same URL. The page reloaded cleanly and the checklist panel began closed, as expected. The next verification step is to open the panel and confirm the retained local draft is offered for resume and deletion.

After opening the panel post-refresh, it displayed **“A saved draft is available on this browser.”** with both resume and deletion controls. Selecting **Resume saved draft** restored the saved response and displayed the browser-only confirmation. This verifies persistence and recovery across a page refresh without server persistence.

Selecting **Delete saved draft** after the refresh displayed **“Saved draft removed from this browser.”** and removed the resume and deletion controls. The complete refreshed lifecycle therefore supports explicit save, refresh persistence, user-initiated resume, and one-click local removal without server persistence.

## Code-level transport check

The production component now delegates all draft operations to `loadPrototypeDraft`, `savePrototypeDraft`, and `removePrototypeDraft`. Those helpers accept only a browser-storage adapter and call only `getItem`, `setItem`, and `removeItem` for the versioned local-storage key. The new unit test supplies an adapter with precisely those three methods, confirms save → restore → removal operations, and records the expected call sequence. It passes without any transport client, network mock, fetch, XHR, tRPC, or server dependency. The full suite passes **13/13 tests**, and the production build completes successfully.
