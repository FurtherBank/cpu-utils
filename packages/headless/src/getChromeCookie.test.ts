import { describe, it, mock } from 'node:test';
import * as assert from 'node:assert';

// Mock chrome-cookies-secure before importing the module under test
const mockGetCookiesPromised = mock.fn(
  async (_url: string, _format: string, _profile: string) => 'cookie1=value1; cookie2=value2'
);

mock.module('chrome-cookies-secure', {
  namedExports: {
    getCookiesPromised: mockGetCookiesPromised,
  },
});

describe('getChromeCookie', () => {
  it('should call getCookiesPromised with header format and default profile', async () => {
    const { getChromeCookie } = await import('./getChromeCookie');

    const result = await getChromeCookie('https://example.com');

    assert.strictEqual(result, 'cookie1=value1; cookie2=value2');
    assert.strictEqual(mockGetCookiesPromised.mock.calls.length, 1);

    const call = mockGetCookiesPromised.mock.calls[0];
    assert.strictEqual(call.arguments[0], 'https://example.com');
    assert.strictEqual(call.arguments[1], 'header');
    assert.strictEqual(call.arguments[2], 'Default');
  });

  it('should pass custom profile when provided', async () => {
    mockGetCookiesPromised.mock.resetCalls();
    const { getChromeCookie } = await import('./getChromeCookie');

    await getChromeCookie('https://example.com', 'Profile 1');

    const call = mockGetCookiesPromised.mock.calls[0];
    assert.strictEqual(call.arguments[2], 'Profile 1');
  });
});
