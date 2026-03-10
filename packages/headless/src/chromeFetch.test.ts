import { describe, it, mock, afterEach } from 'node:test';
import * as assert from 'node:assert';

// Mock chrome-cookies-secure before importing the module under test
const mockGetCookiesPromised = mock.fn(
  async (_url: string, format: string, _profile: string): Promise<any> => {
    if (format === 'header') return 'session=abc123; token=xyz';
    return { session: 'abc123', token: 'xyz' };
  }
);

mock.module('chrome-cookies-secure', {
  namedExports: {
    getCookiesPromised: mockGetCookiesPromised,
  },
});

describe('chromeFetch', () => {
  afterEach(() => {
    mockGetCookiesPromised.mock.resetCalls();
    mock.restoreAll();
  });

  it('should fetch with Chrome cookies and default headers', async () => {
    const { chromeFetch, CHROME_DEFAULT_HEADERS } = await import('./chromeFetch');

    mockGetCookiesPromised.mock.mockImplementationOnce(
      async (_url: string, format: string, _profile: string) => {
        if (format === 'header') return 'session=abc123; token=xyz; user=张三';
        return { session: 'abc123', token: 'xyz', user: '张三' };
      }
    );

    const mockFetch = mock.method(globalThis, 'fetch', async () => {
      return new Response('ok', { status: 200 });
    });

    await chromeFetch('https://example.com');

    // Verify getCookiesPromised was called
    assert.strictEqual(mockGetCookiesPromised.mock.calls.length, 1);
    assert.strictEqual(mockGetCookiesPromised.mock.calls[0].arguments[0], 'https://example.com');

    // Verify fetch was called
    assert.strictEqual(mockFetch.mock.calls.length, 1);
    const [fetchUrl, fetchInit] = mockFetch.mock.calls[0].arguments;
    assert.strictEqual(fetchUrl, 'https://example.com');

    // Verify headers include defaults and encoded cookies
    const headers = fetchInit?.headers as Record<string, string>;
    // '张三' should be encoded to '%E5%BC%A0%E4%B8%89'
    assert.strictEqual(
      headers['Cookie'],
      'session=abc123; token=xyz; user=%E5%BC%A0%E4%B8%89'
    );
    assert.strictEqual(headers['User-Agent'], CHROME_DEFAULT_HEADERS['User-Agent']);
    assert.strictEqual(headers['Accept-Language'], CHROME_DEFAULT_HEADERS['Accept-Language']);
  });

  it('should allow custom headers to override defaults', async () => {
    const { chromeFetch } = await import('./chromeFetch');

    const mockFetch = mock.method(globalThis, 'fetch', async () => {
      return new Response('ok', { status: 200 });
    });

    await chromeFetch('https://example.com', {
      headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
    });

    const [, fetchInit] = mockFetch.mock.calls[0].arguments;
    const headers = fetchInit?.headers as Record<string, string>;
    assert.strictEqual(headers['Accept-Language'], 'zh-CN,zh;q=0.9');
  });

  it('should pass custom profile to getChromeCookie', async () => {
    const { chromeFetch } = await import('./chromeFetch');

    mock.method(globalThis, 'fetch', async () => {
      return new Response('ok', { status: 200 });
    });

    await chromeFetch('https://example.com', undefined, 'Profile 1');

    const call = mockGetCookiesPromised.mock.calls[0];
    assert.strictEqual(call.arguments[2], 'Profile 1');
  });

  it('should pass through fetch init options like method and body', async () => {
    const { chromeFetch } = await import('./chromeFetch');

    const mockFetch = mock.method(globalThis, 'fetch', async () => {
      return new Response('ok', { status: 200 });
    });

    await chromeFetch('https://example.com/api', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
    });

    const [, fetchInit] = mockFetch.mock.calls[0].arguments;
    assert.strictEqual(fetchInit?.method, 'POST');
    assert.strictEqual(fetchInit?.body, JSON.stringify({ key: 'value' }));
  });

  it('should export CHROME_DEFAULT_HEADERS', async () => {
    const { CHROME_DEFAULT_HEADERS } = await import('./chromeFetch');

    assert.ok(CHROME_DEFAULT_HEADERS);
    assert.ok(CHROME_DEFAULT_HEADERS['User-Agent']);
    assert.ok(CHROME_DEFAULT_HEADERS['Accept']);
    assert.ok(CHROME_DEFAULT_HEADERS['Accept-Language']);
  });
});
