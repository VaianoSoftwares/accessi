export function objToUpperCase<T extends object>(
  obj: T,
  caseSensitiveAttributes?: string[]
): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === "string" && !caseSensitiveAttributes?.includes(key))
        return [key, value.toUpperCase()];
      else return [key, value];
    })
  ) as T;
}
