import React, { useEffect, useState, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { App as CapacitorApp } from '@capacitor/app';
import { AlertCircle, PlusSquare, ClipboardList } from 'lucide-react';
import { useProcessTracker } from './hooks/useProcessTracker';
import { LoginScreen, SplashScreen } from './components/AuthScreens';
import { ValidationModal, SubmittingOverlay } from './components/AppOverlays';
const StepBasicDetails = React.lazy(() => import('./components/StepBasicDetails'));
const StepQuestionnaire = React.lazy(() => import('./components/StepQuestionnaire'));
const StepParticipation = React.lazy(() => import('./components/StepParticipation'));
const StepSuccess = React.lazy(() => import('./components/StepSuccess'));
const SubmissionHistory = React.lazy(() => import('./components/SubmissionHistory'));
const StickyFooter = React.lazy(() => import('./components/StickyFooter'));

const questionCardClass = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 sm:rounded-2xl sm:p-4 md:p-5';
const selectFieldClass = 'premium-input premium-select appearance-none w-full rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-3 pr-10 text-base font-semibold text-slate-800 shadow-sm transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-md focus:border-[#0072CE] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-400 disabled:opacity-70 sm:rounded-2xl sm:px-4 sm:py-3.5 sm:pr-11';
const manualFieldClass = 'premium-input w-full rounded-xl border border-blue-200 bg-blue-50/90 px-3.5 py-3 text-base font-semibold text-slate-800 shadow-sm transition-all duration-200 placeholder:text-blue-300 focus:border-[#0072CE] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:rounded-2xl sm:px-4 sm:py-3.5';

export default function App() {
  const tracker = useProcessTracker();
  const [showDashboard, setShowDashboard] = useState(true);
  const { handleAuthDeepLink, setCurrentStep, closeSubmissionHistory } = tracker;

  useEffect(() => {
    let listenerHandle;

    const registerDeepLinkListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        if (!url?.includes('processtracker://')) return;

        const authenticated = await handleAuthDeepLink(url);
        if (!authenticated) return;

        setShowDashboard(true);
        setCurrentStep(1);
        closeSubmissionHistory();
        window.history.replaceState({}, document.title, '/dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    };

    registerDeepLinkListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [handleAuthDeepLink, setCurrentStep, closeSubmissionHistory]);

  const goNextFromStep1 = () => {
    if (tracker.validateBasicDetailsLocal() && tracker.validateRMSelectionLocal()) {
      tracker.setErrorMsg('');
      tracker.setCurrentStep(tracker.nextStepAfterRm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBackToDashboard = () => {
    setShowDashboard(true);
    tracker.setCurrentStep(1);
    tracker.closeSubmissionHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNextFromStep2 = () => {
    if (tracker.validateQuestionnaireLocal() && tracker.hasRequiredAttachmentsLocal()) {
      tracker.setErrorMsg('');
      tracker.setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (tracker.authChecking) return <div className="min-h-screen bg-[#f8fafc]"></div>;
  if (!tracker.userEmail) return <LoginScreen handleGoogleLogin={tracker.handleGoogleLogin} />;
  if (tracker.showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-x-hidden font-sans text-slate-900 pb-32 sm:pb-36">
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#0f172a', color: '#fff' } }} />
      <div className="floating-letters-bg" aria-hidden="true">
        A अ 1 B आ 2 C इ 3 D ई 4 E उ 5 F ऊ 6 G ऋ 7 H ए 8 I ऐ 9 J ओ 0 K औ L क M ख N ग O घ P ङ Q च R छ S ज T झ U ञ V ट W ठ X ड Y ढ Z ण 0 त 1 थ 2 द 3 ध 4 न 5 प 6 फ 7 ब 8 भ 9 म A य B र C ल D व E श F ष G स H ह
      </div>

      <div className="absolute top-3 left-3 z-50 pointer-events-auto sm:top-4 sm:left-4 md:top-8 md:left-10">
        <img className="h-14 sm:h-[75px] md:h-[110px] drop-shadow-2xl hover:scale-105 transition-transform duration-300" src="/logo_clear.png" alt="IEC Logo" loading="lazy" decoding="async" />
      </div>

      <div className="hero-banner-container">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900/30 to-transparent z-10"></div>
        <div className="hero-slider-track" aria-hidden="true">
          {['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg1.jpg'].map((src, i) => (
            <img key={i} src={`/${src}`} alt="Decorative background" loading="lazy" decoding="async" />
          ))}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-50 pointer-events-auto sm:top-4 sm:right-4 md:top-8 md:right-10">
        <div className="rounded-xl bg-white/95 px-2.5 py-2 shadow-sm flex flex-col gap-2 sm:rounded-2xl sm:px-4 sm:flex-row sm:items-center">
          <p className="hidden max-w-[220px] truncate text-sm font-semibold text-slate-900 sm:block md:text-base">Hello, {tracker.userName || 'User'}!</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={tracker.handleLogout}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition hover:bg-red-700 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto pt-32 sm:pt-[160px] md:pt-[180px] relative z-20 px-3 sm:px-4 md:px-12">
        {tracker.errorMsg && (
          <div className="mb-5 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-step shadow-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700 sm:text-base">{tracker.errorMsg}</p>
          </div>
        )}

        {!showDashboard && (
          <div className="mb-5 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDashboard(true);
                tracker.setCurrentStep(1);
                tracker.closeSubmissionHistory();
                window.scrollTo({ top: 0 });
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 sm:rounded-2xl"
            >
              Home
            </button>
          </div>
        )}

        {tracker.showHistory ? (
          <Suspense fallback={<div className="py-16 text-center">Loading history…</div>}>
            <SubmissionHistory
              submissions={tracker.submissions}
              iecSubmissions={tracker.iecSubmissions}
              questionMeta={tracker.questionMeta}
              isLoading={tracker.historyLoading}
              historyError={tracker.historyError}
              iecHistoryLoading={tracker.iecHistoryLoading}
              iecHistoryError={tracker.iecHistoryError}
              onBack={tracker.closeSubmissionHistory}
            />
          </Suspense>
        ) : showDashboard ? (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 animate-step sm:grid-cols-2 sm:gap-6">
            <button
              type="button"
              onClick={() => { setShowDashboard(false); tracker.setCurrentStep(1); tracker.closeSubmissionHistory(); window.scrollTo({ top: 0 }); }}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <PlusSquare size={28} className="text-[#0072CE]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">New Form</h3>
                  <p className="text-sm text-slate-500">Start a new assessment submission.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setShowDashboard(false); tracker.openSubmissionHistory(); window.scrollTo({ top: 0 }); }}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <ClipboardList size={28} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Reports</h3>
                  <p className="text-sm text-slate-500">View submission history and reports.</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div key={tracker.currentStep} className="animate-step">
            {tracker.currentStep === 1 && (
              <Suspense fallback={<div className="py-16 text-center">Loading form…</div>}>
                <StepBasicDetails
                  formData={tracker.formData}
                  setFormData={tracker.setFormData}
                  setBlockStep1AutoAdvance={tracker.setBlockStep1AutoAdvance}
                  handleProcessChange={tracker.handleProcessChange}
                  isLoadingData={tracker.isLoadingData}
                  rmData={tracker.rmData}
                  processTypes={tracker.processTypes}
                  selectFieldClass={selectFieldClass}
                  manualFieldClass={manualFieldClass}
                  onStep1Next={goNextFromStep1}
                />
              </Suspense>
            )}

            {tracker.currentStep === 2 && (
              <Suspense fallback={<div className="py-16 text-center">Loading questions…</div>}>
                <StepQuestionnaire
                  formData={tracker.formData}
                  setFormData={tracker.setFormData}
                  active_questions={tracker.active_questions}
                  isGroupA={tracker.isGroupA}
                  questionnaireTitle={tracker.questionnaireTitle}
                  highlightedQuestionId={tracker.highlightedQuestionId}
                  blockStep2AutoAdvance={tracker.blockStep2AutoAdvance}
                  setBlockStep2AutoAdvance={tracker.setBlockStep2AutoAdvance}
                  handleAddFiles={tracker.handleAddFiles}
                  handleRemoveFile={tracker.handleRemoveFile}
                  handleRemoveGpReceipt={tracker.handleRemoveGpReceipt}
                  gpInputRef={tracker.gpInputRef}
                  handleNumericKeyDown={tracker.handleNumericKeyDown}
                  questionCardClass={questionCardClass}
                  notifyValidationError={tracker.notifyValidationError}
                  setValidationContext={tracker.setValidationContext}
                  isQuestionnaireComplete={tracker.isQuestionnaireCompleteLocal}
                  hasRequiredAttachments={tracker.hasRequiredAttachmentsLocal}
                  onAutoAdvance={goNextFromStep2}
                />
              </Suspense>
            )}

            {tracker.currentStep === 3 && (
              <Suspense fallback={<div className="py-16 text-center">Loading participation…</div>}>
                <StepParticipation
                  formData={tracker.formData}
                  setFormData={tracker.setFormData}
                  participation_questions_list={tracker.participation_questions_list}
                  handleNumericKeyDown={tracker.handleNumericKeyDown}
                  questionCardClass={questionCardClass}
                />
              </Suspense>
            )}

            {tracker.currentStep === 5 && (
              <Suspense fallback={<div className="py-16 text-center">Loading success view…</div>}>
                <StepSuccess
                  formData={tracker.formData}
                  active_questions={tracker.active_questions}
                  participation_questions_list={tracker.participation_questions_list}
                  setFormData={tracker.setFormData}
                  fileInputRef={tracker.fileInputRef}
                  gpInputRef={tracker.gpInputRef}
                  setErrorMsg={tracker.setErrorMsg}
                  setCurrentStep={tracker.setCurrentStep}
                />
              </Suspense>
            )}
        </div>
      )}
      </div>

      { !tracker.showHistory && !showDashboard && (
        <Suspense fallback={<div className="fixed bottom-0 w-full bg-white/90 p-4 text-center">Loading…</div>}>
          <StickyFooter
            currentStep={tracker.currentStep}
            hasBasicDetailsLocal={tracker.hasBasicDetailsLocal}
            isRmCompleteLocal={tracker.isRmCompleteLocal}
            validateBasicDetailsLocal={tracker.validateBasicDetailsLocal}
            validateRMSelectionLocal={tracker.validateRMSelectionLocal}
            validateQuestionnaireLocal={tracker.validateQuestionnaireLocal}
            hasRequiredAttachmentsLocal={tracker.hasRequiredAttachmentsLocal}
            setErrorMsg={tracker.setErrorMsg}
            setCurrentStep={tracker.setCurrentStep}
            nextStepAfterRm={tracker.nextStepAfterRm}
            formData={tracker.formData}
            setBlockStep1AutoAdvance={tracker.setBlockStep1AutoAdvance}
            setBlockStep2AutoAdvance={tracker.setBlockStep2AutoAdvance}
            handleFinalSubmit={tracker.handleFinalSubmit}
            isSubmitting={tracker.isSubmitting}
            onBackToDashboard={goBackToDashboard}
            goNextFromStep1={goNextFromStep1}
            goNextFromStep2={goNextFromStep2}
          />
        </Suspense>
      )}

      <ValidationModal validationContext={tracker.validationContext} handleValidationModalClose={tracker.handleValidationModalClose} />
      <SubmittingOverlay isSubmitting={tracker.isSubmitting} />
    </div>
  );
}
