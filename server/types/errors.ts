import { Jsonable } from "./index.js";

type BaseErrorOptions = { status?: number; cause?: Error; context?: Jsonable };

export class BaseError extends Error {
  public readonly status: number;
  public readonly context?: Jsonable;

  constructor(message: string, options: BaseErrorOptions = {}) {
    const { status, cause, context } = options;

    super(message, { cause });

    this.name = this.constructor.name;
    this.status = status || 500;
    this.context = context;

    Error.captureStackTrace(this);
  }

  public toJSON(): object {
    return { ...this, message: this.message, cause: this.cause };
  }
}
