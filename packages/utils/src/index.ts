/**
 * Checks whether a value is defined (not null and not undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Returns a new array with duplicate values removed.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Capitalises the first letter of a string.
 */
export function capitalise(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
