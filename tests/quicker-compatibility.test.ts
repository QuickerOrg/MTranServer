import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import { NormalizeLanguageCode } from '../src/utils/lang-alias';
import { errorHandler } from '../src/middleware/error-handler';
import * as logger from '../src/logger';

afterEach(() => mock.restore());

test('Norwegian aliases match the frozen model registry', () => {
  for (const code of ['nb', 'no', 'nb-NO', 'no_NO']) expect(NormalizeLanguageCode(code)).toBe('nb');
});

test.each([
  [{ status: 400, message: 'Missing text' }, 400, 'Bad Request'],
  [{ message: 'No model found for xx -> en' }, 400, 'Bad Request'],
  [{ status: 401, message: 'Unauthorized' }, 401, 'Unauthorized'],
  [{ message: 'Backend failed' }, 500, 'Internal Server Error'],
] as const)('error contract preserves status for %j', (error, expectedStatus, expectedError) => {
  spyOn(logger, 'error').mockImplementation(() => {});
  spyOn(logger, 'warn').mockImplementation(() => {});
  const json = mock(() => {});
  const status = mock(() => ({ json }));
  errorHandler()(error, { id: 'compatibility-test' } as any, { status } as any, mock(() => {}));
  expect(status).toHaveBeenCalledWith(expectedStatus);
  expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: expectedError, requestId: 'compatibility-test' }));
});
