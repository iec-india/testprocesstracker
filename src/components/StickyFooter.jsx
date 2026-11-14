import React from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function StickyFooter({
  currentStep,
  validateBasicDetailsLocal,
  validateRMSelectionLocal,
  validateQuestionnaireLocal,
  hasRequiredAttachmentsLocal,
  setErrorMsg,
  setCurrentStep,
  nextStepAfterRm,
  formData,
  setBlockStep1AutoAdvance,
  setBlockStep2AutoAdvance,
  handleFinalSubmit,
  isSubmitting,
  onBackToDashboard,
  goNextFromStep1,
  goNextFromStep2,
}) {
  if (currentStep === 5) return null;

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNextStep1 = () => {
    if (goNextFromStep1) {
      goNextFromStep1();
      return;
    }

    if (validateBasicDetailsLocal() && validateRMSelectionLocal()) {
      setErrorMsg('');
      goToStep(nextStepAfterRm);
    }
  };

  const goNextStep2 = () => {
    if (goNextFromStep2) {
      goNextFromStep2();
      return;
    }

    if (validateQuestionnaireLocal() && hasRequiredAttachmentsLocal()) {
      setErrorMsg('');
      goToStep(3);
    }
  };

    
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-4">

        {currentStep === 1 && (
          <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={() => {
                setErrorMsg('');
                if (onBackToDashboard) {
                  onBackToDashboard();
                } else {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:min-w-[140px] sm:gap-2 sm:px-5"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button
              onClick={() => {
                setErrorMsg('');
                setBlockStep1AutoAdvance(true);
                goNextStep1();
              }}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 sm:min-w-[140px] sm:gap-2 sm:px-5"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={() => {
                setErrorMsg('');
                setBlockStep1AutoAdvance(true);
                goToStep(1);
              }}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:min-w-[140px] sm:gap-2 sm:px-5"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button
              onClick={() => {
                setErrorMsg('');
                setBlockStep2AutoAdvance(true);
                goNextStep2();
              }}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 sm:min-w-[140px] sm:gap-2 sm:px-5"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <>
            <button
              onClick={() => {
                setErrorMsg('');
                setBlockStep1AutoAdvance(true);
                setBlockStep2AutoAdvance(true);
                goToStep(2);
              }}
              className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:gap-2 sm:px-5"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex min-h-12 min-w-0 flex-[2] items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed sm:gap-2 sm:px-5">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={18} /> Submit</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
