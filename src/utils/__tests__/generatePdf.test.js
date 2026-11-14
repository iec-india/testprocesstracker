import { vi, describe, it, expect } from 'vitest';

// Mock html2canvas-pro to return a canvas-like object
vi.mock('html2canvas-pro', () => ({
  default: async () => {
    const canvas = {
      width: 800,
      height: 1200,
      toDataURL: () => 'data:image/png;base64,TEST'
    };
    return canvas;
  }
}));

const saveMock = vi.fn();
const addImageMock = vi.fn();
vi.mock('jspdf', () => {
  return {
    jsPDF: function () {
      this.internal = { pageSize: { getWidth: () => 595.28, getHeight: () => 841.89 } };
      this.addImage = addImageMock;
      this.save = saveMock;
      return this;
    }
  };
});

import { generatePdfFromElement } from '../generatePdf';

describe('generatePdfFromElement', () => {
  it('calls jsPDF.save after generating image', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    }));
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,TEST');

    // create a fake element with an img inside to ensure hiding logic runs
    const container = document.createElement('div');
    const img = document.createElement('img');
    img.style.cssText = 'color: red';
    container.appendChild(img);

    await generatePdfFromElement(container, 'test.pdf');

    expect(addImageMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith('test.pdf');
  });
});
