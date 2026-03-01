import { getCookiesPromised } from 'chrome-cookies-secure';

/**
 * Get Chrome cookies for a given URL from the local Chrome database.
 *
 * This reads the current user's Chrome cookie store and returns the cookies
 * associated with the given URL as a header string (e.g. "name=value; name2=value2").
 *
 * @param url - The target URL to retrieve cookies for (e.g. "https://example.com")
 * @param profile - Chrome profile to use. Defaults to 'Default'.
 *   Use 'Profile 1', 'Profile 2', etc. for additional Chrome profiles.
 * @returns A promise that resolves to the cookie header string.
 */
export async function getChromeCookie(url: string, profile = 'Default'): Promise<string> {
  return getCookiesPromised(url, 'header', profile);
}
