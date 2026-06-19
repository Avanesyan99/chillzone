export function finalPrice(price: number, discountPct: number): number {
  if (!discountPct || discountPct <= 0) return price;
  return Math.round(price * (1 - discountPct / 100));
}
export function hasDiscount(discountPct: number): boolean {
  return discountPct > 0 && discountPct <= 100;
}
