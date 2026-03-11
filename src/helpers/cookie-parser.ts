/**
 * Cookie Parser - HTTP Cookie header'larını parse eder
 */

/**
 * Cookie string'ini parse edip object'e çevirir
 * 
 * @param cookieHeader - Request'ten gelen Cookie header değeri
 * @returns Key-value pairs olarak cookies
 * 
 * @example
 * ```ts
 * const cookies = parseCookies(req.headers.get("cookie"));
 * console.log(cookies.session_id);
 * ```
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};

  // Cookie format: "name1=value1; name2=value2"
  const pairs = cookieHeader.split(";");

  for (const pair of pairs) {
    const [name, ...valueParts] = pair.split("=");
    const trimmedName = name?.trim();
    
    if (trimmedName) {
      // Value kısmında = olabilir, onları birleştir
      const value = valueParts.join("=").trim();
      cookies[trimmedName] = decodeURIComponent(value);
    }
  }

  return cookies;
}

/**
 * Request nesnesine cookie'leri ekle
 * 
 * @param req - HTTP Request nesnesi
 * @returns Cookies eklenmiş request
 */
export function attachCookies(req: Request): Request {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  
  // Request nesnesine cookies ekle
  return Object.assign(req, { cookies });
}
