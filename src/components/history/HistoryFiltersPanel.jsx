import { RotateCcw } from 'lucide-react';

function SelectFilter({ label, value, onChange, options, allLabel, multiple = false, size = 4 }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-amber-200">{label}</label>
      <select
        multiple={multiple}
        size={multiple ? size : undefined}
        value={value}
        onChange={(event) => {
          if (multiple) {
            const values = Array.from(event.target.selectedOptions).map((opt) => opt.value);
            onChange(values);
          } else {
            onChange(event.target.value);
          }
        }}
        className={`${multiple ? 'min-h-[9rem] py-2' : 'h-9'} w-full appearance-none rounded-md border border-slate-700 bg-slate-950/95 px-2 pr-6 text-xs font-semibold text-white outline-none transition hover:border-slate-500/70 focus:border-slate-400 focus:ring-1 focus:ring-slate-500/40`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'all' ? allLabel : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function HistoryFiltersPanel({ filters, setters, options, clearFilters }) {
  return (
    <div className="grid min-h-[320px] content-start gap-2 lg:h-[560px]">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-amber-500/70 bg-gradient-to-b from-[#3d2817] to-[#1e1b4b]">
        <div className="border-b border-amber-600/50 bg-amber-700/50 px-4 py-3 text-center text-lg font-semibold text-white">
          Filters
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-amber-200">Start Date</label>
            <input
              type="date"
              value={filters.selectedStartDate}
              onChange={(event) => setters.setSelectedStartDate(event.target.value)}
              className="h-9 w-full rounded-md border border-amber-400/40 bg-amber-900/20 px-2 text-xs font-semibold text-amber-100 outline-none transition hover:border-amber-400/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-amber-200">End Date</label>
            <input
              type="date"
              value={filters.selectedEndDate}
              onChange={(event) => setters.setSelectedEndDate(event.target.value)}
              className="h-9 w-full rounded-md border border-amber-400/40 bg-amber-900/20 px-2 text-xs font-semibold text-amber-100 outline-none transition hover:border-amber-400/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 [color-scheme:dark]"
            />
          </div>
          <SelectFilter label="Name" value={filters.selectedName} onChange={setters.setSelectedName} options={options.nameOptions} allLabel="All Names" />
          <SelectFilter label="District" value={filters.selectedDistrict} onChange={setters.setSelectedDistrict} options={options.districtOptions} allLabel="All Districts" />
          <SelectFilter
            label="Process"
            value={filters.selectedProcess}
            onChange={setters.setSelectedProcess}
            options={options.processOptions}
            allLabel="All Processes"
            multiple={Array.isArray(filters.selectedProcess)}
            size={6}
          />
          <SelectFilter label="Block" value={filters.selectedBlock} onChange={setters.setSelectedBlock} options={options.blockOptions} allLabel="All Blocks" />
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-amber-400/40 bg-amber-900/20 px-3 text-xs font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-900/40"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
