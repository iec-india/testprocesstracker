import { REPORT_STATES } from './historyUtils';

const stateThemes = {
  'Uttar Pradesh': {
    active: 'border-blue-400/70 bg-sky-600 text-white shadow-blue-900/40 ring-2 ring-sky-300/50',
    idle: 'border-blue-500/30 bg-gradient-to-br from-blue-950/95 via-slate-950 to-slate-900 text-blue-100 shadow-blue-950/20 hover:-translate-y-0.5 hover:shadow-xl',
    label: 'text-blue-200',
    value: 'text-blue-300',
  },
  Uttarakhand: {
    active: 'border-emerald-400/70 bg-emerald-600 text-white shadow-emerald-900/40 ring-2 ring-emerald-300/50',
    idle: 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/95 via-slate-950 to-slate-900 text-emerald-100 shadow-emerald-950/20 hover:-translate-y-0.5 hover:shadow-xl',
    label: 'text-emerald-200',
    value: 'text-emerald-300',
  },
  Chhattisgarh: {
    active: 'border-orange-400/70 bg-orange-600 text-white shadow-orange-900/40 ring-2 ring-orange-300/50',
    idle: 'border-orange-500/30 bg-gradient-to-br from-orange-950/95 via-slate-950 to-slate-900 text-orange-100 shadow-orange-950/20 hover:-translate-y-0.5 hover:shadow-xl',
    label: 'text-orange-200',
    value: 'text-orange-300',
  },
  Bihar: {
    active: 'border-purple-400/70 bg-purple-600 text-white shadow-purple-900/40 ring-2 ring-purple-300/50',
    idle: 'border-purple-500/30 bg-gradient-to-br from-purple-950/95 via-slate-950 to-slate-900 text-purple-100 shadow-purple-950/20 hover:-translate-y-0.5 hover:shadow-xl',
    label: 'text-purple-200',
    value: 'text-purple-300',
  },
};

export function StateSummaryCards({ filters, setters, options, selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, stateCounts, districtCounts = {} }) {
  const districtsForState = selectedState !== 'all' ? districtCounts[selectedState] || [] : [];
  const { blockOptions = [], clusterOptions = [], gpOptions = [] } = options || {};
  const selectedBlock = filters.selectedBlock;
  const selectedCluster = filters.selectedCluster;
  const selectedGp = filters.selectedGp;

  return (
    <div className="rounded-lg border border-slate-700 bg-[#1e293b]">
      <div className="grid grid-cols-1 gap-3 border-b border-slate-700 bg-slate-800 px-4 py-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Start Date</label>
          <input
            type="date"
            value={filters.selectedStartDate}
            onChange={(event) => setters.setSelectedStartDate(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
          />
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">End Date</label>
          <input
            type="date"
            value={filters.selectedEndDate}
            onChange={(event) => setters.setSelectedEndDate(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
          />
        </div>
      </div>

      <div className="p-4">
        {selectedDistrict !== 'all' ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-100">{selectedState}</span>
              <span className="text-slate-400">/</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-100">{selectedDistrict}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Block</label>
                <select
                  value={selectedBlock}
                  onChange={(event) => {
                    setters.setSelectedBlock(event.target.value);
                    setters.setSelectedCluster('all');
                    setters.setSelectedGp('all');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                >
                  {blockOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All Blocks' : option}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBlock !== 'all' && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cluster</label>
                  <select
                    value={selectedCluster}
                    onChange={(event) => {
                      setters.setSelectedCluster(event.target.value);
                      setters.setSelectedGp('all');
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                  >
                    {clusterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Clusters' : option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCluster !== 'all' && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Gram Panchayat</label>
                  <select
                    value={selectedGp}
                    onChange={(event) => setters.setSelectedGp(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                  >
                    {gpOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All GPs' : option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(selectedState === 'all' ? REPORT_STATES : [selectedState]).map((state) => {
                const theme = stateThemes[state];
                const isActive = selectedState === state;
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => {
                      setSelectedState(isActive ? 'all' : state);
                      if (isActive) setSelectedDistrict('all');
                    }}
                    className={`h-full rounded-2xl border p-4 text-center shadow-lg transition sm:rounded-3xl sm:p-5 ${isActive ? theme.active : theme.idle}`}
                  >
                    <div className={`text-xs font-semibold uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.18em] ${theme.label}`}>
                      {state}
                    </div>
                    <div className={`mt-3 text-3xl font-extrabold sm:mt-4 sm:text-4xl ${theme.value}`}>
                      {stateCounts[state] || 0}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedState !== 'all' && districtsForState.length > 0 && (
              <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                <div className="mb-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-300">Districts in {selectedState}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {districtsForState.map((district) => {
                    const isActive = selectedDistrict === district.label;
                    return (
                      <button
                        key={district.label}
                        type="button"
                        onClick={() => setSelectedDistrict(isActive ? 'all' : district.label)}
                        className={`rounded-3xl border px-3 py-2 text-left shadow transition ${isActive ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/80 hover:border-slate-500 hover:bg-slate-900'}`}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] leading-snug text-slate-400">
                          {district.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

