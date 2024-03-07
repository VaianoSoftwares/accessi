export function objToUpperCase<T extends object>(
  obj: T,
  caseSensitiveAttributes?: string[]
): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (caseSensitiveAttributes?.includes(key)) return [key, value];
      else if (typeof value === "string") return [key, value.toUpperCase()];
      return Array.isArray(value)
        ? [key, value.map((v) => (typeof v === "string" ? v.toUpperCase() : v))]
        : [key, value];
    })
  ) as T;
}
