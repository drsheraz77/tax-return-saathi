# Project TODO

- [x] Inspect the uploaded archive and record the source file structure before importing it.
- [x] Import the uploaded React/Vite frontend without altering the authored App.jsx content, tax rules, bilingual strings, or visual design.
- [x] Place manifest.webmanifest, sw.js, and all supplied PNG PWA icons in the client public root so they resolve from root URLs.
- [x] Preserve the Vite build pipeline with the `npm run build` command producing the `dist` directory.
- [x] Implement a server-only POST `/api/claude` proxy that forwards valid requests to Anthropic without exposing `ANTHROPIC_API_KEY`.
- [x] Add a focused Vitest suite covering proxy validation, request forwarding, and upstream error pass-through behavior.
- [x] Configure the `ANTHROPIC_API_KEY` secret only through protected project settings.
- [x] Build and visually verify the imported app, root-served PWA assets, and API route behavior.
- [ ] Review the checklist, create a release checkpoint, and provide custom-domain publishing steps.
