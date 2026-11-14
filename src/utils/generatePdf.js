export async function generatePdfFromElement(element, filename = 'report.pdf') {
  if (!element) throw new Error('Element is required');

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ]);
  const html2canvas = html2canvasModule.default ?? html2canvasModule;
  if (typeof jsPDF !== 'function') throw new Error('Unable to load jsPDF constructor');
  if (typeof html2canvas !== 'function') throw new Error('Unable to load html2canvas');

  const originalStyles = new Map();
  const parents = [];
  let current = element;
  
  while (current && current !== document) {
    parents.push(current);
    originalStyles.set(current, current.style.cssText);
    current = current.parentNode;
  }
  originalStyles.set(document.body, document.body.style.cssText);
  originalStyles.set(document.documentElement, document.documentElement.style.cssText);

  document.documentElement.style.setProperty('height', 'auto', 'important');
  document.documentElement.style.setProperty('overflow', 'visible', 'important');
  document.body.style.setProperty('height', 'auto', 'important');
  document.body.style.setProperty('overflow', 'visible', 'important');
  
  parents.forEach(p => {
    if (p && p.style) {
      p.style.setProperty('height', 'auto', 'important');
      p.style.setProperty('max-height', 'none', 'important');
      p.style.setProperty('overflow', 'visible', 'important');
    }
  });

  await new Promise(resolve => setTimeout(resolve, 150));

  const captureWidth = Math.max(1, element.scrollWidth || element.offsetWidth || element.clientWidth || 1);
  const captureHeight = Math.max(1, element.scrollHeight || element.offsetHeight || element.clientHeight || 1);
  const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    width: captureWidth,
    height: captureHeight,
    windowWidth: document.documentElement.scrollWidth || captureWidth,
    windowHeight: document.documentElement.scrollHeight || captureHeight,
    scrollX: 0,
    scrollY: 0,
  });

  originalStyles.forEach((cssText, node) => {
    if (node && node.style) {
      node.style.cssText = cssText;
    }
  });

  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  
  const pageCanvasHeight = Math.max(1, Math.floor((printableHeight / printableWidth) * canvas.width));

  for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; sourceY += pageCanvasHeight, pageIndex += 1) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
    
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const context = pageCanvas.getContext?.('2d');
    let imageData;

    if (context) {
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      imageData = pageCanvas.toDataURL?.('image/png');
    } else if (typeof canvas.toDataURL === 'function') {
      imageData = canvas.toDataURL('image/png');
    } else if (typeof pageCanvas.toDataURL === 'function') {
      imageData = pageCanvas.toDataURL('image/png');
    } else {
      throw new Error('Canvas export is not supported in this environment');
    }

    if (pageIndex > 0 && typeof doc.addPage === 'function') doc.addPage();
    const imageHeight = (sliceHeight * printableWidth) / canvas.width;
    doc.addImage(imageData, 'PNG', margin, margin, printableWidth, imageHeight);
  }

  doc.save(filename);
}