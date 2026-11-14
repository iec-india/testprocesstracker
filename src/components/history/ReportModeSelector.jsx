import { ArrowLeft, Download } from 'lucide-react';

export function ReportModeSelector({ viewMode, setViewMode, isDownloading, downloadPdf, clearFilters }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900"></h2>
        <div className="mt-4 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { mode: 'iec', label: 'Process Summary', theme: 'from-fuchsia-500 to-purple-600 text-white' },
            { mode: 'process-indicators', label: 'Process Indicators', theme: 'from-amber-500 to-orange-600 text-white' },
          ].map((option) => {
            const isActive = viewMode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => setViewMode(option.mode)}
                className={`rounded-2xl border px-4 py-3 text-left shadow-lg transition-all duration-200 sm:rounded-3xl sm:px-5 sm:py-4 ${isActive ? `border-transparent bg-gradient-to-br ${option.theme} shadow-[0_25px_50px_-25px_rgba(15,23,42,0.8)]` : 'border-slate-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-100 hover:border-slate-300 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900'}`}
              >
                <span className="block text-base font-bold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" data-html2canvas-ignore>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={!viewMode || isDownloading}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 ${!viewMode || isDownloading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <Download size={16} /> {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!viewMode}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 ${!viewMode ? 'pointer-events-none opacity-60' : ''}`}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
