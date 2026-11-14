import React from 'react';

export default function StepParticipation({
  formData,
  setFormData,
  participation_questions_list,
  handleNumericKeyDown,
  questionCardClass,
}) {
  return (
    <div className="space-y-6">
      <div className={`premium-glass rounded-2xl p-4 sm:p-5 md:p-8`}>
        <div className="bg-blue-50 border-l-4 border-[#0072CE] p-3 rounded-r-lg mb-5 sm:p-4 sm:mb-8">
          <h3 className="text-lg font-bold text-[#0072CE] animate-title sm:text-xl">Participation Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
          {participation_questions_list.length > 0 ? (
            participation_questions_list.map(q => (
              <div key={q.id} className={`${questionCardClass} border-emerald-200 bg-emerald-100`}>
                <label className="block mb-2 text-sm font-semibold text-[#0072CE] whitespace-normal break-words leading-relaxed">{q.text}</label>
                <input
                  type="number" step="1" min="0" placeholder="0"
                  className="premium-input w-full text-[#0072CE]"
                  value={formData.participation[q.id] || ''}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) setFormData({...formData, participation: {...formData.participation, [q.id]: val}});
                  }}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600 sm:rounded-[28px]">
              कोई participation प्रश्न उपलब्ध नहीं हैं। कृपया पहले प्रक्रिया चुनें या शीट डेटा जांचें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
