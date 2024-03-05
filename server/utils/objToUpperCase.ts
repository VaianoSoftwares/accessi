export function objToUpperCase<T extends object>(
  obj: T,
  caseSensitiveAttributes?: string[]
): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (caseSensitiveAttributes?.includes(key)) return [key, value];
      switch (typeof value) {
        case "string":
          return [key, value.toUpperCase()];
        case "object":
          return Array.isArray(value)
            ? [
                key,
                value.map((v) => (typeof v === "string" ? v.toUpperCase() : v)),
              ]
            : [key, objToUpperCase(value, caseSensitiveAttributes)];
        default:
          return [key, value];
      }
    })
  ) as T;
}
