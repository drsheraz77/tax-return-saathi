import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { manusLlmProxy } from "../manusLlmProxy";
import { returnReviewPipeline, taxChatPipeline } from "../taxAnalysisPipeline";
import { documentPreparationPipeline } from "../documentPreparationPipeline";
import { feedbackRetentionHandler } from "../feedbackRetention";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createIpRateLimiter } from "./rateLimit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // Retain the uploaded browser route while the server uses the managed AI proxy.
  app.all("/api/claude", manusLlmProxy);
  // New bounded pipelines: documents are extracted once, calculations are deterministic,
  // and the reasoning model receives structured facts rather than raw documents.
  app.all("/api/return-review", createIpRateLimiter({ windowMs: 15 * 60 * 1000, max: 12, name: "return-review" }), returnReviewPipeline);
  app.all("/api/document-preparation", createIpRateLimiter({ windowMs: 15 * 60 * 1000, max: 12, name: "document-preparation" }), documentPreparationPipeline);
  app.all("/api/tax-chat", createIpRateLimiter({ windowMs: 15 * 60 * 1000, max: 60, name: "tax-chat" }), taxChatPipeline);
  // Platform-managed scheduled callback; it authenticates cron sessions itself.
  app.post("/api/scheduled/feedback-retention", feedbackRetentionHandler);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
