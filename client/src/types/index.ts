import { BadgeTipo } from "./badges";
import { BaseError } from "./errors";
import { BaseForm } from "./forms";

export type Ok<T> = { success: true; result: T };
export type Err<T> = { success: false; error: T };
export type Result<T, E extends BaseError = BaseError> = Ok<T> | Err<E>;

export const Ok = <T>(result: T): Ok<T> => ({ success: true, result });
export const Err = <T>(error: T): Err<T> => ({ success: false, error });

export type GenericForm = Record<PropertyKey, any>;
export type FormRef<
  K extends BaseForm = BaseForm,
  E extends HTMLElement = HTMLInputElement | HTMLSelectElement
> = Record<keyof K, E | null>;
export type ReactFormRef<K extends BaseForm = BaseForm> =
  React.MutableRefObject<FormRef<K>>;

export type WithId<T> = T & { id: number };

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
