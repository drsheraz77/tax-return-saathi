# Development Preview Verification

The managed development preview deliberately bypasses Vite's HTML transformer. This prevents it from adding the `/@vite/client` HMR bootstrap, which otherwise attempts a WebSocket connection that the managed preview proxy does not expose.

On 2026-08-19, the rendered preview was checked after a development-server restart. The generated HTML contained the required React refresh preamble but no `/@vite/client` reference. Its HTML response used `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.

A separate, fresh managed-browser session then opened `/?from_webdev=1` at the managed preview URL. The Tax Return Saathi homepage rendered successfully, and the browser console returned no output: specifically, there was no Vite WebSocket failure and no React preamble error.

The production PWA service worker and authored client files remain unchanged. Preview-only cleanup unregisters any prior preview service worker and clears its caches after loading, preventing an older cached preview HTML document from restoring the deprecated bootstrap.
