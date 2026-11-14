import React, { useEffect, useRef, useState } from 'react';
import { CloudUpload, CheckCircle2, X } from 'lucide-react';

export default function StepQuestionnaire({
  formData,
  setFormData,
  active_questions,
  isGroupA,
  questionnaireTitle,
  highlightedQuestionId,
  blockStep2AutoAdvance,
  setBlockStep2AutoAdvance,
  handleAddFiles,
  handleRemoveFile,
  handleRemoveGpReceipt,
  gpInputRef,
  handleNumericKeyDown,
  questionCardClass,
  notifyValidationError,
  setValidationContext,
  isQuestionnaireComplete,
  hasRequiredAttachments,
  onAutoAdvance,
}) {
  void notifyValidationError;
  void setValidationContext;

  const questionnaireRef = useRef(null);
  const [showAdvanceNotice, setShowAdvanceNotice] = useState(false);

  useEffect(() => {
    const scrollTargetId = highlightedQuestionId ? `question-${highlightedQuestionId}` : active_questions?.[0]?.id ? `question-${active_questions[0].id}` : null;
    const scrollToQuestion = () => {
      if (scrollTargetId) {
        document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        questionnaireRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.setTimeout(scrollToQuestion, 60);
  }, [active_questions, highlightedQuestionId]);
  const questionnaireComplete = typeof isQuestionnaireComplete === 'function'
    ? isQuestionnaireComplete(formData)
    : false;
  const attachmentsComplete = typeof hasRequiredAttachments === 'function'
    ? hasRequiredAttachments(formData)
    : false;

  useEffect(() => {
    if (typeof isQuestionnaireComplete !== 'function' || typeof hasRequiredAttachments !== 'function') {
      console.warn('StepQuestionnaire props missing functions:', {
        isQuestionnaireComplete: typeof isQuestionnaireComplete,
        hasRequiredAttachments: typeof hasRequiredAttachments,
      });
    }

    if (onAutoAdvance && !blockStep2AutoAdvance && questionnaireComplete && attachmentsComplete) {
      window.setTimeout(() => setShowAdvanceNotice(true), 0);
    } else {
      window.setTimeout(() => setShowAdvanceNotice(false), 0);
    }
  }, [formData, onAutoAdvance, questionnaireComplete, attachmentsComplete, blockStep2AutoAdvance, isQuestionnaireComplete, hasRequiredAttachments]);

  const updateAnswer = (questionId, value) => {
    setBlockStep2AutoAdvance(false);
    setFormData({ ...formData, answers: { ...formData.answers, [questionId]: value } });
  };

  return (
    <div className="space-y-6" ref={questionnaireRef}>
      <div className="premium-glass rounded-2xl p-4 sm:p-5 md:p-8">
        <div className="bg-blue-50 border-l-4 border-[#0072CE] p-3 rounded-r-lg mb-5 sm:p-4 sm:mb-8">
          <h3 className="text-lg font-bold text-[#0072CE] animate-title sm:text-xl">{questionnaireTitle}</h3>
        </div>

        {showAdvanceNotice && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
            Completed — moving to next step
          </div>
        )}

        {isGroupA ? (
          active_questions.map((q, i) => {
            const qType = (q.type || 'Dropdown').toLowerCase();
            const isMissingHighlighted = highlightedQuestionId === q.id;
            // If dropdown has 2 or more options, render each option as a card instead of a select
            if (qType === 'dropdown' && Array.isArray(q.options) && q.options.length >= 2) {
              const selected = formData.answers[q.id] || '';
              return (
                <div key={q.id} id={`question-${q.id}`} className={`${questionCardClass} mb-3 ${isMissingHighlighted ? 'ring-4 ring-red-100 border-red-400 bg-red-50/70' : ''}`}>
                  <div className="block mb-2 text-sm font-semibold text-slate-900 whitespace-normal break-words leading-snug">Q{i + 1}. {q.text}</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt) => {
                      const val = opt;
                      const isSelected = String(selected) === String(val);
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateAnswer(q.id, val)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-150 sm:rounded-2xl sm:hover:scale-[1.01] ${isSelected ? 'ring-4 ring-emerald-300 border-emerald-600 bg-emerald-300 shadow-sm' : 'border-emerald-400 bg-emerald-200 hover:bg-emerald-300'} text-slate-900`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-700 text-white' : 'border border-slate-300 text-slate-500'}`}>
                              <span className="text-[10px] font-bold">{isSelected ? '●' : ''}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="mt-1 text-sm text-slate-700 leading-snug whitespace-normal break-words">{opt}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Fallback: render other Group A question types (dropdown select, numeric, text, date)
            return (
              <div key={q.id} id={`question-${q.id}`} className={`${questionCardClass} mb-3 ${isMissingHighlighted ? 'ring-4 ring-red-100 border-red-400 bg-red-50/70' : ''}`}>
                <label className="block mb-2 text-sm font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                  Q{i + 1}. {q.text}
                </label>
                {qType === 'dropdown' && (
                  <select id={`answer-${q.id}`} className="premium-input premium-select w-full cursor-pointer bg-slate-50 border-slate-300 py-2 px-3 text-sm" value={formData.answers[q.id] || ''} onChange={(e) => updateAnswer(q.id, e.target.value)}>
                    <option value="">Select an option...</option>
                    {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                {['numeric', 'number', 'integer'].includes(qType) && (
                  <input
                    id={`answer-${q.id}`}
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    className="premium-input w-full bg-slate-50 border-slate-300"
                    value={formData.answers[q.id] || ''}
                    onKeyDown={handleNumericKeyDown}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) updateAnswer(q.id, val);
                    }}
                  />
                )}
                {qType === 'text' && <input id={`answer-${q.id}`} type="text" className="premium-input w-full" value={formData.answers[q.id] || ''} onChange={(e) => updateAnswer(q.id, e.target.value)} />}
                {qType === 'date' && <input id={`answer-${q.id}`} type="date" className="premium-input w-full cursor-pointer" value={formData.answers[q.id] || ''} onChange={(e) => updateAnswer(q.id, e.target.value)} />}
              </div>
            );
          })
        ) : (
          <div>
            {showAdvanceNotice && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
                Completed — moving to next step
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {active_questions.map((q, i) => {
                const selected = !!formData.answers[q.id];
                return (
                  <label key={q.id} id={`question-${q.id}`} className={`mb-0 p-3 flex cursor-pointer flex-col gap-2 rounded-xl shadow-sm sm:rounded-2xl ${selected ? 'border-emerald-600 bg-emerald-300' : 'border-emerald-400 bg-emerald-200 hover:bg-emerald-300'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 shrink-0 rounded border-emerald-600 text-[#0072CE] focus:ring-[#0072CE]"
                        checked={selected}
                        onChange={(e) => updateAnswer(q.id, e.target.checked)}
                      />
                      <span className="flex-1 text-sm font-medium text-slate-900 leading-relaxed whitespace-normal break-words">
                        {i + 1}. {q.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="premium-glass rounded-2xl p-4 sm:p-5 md:p-8">
        <h3 className="text-lg font-bold mb-5 text-[#0072CE] flex items-center gap-2 animate-title sm:text-xl"><CloudUpload className="shrink-0" /> Documents Upload</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          {formData.process_type === 'GP' && (
            <div className="h-full flex flex-col justify-between p-4 border border-emerald-200 bg-emerald-50 rounded-xl sm:p-6">
              <label className="block mb-3 text-emerald-800 font-bold whitespace-normal break-words">GP बैठक की रिपोर्ट ब्लॉक पर सबमिट करने की रिसीविंग अपलोड करें</label>
              <div className="flex justify-center w-full mt-2 mb-3">
                <input type="file" ref={gpInputRef} className="w-full max-w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-semibold cursor-pointer hover:file:bg-emerald-700 transition-all text-slate-600 sm:file:mr-4 sm:file:px-5" accept=".pdf,.docx,.jpg,.png" onChange={(e) => { setBlockStep2AutoAdvance(false); setFormData({ ...formData, gp_receipt_file: e.target.files[0] }); }} />
              </div>
              {formData.gp_receipt_file && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200 flex justify-between items-center gap-2 shadow-sm animate-step">
                  <span className="text-sm text-emerald-700 font-medium flex items-center gap-2 truncate pr-4">
                    <CheckCircle2 size={16} className="shrink-0"/> {formData.gp_receipt_file.name}
                  </span>
                  <button onClick={handleRemoveGpReceipt} className="text-slate-400 hover:text-red-500 p-1 transition-colors shrink-0"><X size={18} /></button>
                </div>
              )}
            </div>
          )}

          <div className="h-full flex flex-col justify-between p-4 border border-dashed border-[#0072CE]/40 bg-blue-50/40 rounded-xl text-center hover:bg-blue-50/60 transition-colors sm:p-6">
            <div>
              <CloudUpload size={36} className="mx-auto text-[#0072CE] mb-3 opacity-80" />
              <p className="mb-3 text-slate-700 font-semibold text-base whitespace-normal break-words">
                कृपया प्रक्रिया की 2 या 3 बेहतरीन फोटो और दस्तावेज़ अपलोड करें
                <span className="text-xs text-slate-500 font-normal mt-1 block">(Minimum 2 required)</span>
              </p>
            </div>
            <div className="flex justify-center w-full mt-1">
              <input
                key={`uploader-${formData.files.length}`}
                type="file"
                multiple
                className="w-full max-w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0072CE] file:text-white file:font-semibold cursor-pointer hover:file:bg-blue-700 transition-all text-slate-500 sm:file:mr-4"
                onChange={(e) => { setBlockStep2AutoAdvance(false); handleAddFiles(e); }}
              />
            </div>
          </div>
        </div>

        {formData.files.length > 0 && (
          <div className="mt-5 text-left bg-blue-50 p-4 rounded-xl border border-blue-100 animate-step">
            <p className="text-sm font-bold text-[#0072CE] mb-3 flex items-center gap-1"><CheckCircle2 size={18}/> {formData.files.length} Files Ready to Upload:</p>
            <div className="space-y-2">
              {formData.files.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className="flex justify-between items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-700 font-medium truncate pr-4">• {f.name}</span>
                  <button onClick={() => handleRemoveFile(idx)} className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
