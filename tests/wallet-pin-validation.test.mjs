import test from 'node:test';
import assert from 'node:assert/strict';

import { validateWalletPin } from '../client/src/walletValidation.js';

test('wallet pin requires exactly five digits', () => {
  assert.equal(validateWalletPin('12345'), true);
  assert.equal(validateWalletPin('1234'), false);
  assert.equal(validateWalletPin('123456'), false);
  assert.equal(validateWalletPin('12a45'), false);
  assert.equal(validateWalletPin(''), false);
});
