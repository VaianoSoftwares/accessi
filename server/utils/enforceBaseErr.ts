import { BaseError } from "../_types/errors.js";

export default function enforceBaseErr(e: unknown) {
  if (e instanceof BaseError) return e;
  else if (e instanceof Error) {
    const baseErr = new BaseError(e.message);
    baseErr.cause = e.cause;
    return baseErr;
  }

  let errStr = "unknown";
  try {
    errStr = JSON.stringify(e);
  } catch {}

  return new BaseError(errStr);
}
