import React from 'react';
import LocationSelector from './LocationSelector';

export default function StepBasicDetails({
  formData,
  setFormData,
  setBlockStep1AutoAdvance,
  handleProcessChange,
  isLoadingData,
  rmData,
  selectFieldClass,
  manualFieldClass,
  processTypes = [],
}) {
  const updateFormField = (field, value) => {
    setBlockStep1AutoAdvance(false);
    setFormData({ ...formData, [field]: value });
  };

  const renderCardField = ({ title, children, className = '' }) => (
    <div className={`rounded-xl border border-emerald-200/80 bg-white p-4 shadow-[0_16px_40px_rgba(6,95,70,0.07)] sm:rounded-[28px] sm:p-5 ${className}`}>
      <div className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm sm:mb-4 sm:tracking-[0.3em]">
        {title}
      </div>
      {children}
    </div>
  );

    return (
    <div className="premium-glass rounded-2xl p-4 sm:p-5 md:p-8">
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2 text-[#0072CE] animate-title">IEC Process Tracker</h2>
      <p className="text-center text-slate-600 mb-5 font-medium sm:mb-6">Basic Details</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {renderCardField({
          title: 'Name',
          children: (
            <input
              type="text"
              className="premium-input w-full rounded-xl border border-slate-200/80 bg-slate-100 p-3.5 text-slate-800 font-semibold shadow-sm transition-all duration-200 sm:rounded-[20px] sm:p-4"
              value={formData.observer_name}
              readOnly
            />
          ),
        })}

        {renderCardField({
          title: 'Meeting Date',
          children: (
            <input
              type="date"
              className="premium-input w-full rounded-xl border border-emerald-200/80 bg-white p-3.5 text-slate-700 font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:rounded-[20px] sm:p-4"
              value={formData.date}
              onChange={(e) => updateFormField('date', e.target.value)}
            />
          ),
        })}

        {renderCardField({
          title: 'Process Type',
          children: (
            <select
              className="premium-input premium-select w-full rounded-xl border border-emerald-200/80 bg-white p-3.5 text-slate-700 font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:rounded-[20px] sm:p-4"
              value={formData.process_type}
              disabled={isLoadingData || processTypes.length === 0}
              onChange={(e) => { setBlockStep1AutoAdvance(false); handleProcessChange(e.target.value); }}
            >
              <option value="">
                {isLoadingData ? 'Loading processes...' : processTypes.length === 0 ? 'No processes available' : 'कृपया प्रक्रिया का चयन करे...'}
              </option>
              {processTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ),
        })}
      </div>

      <div className="mt-6">
        <LocationSelector formData={formData} setFormData={setFormData} isLoadingData={isLoadingData} rmData={rmData} selectFieldClass={selectFieldClass} manualFieldClass={manualFieldClass} />
      </div>
    </div>
  );
}
