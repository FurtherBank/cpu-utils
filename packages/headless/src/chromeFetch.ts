import { getChromeCookie } from './getChromeCookie';

/**
 * Default headers that mimic a Chrome browser request.
 */
const CHROME_DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/json,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

export { CHROME_DEFAULT_HEADERS };

/**
 * Fetch a URL using Chrome cookies and default Chrome headers.
 *
 * This function reads cookies from the local Chrome cookie store for the given URL,
 * then makes a fetch request with those cookies and default Chrome browser headers.
 * Any additional options or headers provided will be merged, with user-provided values
 * taking precedence over the defaults.
 *
 * @param url - The URL to fetch.
 * @param init - Optional fetch init options (headers, method, body, etc.).
 * @param profile - Chrome profile to use for cookies. Defaults to 'Default'.
 * @returns A promise that resolves to the fetch Response.
 */
export async function chromeFetch(
  url: string,
  init?: RequestInit,
  profile?: string
): Promise<Response> {
  const cookie = await getChromeCookie(url, profile);

  const headers: Record<string, string> = {
    ...CHROME_DEFAULT_HEADERS,
    ...(cookie ? { Cookie: cookie } : {}),
    ...toHeaderRecord(init?.headers),
  };

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Convert various header formats to a plain record.
 */
function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}
