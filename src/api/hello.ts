export default function handler(req: Request) {
  return Response.json({ 
    message: "Merhaba! Bu bir API yanıtıdır.",
    time: new Date().toISOString(),
    method: req.method,
    queries: req.query || {}
  });
}