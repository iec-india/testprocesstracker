/* @vitest-environment jsdom */
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock compressImage to return the same file
vi.mock('../../../src/utils/helpers', () => ({
  compressImage: vi.fn((f) => Promise.resolve(f)),
}));

// Create a supabase storage mock
const uploadMock = vi.fn(async () => ({ data: { path: 'some/path' }, error: null }));
const getPublicMock = vi.fn(() => ({ data: { publicUrl: 'https://cdn.example/test.jpg' } }));

vi.mock('../../../src/config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ subscription: { unsubscribe: () => {} } })),
    },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) })),
    storage: {
      from: () => ({ upload: uploadMock, getPublicUrl: getPublicMock }),
    },
  }
}));

describe('uploadToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads a file and returns public URL', async () => {
    const file = new File(['dummy-data'], 'photo.png', { type: 'image/png' });

    const { uploadFileToStorage } = await import('../../../src/utils/storage.js');
    const res = await uploadFileToStorage(file, 'Tester', { process_type: 'P1' });
    expect(uploadMock).toHaveBeenCalled();
    expect(getPublicMock).toHaveBeenCalled();
    expect(res).toBe('https://cdn.example/test.jpg');

    // no DOM harness was mounted for this test
  });
});
