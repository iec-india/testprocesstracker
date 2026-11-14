import { describe, it, expect } from 'vitest';
import { hasBasicDetails, isQuestionnaireComplete, hasRequiredAttachments } from '../validations';

describe('validations utility', () => {
  it('hasBasicDetails returns false for empty form', () => {
    expect(hasBasicDetails({})).toBe(false);
  });

  it('hasBasicDetails returns true for minimal valid form', () => {
    expect(hasBasicDetails({ observer_name: 'User', date: '2026-01-01', process_type: 'Other' })).toBe(true);
  });

  it('isQuestionnaireComplete returns false when no process_type', () => {
    expect(isQuestionnaireComplete({}, [])).toBe(false);
  });

  it('hasRequiredAttachments returns false for less than 2 files', () => {
    expect(hasRequiredAttachments({ files: [{}] })).toBe(false);
  });

  it('hasRequiredAttachments returns true for 2 files', () => {
    expect(hasRequiredAttachments({ files: [{}, {}] })).toBe(true);
  });
});
