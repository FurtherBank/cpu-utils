import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { isDefined, unique, capitalise } from './index';

describe('isDefined', () => {
  it('should return true for defined values', () => {
    assert.strictEqual(isDefined(0), true);
    assert.strictEqual(isDefined(''), true);
    assert.strictEqual(isDefined(false), true);
  });

  it('should return false for null and undefined', () => {
    assert.strictEqual(isDefined(null), false);
    assert.strictEqual(isDefined(undefined), false);
  });
});

describe('unique', () => {
  it('should remove duplicate values', () => {
    assert.deepStrictEqual(unique([1, 2, 2, 3, 3, 3]), [1, 2, 3]);
  });

  it('should return empty array for empty input', () => {
    assert.deepStrictEqual(unique([]), []);
  });
});

describe('capitalise', () => {
  it('should capitalise the first letter', () => {
    assert.strictEqual(capitalise('hello'), 'Hello');
  });

  it('should return empty string for empty input', () => {
    assert.strictEqual(capitalise(''), '');
  });
});
