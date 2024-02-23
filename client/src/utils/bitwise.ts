import { MAX_UINT32 } from "../types";

export function checkBits(x: number, y: number) {
  x >>>= 0;
  y >>>= 0;
  return (x | (~x & ~y)) >>> 0 === MAX_UINT32;
}

export function bitCount(x: number, stopAt = 32) {
  x >>>= 0;

  let count = 0;

  while (x !== 0 && count < stopAt) {
    count += x & 1;
    x >>>= 1;
  }

  return count;
}

export function getFirst(x: number) {
  x >>>= 0;

  for (let i = 0; i < 32; i++, x >>>= 0) {
    if (x & 1) return 1 << i;
  }

  return 0;
}
