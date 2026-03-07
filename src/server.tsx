import { renderToString } from "react-dom/server";
import Layout from "./components/Layout";
import { initializeDatabases, closeDatabases } from "./config/database";
import { RateLimiter } from "./helpers/rate-limiter";

const isProduction = process.env.NODE_ENV === "production";
let isShuttingDown = false;
let activeApiRequests = 0;
let resolveDrain: (() => void) | null = null;

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 60);
const apiRateLimiter = new RateLimiter({
    windowMs: Number.isFinite(rateLimitWindowMs) && rateLimitWindowMs > 0 ? rateLimitWindowMs : 60_000,
    maxRequests: Number.isFinite(rateLimitMaxRequests) && rateLimitMaxRequests > 0 ? rateLimitMaxRequests : 60,
});

function getPageModulePath(path: string) {
    return isProduction ? `./pages/${path}.js` : `./pages/${path}.tsx`;
}

function getApiModulePath(path: string) {
    return isProduction ? `./api/${path}.js` : `./api/${path}.ts`;
}

function getClientIp(req: Request, server: Bun.Server<AppWebSocketData>) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    const address = server.requestIP(req);
    return address?.address || "unknown";
}

const server = Bun.serve<AppWebSocketData>({
    port: 3000,
    async fetch(req, server) {
        if (isShuttingDown) {
            return new Response("Server yeniden başlatılıyor", {
                status: 503,
                headers: { "Retry-After": "1" },
            });
        }

        const url = new URL(req.url);

        if (url.pathname === "/ws") {
            const room = url.searchParams.get("room") || "global";
            const success = server.upgrade(req, {
                data: {
                    createdAt: Date.now(),
                    room: room
                },
            });
            return success ? undefined : new Response("Upgrade failed", { status: 400 });
        }

        if (url.pathname === "/_reload") {
            const success = server.upgrade(req, {
                data: {
                    createdAt: Date.now(),
                    room: "_reload",
                },
            });
            return success ? undefined : new Response("Upgrade failed", { status: 400 });
        }

        // Statik dosya servisi
        if (url.pathname.startsWith("/public/")) {
            const filePath = `.${url.pathname}`;
            const file = Bun.file(filePath);
            if (await file.exists()) {
                return new Response(file);
            }
            return new Response("Not Found", { status: 404 });
        }

        if (isProduction && url.pathname.startsWith("/assets/")) {
            const filePath = `./dist${url.pathname}`;
            const file = Bun.file(filePath);
            if (await file.exists()) {
                return new Response(file);
            }
            return new Response("Not Found", { status: 404 });
        }

        if (url.pathname.startsWith("/api")) {
            const clientIp = getClientIp(req, server);
            const rateLimitResult = apiRateLimiter.check(clientIp);

            if (!rateLimitResult.allowed) {
                return Response.json(
                    {
                        error: "Too many requests",
                        message: "Rate limit aşıldı. Lütfen biraz sonra tekrar deneyin.",
                    },
                    {
                        status: 429,
                        headers: {
                            "Retry-After": String(rateLimitResult.retryAfterSeconds),
                            "X-RateLimit-Limit": String(rateLimitResult.limit),
                            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                            "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
                        },
                    }
                );
            }

            activeApiRequests += 1;
            try {
                const apiPath = url.pathname.replace('/api/', '');
                const module = await import(getApiModulePath(apiPath));
                if (module.default) {
                    const query = Object.fromEntries(url.searchParams.entries());
                    const extendedReq = Object.assign(req, { query });
                    return module.default(extendedReq);
                }
                return Response.json({ error: "API not found" }, { status: 404 });
            } catch (e) {
                return Response.json({ error: "API not found" }, { status: 404 });
            } finally {
                activeApiRequests -= 1;
                if (isShuttingDown && activeApiRequests === 0 && resolveDrain) {
                    resolveDrain();
                    resolveDrain = null;
                }
            }
        }

        return handlePageRequest(url);
    },
    websocket: {
        open(ws) {
            const { room } = ws.data as any;
            ws.subscribe(room);
            console.log(`Yeni bağlantı: ${room} odasına katıldı`);
        },

        message(ws, message) {
            const { room } = ws.data as any;
            ws.publish(room, message);
        },

        close(ws) {
            const { room } = ws.data as any;
            ws.unsubscribe(room);
            console.log("Bağlantı kapandı");
        },
    },
});

async function handlePageRequest(url: URL) {
    const path = url.pathname === "/" ? "index" : url.pathname.slice(1);
    try {
        const PageModule = await import(getPageModulePath(path));
        const Page = PageModule.default;

        const pageTitle = PageModule.title || "Hoş Geldiniz";
        const pageDescription = PageModule.description || "Bu sayfa hakkında bilgi bulunmamaktadır.";

        const fullTitle = `${process.env.APP_TITLE || "VNFramework"} | ${pageTitle}`;
        const fullDescription = `${process.env.APP_DESCRIPTION || "Bun ile güçlendirilmiş modern web framework"} | ${pageDescription}`;

        const content = renderToString(
            <Layout>
                <Page />
            </Layout>
        );

        // Client-side hydration script'leri
        const clientScripts = isProduction
            ? `<script>
                window.__PAGE_PATH__ = "${url.pathname}";
              </script>
                            <script type="module" src="/assets/entry-client.js"></script>`
            : `<script>
                window.__PAGE_PATH__ = "${url.pathname}";
              </script>
              <script>/* Dev mode - hydration devredışı */</script>
              <script>
                const socket = new WebSocket('ws://' + location.host + '/_reload');
                socket.onclose = () => {
                  setTimeout(() => {
                    fetch(location.href).then(() => location.reload());
                  }, 300);
                };
              </script>`;

        return new Response(
            `<!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fullTitle}</title>
          <meta name="description" content="${fullDescription}">
        </head>
        <body>
          <div id="root">${content}</div>
          ${clientScripts}
        </body>
      </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
    } catch (e) {
        return new Response("Sayfa Bulunamadı", { status: 404 });
    }
}

async function handleRequest(url: URL) {
    const path = url.pathname === "/" ? "index" : url.pathname.slice(1);
    try {
        const Page = (await import(getPageModulePath(path))).default;
        const content = renderToString(<Page />);

        return new Response(
            `
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mini Next</title>
        </head>
        <body>
          <div id="root">${content}</div>

          <script>
            const socket = new WebSocket('ws://' + location.host + '/_reload');
            socket.onclose = () => {
              setTimeout(() => {
                fetch(location.href).then(() => location.reload());
              }, 300);
            };
          </script>
        </body>
      </html>
      `,
            {
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            }
        );
    } catch (e) {
        return new Response("404 - Sayfa Bulunamadı", { status: 404 });
    }
}

process.on("SIGTERM", () => {
    gracefulShutdown();
});

process.on("SIGINT", () => {
    gracefulShutdown();
});

async function gracefulShutdown() {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    console.log("Sunucu soft restart için beklemeye alındı...");
    server.stop(false);

    if (activeApiRequests > 0) {
        await Promise.race([
            new Promise<void>((resolve) => {
                resolveDrain = resolve;
            }),
            new Promise<void>((resolve) => {
                setTimeout(resolve, 30000);
            }),
        ]);
    }

    // Database bağlantılarını kapat
    await closeDatabases();
    apiRateLimiter.stop();

    console.log("Sunucu kapanıyor...");
    process.exit(0);
}

// Database bağlantılarını başlat
await initializeDatabases();

console.log(`🚀 http://localhost:3000`);