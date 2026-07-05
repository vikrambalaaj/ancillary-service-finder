import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { serviceListRouter } from "./routes/servicelist.js";

// Load .env if present (Node 20.6+).
try {
  (process as unknown as { loadEnvFile?: (f?: string) => void }).loadEnvFile?.();
} catch {
  // no .env file — fall back to process env / defaults
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Return clean JSON for malformed request bodies instead of Express's HTML page.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON in request body" });
    return;
  }
  next(err);
});

app.use("/api", serviceListRouter);

const publicDir = path.resolve(__dirname, "..", "public");

/**
 * Serves index.html with cache-busting version stamps derived from the actual
 * build timestamps of app.js / styles.css. This guarantees the browser can
 * never run a stale cached bundle — the query string changes every rebuild.
 */
function serveIndex(_req: express.Request, res: express.Response): void {
  const indexPath = path.join(publicDir, "index.html");
  let html: string;
  try {
    html = fs.readFileSync(indexPath, "utf8");
  } catch {
    res.status(500).send("index.html not found");
    return;
  }
  const stamp = (file: string): string => {
    try {
      return String(fs.statSync(path.join(publicDir, file)).mtimeMs | 0);
    } catch {
      return String(Date.now());
    }
  };
  html = html
    .replace(/app\.js(\?v=[^"']*)?/g, `app.js?v=${stamp("app.js")}`)
    .replace(/styles\.css(\?v=[^"']*)?/g, `styles.css?v=${stamp("styles.css")}`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send(html);
}

app.get("/", serveIndex);
app.get("/index.html", serveIndex);

// Static assets (app.js, styles.css, etc.) — never cached.
app.use(
  express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js") || filePath.endsWith(".html") || filePath.endsWith(".css")) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }
    },
  }),
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Ancillary Service app running:  http://localhost:${PORT}\n`);
});
