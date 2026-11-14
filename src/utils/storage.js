import { compressImage } from './helpers';
import { supabase } from '../config/supabaseClient';

export async function uploadFileToStorage(fileObj, observerName, formData = { process_type: 'unknown' }) {
  if (!supabase) throw new Error('Database not connected.');

  const withTimeout = async (promise, label, ms = 45000) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms.`)), ms));
    return Promise.race([promise, timeout]);
  };

  const processedFile = await withTimeout(compressImage(fileObj), 'Image compression');
  const cleanFileName = processedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const safeObserver = (observerName || 'anon').replace(/[^a-zA-Z0-9]/g, '_');
  const safeProcess = (formData.process_type || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = `${safeObserver}/${safeProcess}/${Date.now()}_${cleanFileName}`;

  const { data: uploadData, error: uploadError } = await withTimeout(
    supabase.storage.from('iec_documents').upload(filePath, processedFile),
    'Document upload'
  );

  if (uploadError) throw uploadError;

  const { data: { publicUrl } = {} } = supabase.storage.from('iec_documents').getPublicUrl(filePath) || { data: {} };
  return publicUrl || uploadData?.fullPath || filePath;
}
