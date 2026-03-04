export default async function handler(req: Request){
    return Response.json({
        message: "Bu, VN Framework'ün test API'sidir.",
        time: new Date().toISOString(),
        method: req.method,
        queries: req.query || {}
    });
}