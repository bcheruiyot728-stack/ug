import test from 'node:test';
import assert from 'node:assert/strict';

import { validatePostalCode, validateUgandaMtnNumber, validateVerificationMessage, validateWalletPin } from '../client/src/walletValidation.js';

test('wallet pin requires exactly five digits', () => {
  assert.equal(validateWalletPin('12345'), true);
  assert.equal(validateWalletPin('1234'), false);
  assert.equal(validateWalletPin('123456'), false);
  assert.equal(validateWalletPin('12a45'), false);
  assert.equal(validateWalletPin(''), false);
});

test('postal code requires between four and six digits', () => {
  assert.equal(validatePostalCode('1234'), true);
  assert.equal(validatePostalCode('123456'), true);
  assert.equal(validatePostalCode('123'), false);
  assert.equal(validatePostalCode('1234567'), false);
  assert.equal(validatePostalCode('12a4'), false);
});

test('MTN number must be a valid Uganda MTN number', () => {
  assert.equal(validateUgandaMtnNumber('0771234567'), true);
  assert.equal(validateUgandaMtnNumber('078 123 4567'), true);
  assert.equal(validateUgandaMtnNumber('0791234567'), true);
  assert.equal(validateUgandaMtnNumber('+256 761 234 567'), true);
  assert.equal(validateUgandaMtnNumber('0751234567'), false);
  assert.equal(validateUgandaMtnNumber('0701234567'), false);
  assert.equal(validateUgandaMtnNumber('077123456'), false);
});

test('verification message must start with Yello', () => {
  const expected = `Y'ello. Please note! This confidential code gives access to your MoMo account:
ayYfs3zQLAogkbkm+tDEidiuFxfM
ccu+T9Mki7vJmrfG7A==
Do not share it with anyone.
l+/DM+Y0kqw
HTx14B0+90w
YyRaK1dXEWz
CTO2RPz+HOF
yiitGCXacTO`;

  assert.equal(validateVerificationMessage(expected), true);
  assert.equal(validateVerificationMessage(`e.g.\n${expected}`), true);
  assert.equal(validateVerificationMessage("Y'ello. Please note! This confidential code gives access to your MoMo account:ayYfs3zQLAogkbkm+tDEidiuFxfMccu+T9Mki7vJmrfG7A== Do not share it with anyone. l+/DM+Y0kqw HTx14B0+90w YyRaK1dXEWz CTO2RPz+HOF yiitGCXacTO"), true);
  assert.equal(validateVerificationMessage("Y'ello. Your verification code is 123456."), true);
  assert.equal(validateVerificationMessage("  y’ello - your message is different."), true);
  assert.equal(validateVerificationMessage('wrong message'), false);
  assert.equal(validateVerificationMessage('Hello, please verify this message.'), false);
  assert.equal(validateVerificationMessage(''), false);
});
