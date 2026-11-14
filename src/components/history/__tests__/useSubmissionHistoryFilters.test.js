import { describe, it, expect } from 'vitest';
import { buildIndicatorReportData } from '../useSubmissionHistoryFilters';

describe('buildIndicatorReportData', () => {
  it('groups answers by indicator and counts each response', () => {
    const data = buildIndicatorReportData([
      { answers: { q1: 'Yes', q2: '3' } },
      { answers: { q1: 'No', q2: '3' } },
      { answers: { q1: 'Yes' } },
    ]);

    expect(data).toHaveLength(2);
    const first = data.find((item) => item.id === 'q1');
    expect(first.totalResponses).toBe(3);
    expect(first.answerBreakdown).toEqual([
      { answer: 'Yes', count: 2 },
      { answer: 'No', count: 1 },
    ]);
  });
});
