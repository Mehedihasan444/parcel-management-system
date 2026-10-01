/**
 * Parcel price tiers (BDT). Single source of truth for the booking and
 * update-booking forms, which previously duplicated this if/else chain.
 *
 * Tiers mirror the original app exactly: 1kg → 50, 2kg → 100, above 2kg →
 * 150. Anything else (0, negative, empty, non-numeric) is invalid and
 * returns null so callers can show a warning instead of posting a bad price.
 */
export function calculatePrice(weight) {
  const normalized = String(weight ?? "").trim();
  if (normalized === "1" || normalized === "2") {
    return normalized === "1" ? 50 : 100;
  }
  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && numeric > 2) return 150;
  return null;
}

export const PRICE_TIERS = [
  { label: "Up to 1 kg", price: 50 },
  { label: "Up to 2 kg", price: 100 },
  { label: "Above 2 kg", price: 150 },
];

export default calculatePrice;
