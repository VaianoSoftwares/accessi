import { BaseError } from "./errors.js";

export type Jsonable =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Jsonable[]
  | { readonly [key: string]: Jsonable }
  | { toJSON(): Jsonable };

export type WithId<T> = T & { id: number };

export type Ok<T> = { success: true; result: T };
export type Err<T> = { success: false; error: T };
export type Result<T, E extends BaseError = BaseError> = Ok<T> | Err<E>;

export const Ok = <T>(result: T): Ok<T> => ({ success: true, result });
export const Err = <T>(error: T): Err<T> => ({ success: false, error });

export const MAX_UINT32 = 4294967295;
