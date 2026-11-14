/* @vitest-environment jsdom */
import React, { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock the supabase client before importing the hook
const supabaseMock = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn(() => ({ subscription: { unsubscribe: () => {} } })),
  },
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({
        order: async () => ({ data: [], error: null }),
      }),
    }),
  })),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

vi.mock('../../../src/config/supabaseClient', () => ({ supabase: supabaseMock }));
vi.mock('../../../src/config/appConfig', () => ({ GOOGLE_SHEET_URL: 'https://sheet.example/data' }));

// Provide a fake fetch handler for sheet loading
const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ questions: [], rmData: [], indicators: [], participation: [] }) }));

describe('useProcessTracker (smoke)', () => {
  let container;

  beforeEach(() => {
    // set up DOM container
    container = document.createElement('div');
    document.body.appendChild(container);
    // mock global.fetch
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it('renders hook and initializes state without supabase session', async () => {
    // Import inside test so mocks are active (use dynamic ESM import)
    const { useProcessTracker } = await import('../../../src/hooks/useProcessTracker.js');

    function Harness() {
      const tracker = useProcessTracker();
      return (
        <div>
          <span data-testid="loading">{String(tracker.isLoadingData)}</span>
          <span data-testid="auth">{String(tracker.authChecking)}</span>
          <span data-testid="email">{tracker.userEmail || 'no-email'}</span>
        </div>
      );
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(<Harness />);
      await new Promise((r) => setTimeout(r, 50));
    });

    const loading = container.querySelector('[data-testid="loading"]').textContent;
    const auth = container.querySelector('[data-testid="auth"]').textContent;
    const email = container.querySelector('[data-testid="email"]').textContent;

    expect(loading).toBe('false');
    expect(auth).toBe('false');
    expect(email).toBe('no-email');
  });

  it('derives process types from sheet categories only', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        questions: [
          { ID: 'q1', 'Question Text': 'Question one', Category: 'Sheet Process A, Sheet Process B' },
        ],
        rmData: [],
        indicators: [
          { ID: 'i1', 'Indicator Text': 'Indicator one', Category: 'Sheet Process C' },
        ],
        participation: [
          { ID: 'p01', Participants: 'Teachers', 'Process Name': 'SGS' },
        ],
      }),
    });

    const { useProcessTracker } = await import('../../../src/hooks/useProcessTracker.js');

    function Harness() {
      const tracker = useProcessTracker();
      return <div data-testid="processes">{tracker.processTypes.join('|')}</div>;
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(<Harness />);
      await new Promise((r) => setTimeout(r, 50));
    });

    const processes = container.querySelector('[data-testid="processes"]').textContent;
    expect(processes).toBe('Sheet Process A|Sheet Process B|Sheet Process C');
    expect(processes).not.toContain('SGS');
  });
});