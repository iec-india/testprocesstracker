import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export function ValidationModal({ validationContext, handleValidationModalClose }) {
  if (!validationContext) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-step" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner sm:h-16 sm:w-16">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-center text-xl font-extrabold text-slate-900 sm:text-2xl">{validationContext.title || 'कुछ प्रश्न अधूरे हैं'}</h3>
        <p className="mt-3 text-center text-sm font-medium text-slate-600 sm:text-base">{validationContext.subtitle || 'कृपया सभी आवश्यक प्रश्नों का उत्तर दें'}</p>
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-red-500">{validationContext.label || 'Missing Question'}</p>
          <p className="text-[15px] font-bold leading-relaxed text-slate-800">{validationContext.message}</p>
        </div>
        <button type="button" autoFocus onClick={handleValidationModalClose} className="premium-btn mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 text-base font-extrabold text-white shadow-xl">
          ठीक है
        </button>
      </div>
    </div>
  );
}

export function SubmittingOverlay({ isSubmitting }) {
  if (!isSubmitting) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/70 px-6 text-center backdrop-blur-lg">
      <Loader2 className="animate-spin text-[#0072CE] mb-6" size={56} />
      <h3 className="text-2xl font-extrabold text-slate-800 animate-pulse sm:text-3xl">Saving securely...</h3>
      <p className="text-slate-600 font-medium mt-3 text-base sm:text-lg">Compressing and uploading documents. Please wait.</p>
    </div>
  );
}
