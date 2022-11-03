import { GenericForm } from "../types/GenericForm";

export function queryToString<T extends GenericForm>(query?: T) {
    return query ? Object.entries(query)
        .filter(([key, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join("&") : "";
}

export function isQueryEmpty<T extends GenericForm>(query?: T) {
  return (
    query &&
    (Object.keys(query).length === 0 ||
      !Object.values(query).some((value) => value !== null))
  );
}