export function validateWalletPin(value) {
  const normalized = String(value ?? '').trim();
  return /^\d{5}$/.test(normalized);
}
