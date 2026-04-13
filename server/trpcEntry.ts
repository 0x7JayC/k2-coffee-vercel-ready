import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] error on ${path}:`, error.message, error.code);
    },
  })
);

// Express error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[Express] unhandled error:", err?.message ?? err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
