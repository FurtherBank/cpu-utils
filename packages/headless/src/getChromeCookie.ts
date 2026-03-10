import { getCookiesPromised } from 'chrome-cookies-secure';

/**
 * Get Chrome cookies for a given URL from the local Chrome database.
 *
 * This reads the current user's Chrome cookie store and returns the cookies
 * associated with the given URL as a header string (e.g. "name=value; name2=value2").
 *
 * Note: If cookies contain non-ASCII characters, the values are URL-encoded to ensure
 * compatibility with HTTP header standards (ByteString), which is required by fetch.
 *
 * @param url - The target URL to retrieve cookies for (e.g. "https://example.com")
 * @param profile - Chrome profile to use. Defaults to 'Default'.
 *   Use 'Profile 1', 'Profile 2', etc. for additional Chrome profiles.
 * @returns A promise that resolves to the cookie header string.
 */
export async function getChromeCookie(
  url: string,
  profile = 'Default'
): Promise<string> {
  const cookieString: string = await getCookiesPromised(url, 'header', profile);

  if (!cookieString) return '';

  // Ensure the cookie string is a valid ByteString (ASCII 0-255) for HTTP headers.
  // If it contains Unicode characters (> 255), fetch/undici will throw an error.
  return cookieString
    .split('; ')
    .map((pair) => {
      const [name, ...valueParts] = pair.split('=');
      const value = valueParts.join('=');

      // Only encode if the value contains non-ASCII characters
      if (/[^\x00-\x7F]/.test(value)) {
        try {
          return `${name}=${encodeURIComponent(value)}`;
        } catch (e) {
          // Fallback to original if encoding fails
          return pair;
        }
      }
      return pair;
    })
    .join('; ');
}
