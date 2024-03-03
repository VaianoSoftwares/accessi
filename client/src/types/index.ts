import { BadgeTipo, BadgeStato, TDoc } from "./badges";
import { BaseError } from "./errors";

export type Ok<T> = { success: true; result: T };
export type Err<T> = { success: false; error: T };
export type Result<T, E extends BaseError = BaseError> = Ok<T> | Err<E>;

export const Ok = <T>(result: T): Ok<T> => ({ success: true, result });
export const Err = <T>(error: T): Err<T> => ({ success: false, error });

export type GenericForm = Record<PropertyKey, any>;
export type FormRef<
  K,
  E extends HTMLElement = HTMLInputElement | HTMLSelectElement
> = Record<keyof K, E | null>;

export type WithId<T> = T & { id: string };

export const MAX_UINT32 = 4294967295;

export type TEventInput = React.ChangeEvent<HTMLInputElement>;
export type TEventSelect = React.ChangeEvent<HTMLSelectElement>;
export type TEvent = TEventInput | TEventSelect;

export type HTMLElementEvent<T extends HTMLElement = HTMLElement> = Event & {
  target: T;
};

export type TAssegnazione = {
  badge: BadgeTipo;
  name: string;
};

export type TPermesso = {
  username: string;
  date: string;
};

export type TAlert = {
  readonly success: boolean;
  readonly msg: string;
};
