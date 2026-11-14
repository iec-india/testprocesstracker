import React, { useRef } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { RM_INITIAL_STATE } from '../data/constants';
import { generatePdfFromElement } from '../utils/generatePdf';

export default function StepSuccess({ formData, active_questions = [], participation_questions_list = [], setFormData, fileInputRef, gpInputRef, setErrorMsg, setCurrentStep }) {
  const reportRef = useRef(null);
  const observerName = formData.observer_name === 'Other' ? formData.observer_name_manual : formData.observer_name;
  const answeredQuestions = active_questions
    .map((q, index) => ({
      label: `${index + 1}. ${q.text}`,
      answer: formData.answers[q.id] ?? '',
    }))
    .filter((item) => item.answer !== '');
  const participationDetails = participation_questions_list
    .map((q, index) => ({
      label: `${index + 1}. ${q.text}`,
      answer: formData.participation[q.id] || '0',
    }))
    .filter((item) => item.answer !== '' && item.answer !== '0');

  const participationTotal = participationDetails.reduce((sum, item) => sum + Number(item.answer || 0), 0);

  const processReportItems = [
    { label: 'Observer', value: observerName || '-' },
    { label: 'Date', value: formData.date || '-' },
    { label: 'Process Type', value: formData.process_type || '-' },
    { label: 'Total Participation Count', value: participationTotal },
  ];

  const downloadPdf = async () => {
    try {
      if (!generatePdfFromElement) {
        throw new Error('PDF generator not available');
      }
      if (!reportRef.current) throw new Error('Report container not found');
      await generatePdfFromElement(reportRef.current, `IEC_Process_Report_${formData.date || 'report'}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert(`PDF download failed: ${error?.message || error}`);
    }
  };

  return (
    <div className="premium-glass rounded-2xl p-4 text-center mt-6 sm:p-5 md:p-8 lg:p-12">
      <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 animate-title sm:h-24 sm:w-24 sm:mb-6">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3 animate-title sm:text-3xl">Response Recorded</h2>
      <p className="text-slate-500 text-base mb-8 font-medium sm:text-lg sm:mb-10">Thank you for completing the assessment securely.</p>

      <div ref={reportRef}>
        <div className="mx-auto max-w-4xl text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 sm:rounded-3xl sm:p-6 sm:mb-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Process Report</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {processReportItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2 sm:tracking-[0.2em]">{item.label}</p>
                <p className="text-base font-semibold text-slate-900">{item.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 sm:rounded-3xl sm:p-6 sm:mb-8">
          <div className="mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Indicator / Question Answers</h3>
              <p className="text-sm text-slate-500">Review each question and answer below.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {answeredQuestions.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl">
                <p className="text-sm font-semibold text-slate-900 mb-1">{item.label}</p>
                <p className="text-sm text-slate-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 sm:rounded-3xl sm:p-6 sm:mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Participation Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[520px] divide-y divide-slate-200 text-sm sm:min-w-full">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Participation Item</th>
                <th className="px-4 py-3 text-right font-semibold">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {participationDetails.map((item) => (
                <tr key={item.label}>
                  <td className="px-4 py-3 text-slate-900">{item.label}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.answer}</td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td className="px-4 py-3 text-slate-900 font-semibold">Total Participation</td>
                <td className="px-4 py-3 text-right text-slate-900 font-semibold">{participationTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4" data-html2canvas-ignore>
        <button
          onClick={downloadPdf}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0072CE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Download size={16} /> Download PDF
        </button>
        <button
          onClick={() => {
            setFormData({ observer_name: '', observer_name_manual: '', date: '', process_type: '', answers: {}, participation: {}, files: [], gp_receipt_file: null, rm: { ...RM_INITIAL_STATE } });
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (gpInputRef.current) gpInputRef.current.value = '';
            setErrorMsg('');
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="premium-btn px-6 py-4 bg-[#0072CE] text-white font-bold rounded-xl shadow-lg sm:px-10"
        >
          Submit Another Response
        </button>
      </div>
    </div>
  );
}
