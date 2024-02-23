import { MAX_UINT32 } from "../_types/index.js";

export function checkBits(x: number, y: number) {
  x >>>= 0;
  y >>>= 0;
  return (x | (~x & ~y)) >>> 0 === MAX_UINT32;
}
