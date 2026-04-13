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
                  const c1 = (error as any).cause;
                  if (c1) {
                            console.error("[tRPC] cause:", c1?.message, c1?.code);
                            const c2 = c1?.cause;
                            if (c2) console.error("[tRPC] root:", c2?.message, JSON.stringify(c2));
                  }
          },
    })
  );

// Express error handler
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("[Express] unhandled error:", err?.message ?? err);
    res.status(500).json({ error: "Internal server error" });
});

export default app;
