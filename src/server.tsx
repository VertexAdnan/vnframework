import { renderToString } from "react-dom/server";

const server = Bun.serve({
    port: 3000,
    async fetch(req, server) {
        const url = new URL(req.url);

        if (url.pathname === "/_reload") {
            const success = server.upgrade(req);
            return success ? undefined : new Response("Upgrade failed", { status: 400 });
        }

        if (url.pathname.startsWith("/api")) {
            try {
                const apiFilePath = `.${url.pathname}.ts`;

                const module = await import(`./api/${url.pathname.replace('/api/', '')}.ts`);

                if (module.default) {
                    return module.default(req);
                }
            } catch (e) {
                return Response.json({ error: "API rotası bulunamadı" }, { status: 404 });
            }
        }

        return handlePageRequest(url);
    },
    websocket: {
        message() { },
        open(ws) {
            console.log("Tarayıcı Live-Reload'a bağlandı");
        },
    },
});

async function handlePageRequest(url: URL) {
    const path = url.pathname === "/" ? "index" : url.pathname.slice(1);
    try {
        const Page = (await import(`./pages/${path}.tsx`)).default;
        const content = renderToString(<Page />);

        return new Response(
            `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"></head><body><div id="root">${content}</div><script>/* Live Reload Kodları */</script></body></html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
    } catch {
        return new Response("Sayfa Bulunamadı", { status: 404 });
    }
}

async function handleRequest(url: URL) {
    const path = url.pathname === "/" ? "index" : url.pathname.slice(1);
    try {
        const Page = (await import(`./pages/${path}.tsx`)).default;
        const content = renderToString(<Page />);

        return new Response(
            `
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8"> <!-- 1. KRİTİK EKLEME -->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mini Next</title>
        </head>
        <body>
          <div id="root">${content}</div>

          <script>
            // Live Reload Scripti (Önceki adımda eklediğimiz)
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

console.log(`🚀 http://localhost:3000`);