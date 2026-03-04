import { renderToString } from "react-dom/server";
import Layout from "./components/Layout";

const server = Bun.serve<AppWebSocketData>({
    port: 3000,
    async fetch(req, server) {
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

        if (url.pathname.startsWith("/api")) {
            try {
                const module = await import(`./api/${url.pathname.replace('/api/', '')}.ts`);
                if (module.default) {
                    const query = Object.fromEntries(url.searchParams.entries());
                    const extendedReq = Object.assign(req, { query });
                    return module.default(extendedReq);
                }
            } catch (e) {
                return Response.json({ error: "API not found" }, { status: 404 });
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
        const PageModule = await import(`./pages/${path}.tsx`);
        const Page = PageModule.default;

        const pageTitle = PageModule.title || "Hoş Geldiniz";
        const pageDescription = PageModule.description || "Bu sayfa hakkında bilgi bulunmamaktadır.";

        const fullTitle = `${process.env.APP_TITLE} | ${pageTitle}`;
        const fullDescription = `${process.env.APP_DESCRIPTION} | ${pageDescription}`;
        //const content = renderToString(<Page />);

        const content = renderToString(
            <Layout>
                <Page />
            </Layout>
        );

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
          <script>/* Live Reload Kodları */</script>
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
        const Page = (await import(`./pages/${path}.tsx`)).default;
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

console.log(`🚀 http://localhost:3000`);