import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    // The managed preview proxy does not expose Vite's direct WebSocket port.
    // Keep the React transform preamble, but disable HMR transport in preview.
    hmr: false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Keep the source PWA worker unchanged for production. In development, add
  // a changing comment and disable HTTP caching so an older worker cannot keep
  // serving a stale transformed index.html after the server is updated.
  app.get("/sw.js", async (_req, res, next) => {
    try {
      const worker = await fs.promises.readFile(
        path.resolve(import.meta.dirname, "../..", "client", "public", "sw.js"),
        "utf-8"
      );
      res
        .status(200)
        .set({
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        })
        .end(`${worker}\n// Development preview revision: ${nanoid()}\n`);
    } catch (error) {
      next(error);
    }
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.jsx"`,
        `src="/src/main.jsx?v=${nanoid()}"`
      );
      // Do not call Vite's HTML transformer in the managed preview. In
      // middleware mode it injects /@vite/client even with HMR disabled, and
      // that client tries to open a WebSocket that the preview proxy cannot
      // forward. JSX modules are still transformed by Vite middleware below.
      const transformedPage = template;
      const reactPreamble = `<script type="module">
        import RefreshRuntime from "/@react-refresh";
        RefreshRuntime.injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;
        window.__vite_plugin_react_preamble_installed__ = true;
      </script>`;
      const previewCacheCleanup = `<script>
        // This managed preview has no WebSocket tunnel to Vite and must not keep
        // an older service worker or cached HTML that may still load its client.
        if ("serviceWorker" in navigator) {
          window.addEventListener("load", () => {
            navigator.serviceWorker.getRegistrations().then((registrations) =>
              Promise.all(registrations.map((registration) => registration.unregister()))
            ).then(() => caches.keys()).then((keys) =>
              Promise.all(keys.map((key) => caches.delete(key)))
            ).catch(() => {});
          });
        }
      </script>`;
      // Retain defensive cleanup for an HTML template that might be updated
      // later, then add the React transform preamble required by JSX modules.
      const page = transformedPage
        .replace(/<script\b(?=[^>]*\bsrc=["'][^"']*\/@vite\/client[^"']*["'])[^>]*>\s*<\/script>\s*/gi, "")
        .replace(/<script\b[^>]*>\s*import\s*["']\/@vite\/client[^"']*["'];?\s*<\/script>\s*/gi, "")
        .replace("</head>", `${reactPreamble}\n${previewCacheCleanup}\n</head>`);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
