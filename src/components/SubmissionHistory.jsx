import { useRef, useState } from 'react';
import { generatePdfFromElement } from '../utils/generatePdf';
import { HistoryFiltersPanel } from './history/HistoryFiltersPanel';
import { ReportModeSelector } from './history/ReportModeSelector';
import { StateSummaryCards } from './history/StateSummaryCards';
import { ParticipationSummaryPanel, ProcessIndicatorReportPanel, ProcessNameCards, ProcessSummaryTable } from './history/SummaryPanels';
import { SubmissionCards } from './history/SubmissionCards';
import { useSubmissionHistoryFilters } from './history/useSubmissionHistoryFilters';

export default function SubmissionHistory({
  submissions = [],
  iecSubmissions = [],
  questionMeta = {},
  isLoading,
  historyError,
  iecHistoryLoading,
  iecHistoryError,
  onBack,
}) {
  const reportRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const history = useSubmissionHistoryFilters({ submissions, iecSubmissions, questionMeta });
  const { filters, setters, options, filteredSubmissions, summaryData, participationSummary, indicatorReportData, stateCounts, districtCounts, totalParticipation, clearFilters } = history;
  const loading = filters.viewMode === 'iec' ? iecHistoryLoading : filters.viewMode === 'individual' ? isLoading : false;
  const error = filters.viewMode === 'iec' ? iecHistoryError : filters.viewMode === 'individual' ? historyError : null;

  const downloadPdf = async () => {
    if (!filters.viewMode || isDownloading) return;
    setIsDownloading(true);
    try {
      if (!reportRef.current) throw new Error('Report container not found');
      const dateLabel = filters.selectedStartDate || filters.selectedEndDate
        ? `${filters.selectedStartDate || 'start'}_${filters.selectedEndDate || 'end'}`
        : 'all';
      await generatePdfFromElement(reportRef.current, `Submission_History_${filters.viewMode}_${dateLabel}.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert(`PDF download failed: ${err?.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-0 py-4 sm:px-4 sm:py-6 md:px-0">
      <ReportModeSelector
        viewMode={filters.viewMode}
        setViewMode={setters.setViewMode}
        isDownloading={isDownloading}
        downloadPdf={downloadPdf}
        clearFilters={clearFilters}
      />

      <div ref={reportRef} data-pdf-capture="true" className="mb-6 overflow-hidden rounded-xl border border-slate-800 bg-[#111827] p-2 text-white shadow-2xl space-y-4 sm:p-3 sm:space-y-6">
        {!filters.viewMode ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-sm text-slate-300">
            Select <span className="mx-1 font-semibold text-white">Process Summary</span> or <span className="mx-1 font-semibold text-white">Process Indicators</span> to view the report.
          </div>
        ) : (
          <>
            {filters.viewMode === 'iec' && (
              <StateSummaryCards
                filters={filters}
                setters={setters}
                options={options}
                selectedState={filters.selectedState}
                setSelectedState={setters.setSelectedState}
                selectedDistrict={filters.selectedDistrict}
                setSelectedDistrict={setters.setSelectedDistrict}
                stateCounts={stateCounts}
                districtCounts={districtCounts}
              />
            )}

            {filters.viewMode === 'process-indicators' ? (
              <div className="space-y-3">
                <StateSummaryCards
                  filters={filters}
                  setters={setters}
                  options={options}
                  selectedState={filters.selectedState}
                  setSelectedState={setters.setSelectedState}
                  selectedDistrict={filters.selectedDistrict}
                  setSelectedDistrict={setters.setSelectedDistrict}
                  stateCounts={stateCounts}
                  districtCounts={districtCounts}
                />
                <ProcessNameCards summaryData={summaryData} selectedProcess={filters.selectedProcess} setSelectedProcess={setters.setSelectedProcess} />
                <ProcessIndicatorReportPanel indicatorData={indicatorReportData} selectedProcess={filters.selectedProcess} filteredSubmissions={filteredSubmissions} />
              </div>
            ) : (
              <div className="grid items-stretch gap-2 lg:grid-cols-3">
                <HistoryFiltersPanel filters={filters} setters={setters} options={options} clearFilters={clearFilters} />
                <ProcessSummaryTable summaryData={summaryData} />
                <ParticipationSummaryPanel participationSummary={participationSummary} totalParticipation={totalParticipation} />
              </div>
            )}
          </>
        )}
      </div>

      <SubmissionCards
        viewMode={filters.viewMode}
        error={error}
        loading={loading}
        filteredSubmissions={filteredSubmissions}
      />
    </div>
  );
}
