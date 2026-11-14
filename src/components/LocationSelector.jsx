import React from 'react';
import { MapPin, Loader2, ChevronDown } from 'lucide-react';
import { PROCESS_HIERARCHY } from '../data/constants';

const getUniqueValues = (data = [], key, filters = {}) => [
  ...new Set(
    data.filter(item => Object.entries(filters).every(([k, v]) => !v || item[k] === v))
      .map(item => item[key]).filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b));

export default function LocationSelector({ formData, setFormData, isLoadingData, rmData, selectFieldClass, manualFieldClass }) {
  const handleRMChange = (field, value) => {
    setFormData(prev => {
      const newRm = { ...prev.rm, [field]: value };
      const cascadeKeys = ['state', 'district', 'block', 'cluster', 'gp', 'school', 'teacher'];
      const fieldIndex = cascadeKeys.indexOf(field);
      if (fieldIndex !== -1) {
        for (let i = fieldIndex + 1; i < cascadeKeys.length; i++) newRm[cascadeKeys[i]] = '';
        newRm.block_manual = '';
        newRm.cluster_manual = '';
        newRm.gp_manual = '';
        newRm.school_manual = '';
        newRm.teacher_manual = '';
        newRm.school_udise = null;
      }
      if (field === 'block' && value === 'OTHER_BLOCK') newRm.cluster = 'OTHER_CLUSTER';
      if (field === 'school' && value && value !== 'OTHER_SCHOOL') {
        const schoolRow = rmData.find(r => r['School Name'] === value);
        newRm.school_udise = schoolRow ? schoolRow['UDISE Code'] : null;
      }
      return { ...prev, rm: newRm };
    });
  };

  const isManualBlock = formData.rm.block === 'OTHER_BLOCK';
  const isManualCluster = formData.rm.cluster === 'OTHER_CLUSTER';
  const isManualGp = formData.rm.gp === 'OTHER_GP';
  const isManualSchool = formData.rm.school === 'OTHER_SCHOOL';
  const isManualTeacher = formData.rm.teacher === 'OTHER_TEACHER';
  const isManualMode = isManualBlock || isManualCluster || isManualGp || isManualSchool;

  const visibleFields = PROCESS_HIERARCHY[formData.process_type] || [];
  const isFieldVisible = (field) => visibleFields.includes(field);

  const showStateField = isFieldVisible('state');
  const showDistrictField = isFieldVisible('district');
  const showBlockField = isFieldVisible('block');
  const showClusterField = isFieldVisible('cluster');
  const showGpField = isFieldVisible('gp');
  const showSchoolField = isFieldVisible('school');
  const showTeacherField = isFieldVisible('teacher');
  const schoolParentReady = showGpField ? !!formData.rm.gp : !!formData.rm.cluster;

  const showBlockDropdown = showBlockField && !!formData.rm.district && !isManualBlock;
  const showClusterDropdown = showClusterField && !!formData.rm.block && !isManualBlock && !isManualCluster;
  const showGpDropdown = showGpField && !!formData.rm.cluster && !isManualCluster && !isManualGp;
  const showSchoolDropdown = showSchoolField && schoolParentReady && !isManualMode && !isManualSchool;
  const showTeacherDropdown = showTeacherField && !!formData.rm.school && !isManualMode && !isManualTeacher;

  const _showBlockManualInput = showBlockField && isManualBlock;
  const _showClusterManualInput = showClusterField && (isManualBlock || isManualCluster);
  const _showGpManualInput = showGpField && (isManualCluster || isManualGp);
  const _showSchoolManualInput = showSchoolField && (isManualMode || isManualSchool);
  const showTeacherManualInput = showTeacherField && (isManualMode || isManualTeacher);

  const rmStates = getUniqueValues(rmData, 'State');
  const rmDistricts = showDistrictField ? getUniqueValues(rmData, 'District', { State: formData.rm.state }) : [];
  const rmBlocks = showBlockDropdown ? getUniqueValues(rmData, 'Block', { District: formData.rm.district }) : [];
  const rmClusters = showClusterDropdown ? getUniqueValues(rmData, 'Cluster', { Block: formData.rm.block }) : [];
  const rmGps = showGpDropdown ? getUniqueValues(rmData, 'Gram Panchayat', { Cluster: formData.rm.cluster }) : [];

  let rmSchools = [];
  if (showSchoolDropdown) {
    if (showGpField && formData.rm.gp) rmSchools = getUniqueValues(rmData, 'School Name', { State: formData.rm.state, District: formData.rm.district, Block: formData.rm.block, Cluster: formData.rm.cluster, 'Gram Panchayat': formData.rm.gp });
    else if (formData.rm.cluster) rmSchools = getUniqueValues(rmData, 'School Name', { State: formData.rm.state, District: formData.rm.district, Block: formData.rm.block, Cluster: formData.rm.cluster });
    else if (formData.rm.block) rmSchools = getUniqueValues(rmData, 'School Name', { Block: formData.rm.block });
    else if (formData.rm.district) rmSchools = getUniqueValues(rmData, 'School Name', { District: formData.rm.district });
  }

  const rmTeachers = showTeacherDropdown && formData.rm.school
    ? getUniqueValues(rmData, "Teachers' Name", { 'School Name': formData.rm.school })
    : [];

  const _renderSelectField = ({ label, value, onChange, disabled = false, placeholder, options, manualOption }) => (
    <div className="group space-y-2">
      <label className="ml-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500 group-focus-within:text-[#0072CE] sm:tracking-wider">{label}</label>
      <div className="relative">
        <select disabled={disabled} className={selectFieldClass} value={value} onChange={onChange}>
          <option value="">{placeholder}</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
          {manualOption && <option value={manualOption.value} className="font-bold text-blue-600">{manualOption.label}</option>}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0072CE]" />
      </div>
    </div>
  );

  const _renderManualField = ({ label, value, onChange, placeholder }) => (
    <div className="group space-y-2">
      <label className="ml-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-600 sm:tracking-wider">{label}</label>
      <input type="text" placeholder={placeholder} className={manualFieldClass} value={value} onChange={onChange} />
    </div>
  );

  const renderCardField = ({ label, children }) => (
    <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-[0_16px_40px_rgba(6,95,70,0.07)] sm:rounded-[28px] sm:p-5">
      <div className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm sm:mb-4 sm:tracking-[0.3em]">
        {label}
      </div>
      {children}
    </div>
  );

  return formData.process_type ? (
    <div className="animate-step mt-6 transition-all duration-300 ease-out">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 shadow-sm ring-1 ring-emerald-200/70">
          {formData.process_type}
        </span>
      </div>
      <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-xl shadow-emerald-900/5 backdrop-blur-xl sm:rounded-3xl sm:p-5 md:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 sm:h-10 sm:w-10 sm:rounded-2xl">
            <MapPin size={19} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">क्षेत्र / विद्यालय चयन</h3>
            <p className="mt-0.5 text-sm font-medium text-slate-500">कृपया आवश्यक विवरण चुनें</p>
          </div>
        </div>

        {isLoadingData && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-800">
            <Loader2 size={18} className="animate-spin" />
            डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {showStateField && renderCardField({ label: 'STATE', children: (
            <select value={formData.rm.state} onChange={(e) => handleRMChange('state', e.target.value)} disabled={isLoadingData} className={selectFieldClass} placeholder="Select State..." options={rmStates}>
              <option value="">Select State...</option>
              {rmStates.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) })}

          {showDistrictField && renderCardField({ label: 'DISTRICT', children: (
            <select value={formData.rm.district} onChange={(e) => handleRMChange('district', e.target.value)} disabled={isLoadingData || !formData.rm.state} className={selectFieldClass}>
              <option value="">Select District...</option>
              {rmDistricts.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) })}

          {showBlockDropdown && renderCardField({ label: 'Block', children: (
            <select value={formData.rm.block} onChange={(e) => handleRMChange('block', e.target.value)} disabled={isLoadingData || !formData.rm.district} className={selectFieldClass}>
              <option value="">Select Block...</option>
              {rmBlocks.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="OTHER_BLOCK" className="font-bold text-emerald-600">Other (Manual Entry)</option>
            </select>
          ) })}

          {_showBlockManualInput && renderCardField({ label: 'BLOCK (Manual)', children: (
            <input
              type="text"
              placeholder="Type block name manually..."
              className={manualFieldClass}
              value={formData.rm.block_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, rm: { ...prev.rm, block_manual: e.target.value } }))}
            />
          ) })}

          {showClusterDropdown && renderCardField({ label: 'CLUSTER', children: (
            <select value={formData.rm.cluster} onChange={(e) => handleRMChange('cluster', e.target.value)} disabled={isLoadingData || !formData.rm.block} className={selectFieldClass}>
              <option value="">Select Cluster...</option>
              {rmClusters.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="OTHER_CLUSTER" className="font-bold text-emerald-600">Other (Manual Entry)</option>
            </select>
          ) })}

          {_showClusterManualInput && renderCardField({ label: 'CLUSTER (Manual)', children: (
            <input
              type="text"
              placeholder="Type cluster name manually..."
              className={manualFieldClass}
              value={formData.rm.cluster_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, rm: { ...prev.rm, cluster_manual: e.target.value } }))}
            />
          ) })}

          {showGpDropdown && renderCardField({ label: 'GP', children: (
            <select value={formData.rm.gp} onChange={(e) => handleRMChange('gp', e.target.value)} disabled={isLoadingData || !formData.rm.cluster} className={selectFieldClass}>
              <option value="">Select GP...</option>
              {rmGps.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="OTHER_GP" className="font-bold text-emerald-600">Other (Manual Entry)</option>
            </select>
          ) })}

          {_showGpManualInput && renderCardField({ label: 'GP (Manual)', children: (
            <input
              type="text"
              placeholder="Type GP name manually..."
              className={manualFieldClass}
              value={formData.rm.gp_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, rm: { ...prev.rm, gp_manual: e.target.value } }))}
            />
          ) })}

          {showSchoolDropdown && renderCardField({ label: 'SCHOOL NAME', children: (
            <select value={formData.rm.school} onChange={(e) => handleRMChange('school', e.target.value)} disabled={isLoadingData || !schoolParentReady || isManualMode} className={selectFieldClass}>
              <option value="">Select School...</option>
              {rmSchools.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="OTHER_SCHOOL" className="font-bold text-emerald-600">Other (Manual Entry)</option>
            </select>
          ) })}

          {_showSchoolManualInput && renderCardField({ label: 'SCHOOL NAME (Manual)', children: (
            <input
              type="text"
              placeholder="Type school name manually..."
              className={manualFieldClass}
              value={formData.rm.school_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, rm: { ...prev.rm, school_manual: e.target.value } }))}
            />
          ) })}

          {showTeacherDropdown && renderCardField({ label: 'TEACHER NAME', children: (
            <select value={formData.rm.teacher} onChange={(e) => handleRMChange('teacher', e.target.value)} disabled={isLoadingData || !formData.rm.school} className={selectFieldClass}>
              <option value="">Select Teacher...</option>
              {rmTeachers.map(option => <option key={option} value={option}>{option}</option>)}
              <option value="OTHER_TEACHER" className="font-bold text-emerald-600">Other (Manual Entry)</option>
            </select>
          ) })}

          {showTeacherManualInput && renderCardField({ label: 'TEACHER NAME', children: (
            <input
              type="text"
              placeholder="Type Teacher name..."
              className={manualFieldClass}
              value={formData.rm.teacher_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, rm: { ...prev.rm, teacher_manual: e.target.value } }))}
            />
          ) })}
        </div>
      </div>
    </div>
  ) : null;
}
