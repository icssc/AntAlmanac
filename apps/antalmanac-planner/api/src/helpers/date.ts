type DateConvertible<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K];
};

/**
 * Converts all Date object values to ISO strings
 */
export function datesToStrings<T extends object>(object: T): DateConvertible<T> {
  for (const key of Object.keys(object) as Array<keyof T>) {
    const value = object[key];
    if (value instanceof Date) {
      object[key] = value.toISOString() as T[keyof T];
    }
  }

  return object as DateConvertible<T>;
}
