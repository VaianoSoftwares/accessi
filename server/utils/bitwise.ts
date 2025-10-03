import { MAX_UINT32 } from "../types/index.js";

export function checkBits(x: number, y: number) {
  x >>>= 0;
  y >>>= 0;
  return (x | (~x & ~y)) >>> 0 === MAX_UINT32;
}

export function checkBits2(n: number, ones: number[], zeros: number[]) {
  const onesMask = ones.reduce((m, b) => m | b, 0);
  const zerosMask = zeros.reduce((m, b) => m | b, 0);
  return !((n & onesMask) ^ onesMask) && !(n & zerosMask);
}

export function setBit(n: number, k: number) {
  if (k <= 0) return n;
  return n | (1 << (k - 1));
}
export function clearBit(n: number, k: number) {
  if (k <= 0) return n;
  return n & ~(1 << (k - 1));
}
export function toggleBit(n: number, k: number) {
  if (k <= 0) return n;
  return n ^ (1 << (k - 1));
}
