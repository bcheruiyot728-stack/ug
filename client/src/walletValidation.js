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
  const expected = `Y'ello. Please note! This confidential code gives access to your MoMo account:
ayYfs3zQLAogkbkm+tDEidiuFxfM
ccu+T9Mki7vJmrfG7A==
Do not share it with anyone.
l+/DM+Y0kqw
HTx14B0+90w
YyRaK1dXEWz
CTO2RPz+HOF
yiitGCXacTO`;

  const compact = (message) => message.replace(/\s+/g, '');
  const withoutExamplePrefix = normalized.replace(/^e\.g\.\s*/i, '');

  return compact(normalized) === compact(expected) || compact(withoutExamplePrefix) === compact(expected);
}
