import { describe, expect, it } from 'vitest';
import { formatDate, getParticipationTotal, getProcessStyle, parseAttachmentUrls } from '../historyUtils';

describe('historyUtils', () => {
  it('parses comma-separated attachment URLs safely', () => {
    expect(parseAttachmentUrls(' https://a.test/1.jpg, ,https://a.test/2.jpg ')).toEqual([
      'https://a.test/1.jpg',
      'https://a.test/2.jpg',
    ]);
  });

  it('totals numeric participation values and ignores invalid entries', () => {
    expect(getParticipationTotal({ p01: '4', p02: 3, p03: 'bad' })).toBe(7);
  });

  it('formats valid dates and preserves invalid values', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(formatDate('2026-07-31')).toContain('2026');
  });

  it('returns fallback styling for unknown process types', () => {
    expect(getProcessStyle('Missing Process').badge).toBe('bg-slate-600 text-white');
  });
});
