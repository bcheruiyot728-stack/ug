export function validateWalletPin(value) {
  const normalized = String(value ?? '').trim();
  return /^\d{5}$/.test(normalized);
}

export function validateUgandaMtnNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return /^(?:0(?:76|77|78|79)\d{7}|256(?:76|77|78|79)\d{7})$/.test(digits);
}

export function validateVerificationMessage(value) {
  const normalized = String(value ?? '').replace(/\r/g, '').trim();
  const withoutExamplePrefix = normalized.replace(/^e\.g\.\s*/i, '');

  return /^y['’]ello\b/i.test(withoutExamplePrefix);
}
