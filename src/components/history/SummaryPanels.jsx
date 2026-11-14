import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate, formatNumber } from './historyUtils';

const formatIndicatorAnswer = (value) => {
  if (value === null || value === undefined || value === '') return 'Blank';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

export function ProcessSummaryTable({ summaryData }) {
  const total = summaryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-[320px] lg:h-[560px]">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-[#1e293b]">
        <div className="border-b border-slate-700 bg-slate-800 px-4 py-3 text-center text-lg font-semibold text-white">
          Process Summary
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[320px] border-separate border-spacing-y-2 text-sm sm:min-w-full">
            <tbody className="divide-y divide-slate-700/60">
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-slate-400">No process data available.</td>
                </tr>
              ) : (
                <>
                  {summaryData.map((item) => (
                    <tr key={item.label} className="rounded-2xl bg-slate-900/90 transition hover:bg-slate-800/80">
                      <td className="px-4 py-3 text-slate-200">{item.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-300">{formatNumber(item.value)}</td>
                    </tr>
                  ))}
                  <tr className="rounded-2xl border-t-2 border-cyan-500/40 bg-slate-950/90">
                    <td className="px-4 py-3 text-white">Total</td>
                    <td className="px-4 py-3 text-right text-cyan-300">{formatNumber(total)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ParticipationSummaryPanel({ participationSummary, totalParticipation }) {
  return (
    <div className="grid min-h-[320px] content-start gap-2 lg:h-[560px]">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-cyan-500/70 bg-gradient-to-b from-[#164e63] to-[#1e1b4b]">
        <div className="border-b border-white/10 px-4 py-3 text-center text-lg font-semibold text-white">
          Participation
        </div>
        <div className="flex-1 overflow-y-auto">
          {participationSummary.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-white/70">No participation data.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-3">
              {participationSummary.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="truncate text-xs font-semibold text-white/90">{item.label}</div>
                  <div className="text-xs font-bold text-cyan-400">{formatNumber(item.value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t-2 border-white/80 px-3 py-2 text-xs font-bold text-white">
          <span>Total</span>
          <span>{formatNumber(totalParticipation)}</span>
        </div>
      </div>
    </div>
  );
}

export function ProcessNameCards({ summaryData = [], selectedProcess = [], setSelectedProcess }) {
  if (!summaryData || summaryData.length === 0) {
    return null;
  }

  const selectedProcessValues = Array.isArray(selectedProcess)
    ? selectedProcess.filter(Boolean)
    : selectedProcess === 'all' || !selectedProcess
      ? []
      : [selectedProcess];

  const multiSelectProcesses = ['Classroom Observation', 'School Visit'];

  const handleProcessClick = (processLabel) => {
    const isMultiSelectProcess = multiSelectProcesses.includes(processLabel);
    const currentlySelected = selectedProcessValues.includes(processLabel);

    if (isMultiSelectProcess) {
      const nextSelection = currentlySelected
        ? selectedProcessValues.filter((value) => value !== processLabel)
        : [...selectedProcessValues, processLabel];
      setSelectedProcess(nextSelection);
      return;
    }

    if (currentlySelected && selectedProcessValues.length === 1) {
      setSelectedProcess([]);
      return;
    }

    setSelectedProcess(processLabel);
  };

  const columns = 6;
  const placeholderCount = Math.max(0, columns - summaryData.length);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/80 shadow-lg shadow-slate-950/20">
      <div className="border-b border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-200">
        Process
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-6">
        {summaryData.map((item) => {
          const isActive = selectedProcessValues.includes(item.label);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleProcessClick(item.label)}
              className={`flex items-center justify-between rounded-3xl border px-3 py-2 text-left shadow transition ${isActive ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/90 hover:border-slate-500 hover:bg-slate-800'} ${setSelectedProcess ? 'cursor-pointer' : ''}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                {item.label}
              </span>
              <span className="ml-3 text-sm font-bold text-cyan-300">{formatNumber(item.value)}</span>
            </button>
          );
        })}
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <div key={`placeholder-${index}`} className="rounded-3xl border border-slate-700 bg-slate-950/80 px-3 py-2" />
        ))}
      </div>
    </div>
  );
}

export function ProcessIndicatorReportPanel({ indicatorData = [], selectedProcess = 'all', filteredSubmissions = [] }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [summarySelection, setSummarySelection] = useState(null);
  const summaryTableRef = useRef(null);

  const selectedProcessValues = Array.isArray(selectedProcess)
    ? selectedProcess.filter(Boolean)
    : selectedProcess === 'all' || !selectedProcess
      ? []
      : [selectedProcess];
  const hasSelectedProcess = selectedProcessValues.length > 0;

  useEffect(() => {
    if (summarySelection && summaryTableRef.current) {
      summaryTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [summarySelection]);

  const specialProcesses = ['Teacher\'s Collective', 'Classroom Observation', 'School Visit'];
  const simpleListProcesses = ['GP', 'BPM', 'DIET', 'BESC', 'LN_Support'];
  const isSpecialProcess = selectedProcessValues.some((value) => specialProcesses.some((process) => process.toLowerCase() === String(value).toLowerCase()));
  const isSimpleListProcess = selectedProcessValues.some((value) => simpleListProcesses.some((process) => process.toLowerCase() === String(value).toLowerCase()));
  const selectedTotal = filteredSubmissions.length;

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <div className="flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-[#111827]">
        <div className="border-b border-slate-700 bg-slate-900 px-4 py-3 text-center text-lg font-semibold text-white">
          Process Indicators
        </div>
        <div className="flex-1 p-3">
          {!hasSelectedProcess ? (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/70 px-4 py-8 text-center text-sm text-slate-400">
              Select a process to view indicators.
            </div>
          ) : indicatorData.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/70 px-4 py-8 text-center text-sm text-slate-400">
              No indicator answer data found for the current selection.
            </div>
          ) : isSpecialProcess ? (
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                {indicatorData.map((item) => {
                  const colorClasses = [
                    'from-emerald-100 to-emerald-300 text-slate-900',
                    'from-emerald-200 to-emerald-400 text-slate-900',
                    'from-emerald-400 to-emerald-600 text-white',
                    'from-emerald-600 to-emerald-800 text-white',
                  ];

                  return (
                    <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/90 shadow-sm">
                      <div className="border-b border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                        {item.label}
                      </div>
                      <div className="grid gap-2 p-4 sm:grid-cols-2">
                        {item.answerBreakdown.map((entry, index) => (
                          <button
                            key={`${item.id}-${entry.answer}-${index}`}
                            type="button"
                            onClick={() => setSummarySelection({ questionId: item.id, question: item.label, answer: entry.answer, count: entry.count })}
                            className={`rounded-3xl border border-slate-700 bg-gradient-to-br px-4 py-3 text-left shadow-sm transition hover:scale-[1.01] ${colorClasses[index % colorClasses.length]}`}
                          >
                            <div className="text-sm font-semibold leading-snug">
                              {entry.answer || 'Option'}
                            </div>
                            <div className="mt-3 text-3xl font-bold">
                              {formatNumber(entry.count)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {summarySelection && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
                    <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Selected Summary</div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Question</div>
                        <div className="mt-2 text-sm font-semibold text-white">{summarySelection.question}</div>
                      </div>
                      <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Option</div>
                        <div className="mt-2 text-sm font-semibold text-white">{summarySelection.answer}</div>
                      </div>
                      <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Count</div>
                        <div className="mt-2 text-3xl font-bold text-cyan-300">{formatNumber(summarySelection.count)}</div>
                      </div>
                    </div>
                  </div>

                  <SummaryTable
                    summarySelection={summarySelection}
                    selectedProcess={selectedProcess}
                    filteredSubmissions={filteredSubmissions}
                    tableRef={summaryTableRef}
                  />
                </div>
              )}
            </div>
          ) : isSimpleListProcess ? (
            <>
              <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/80 shadow-sm">
                <div className="border-b border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-200">
                  Indicator counts
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead>
                      <tr className="border-b border-slate-700 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <th className="px-3 py-2">Indicator</th>
                        <th className="px-3 py-2 text-right">Selection Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {indicatorData.map((item) => {
                        const isSelected = summarySelection?.questionId === item.id && summarySelection?.selectionType === 'indicator';
                        return (
                          <tr
                            key={item.id}
                            className={`cursor-pointer bg-slate-900/80 transition hover:bg-slate-800/80 ${isSelected ? 'bg-cyan-950/80' : ''}`}
                            onClick={() => setSummarySelection({ questionId: item.id, questionIds: item.questionIds || [item.id], question: item.label, answer: 'All responses', count: item.totalResponses, selectionType: 'indicator' })}
                          >
                            <td className="px-3 py-3 align-top text-slate-200">{item.label}</td>
                            <td className="px-3 py-3 align-top text-right font-semibold text-cyan-300">{formatNumber(item.totalResponses)}</td>
                          </tr>
                        );
                      })}
                      {indicatorData.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-3 py-8 text-center text-slate-400">No indicator data available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {summarySelection && summarySelection.selectionType === 'indicator' && (
                <div className="space-y-4 mt-4">
                <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Selected Summary</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Indicator</div>
                      <div className="mt-2 text-sm font-semibold text-white">{summarySelection.question}</div>
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Selection</div>
                      <div className="mt-2 text-sm font-semibold text-white">{summarySelection.answer}</div>
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Count</div>
                      <div className="mt-2 text-3xl font-bold text-cyan-300">{formatNumber(summarySelection.count)}</div>
                    </div>
                  </div>
                </div>

                <SummaryTable
                  summarySelection={summarySelection}
                  selectedProcess={selectedProcess}
                  filteredSubmissions={filteredSubmissions}
                />
              </div>
            )}
          </>
          ) : (
            <div className="space-y-2">
              {indicatorData.map((item) => {
                const isExpanded = Boolean(expandedItems[item.id]);
                return (
                  <div key={item.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/90">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="mt-1 text-xs text-slate-400">{formatNumber(item.totalResponses)} response{item.totalResponses === 1 ? '' : 's'}</div>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300">
                        <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-semibold">
                          {item.answerBreakdown.length}
                        </span>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-700/70 bg-slate-950/70 p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Answer breakdown</div>
                        <div className="mt-2 space-y-2">
                          {item.answerBreakdown.map((entry) => (
                            <div key={`${item.id}-${entry.answer}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 px-3 py-2 text-sm">
                              <span className="text-slate-200">{entry.answer}</span>
                              <span className="font-semibold text-cyan-300">{formatNumber(entry.count)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryTable({ summarySelection, selectedProcess, filteredSubmissions, tableRef }) {
  const selectedProcessValues = Array.isArray(selectedProcess)
    ? selectedProcess.filter(Boolean)
    : selectedProcess === 'all' || !selectedProcess
      ? []
      : [selectedProcess];

  const matchingSubmissions = filteredSubmissions.filter((item) => {
    const processMatch = selectedProcessValues.length === 0 || selectedProcessValues.includes(item.process_type);
    if (!processMatch) return false;

    if (summarySelection?.selectionType === 'indicator') {
      if (!item.answers || typeof item.answers !== 'object') return false;
      if (Array.isArray(summarySelection.questionIds) && summarySelection.questionIds.length > 0) {
        return summarySelection.questionIds.some((questionId) => Object.prototype.hasOwnProperty.call(item.answers, questionId));
      }
      return Object.prototype.hasOwnProperty.call(item.answers, summarySelection.questionId);
    }

    const answerValue = item.answers?.[summarySelection.questionId];
    const formattedAnswer = formatIndicatorAnswer(answerValue);
    return formattedAnswer === summarySelection.answer;
  });

  const exportCsv = () => {
    const headers = ['Date', 'Observer', 'State', 'District', 'Block', 'Cluster', 'GP', 'School', 'Teacher'];
    const rows = matchingSubmissions.map((item) => [
      formatDate(item.date || item.created_at),
      item.selected_name || item.verified_email || '-',
      item.state || '-',
      item.district || '-',
      item.block || '-',
      item.cluster || '-',
      item.gram_panchayat || '-',
      item.school_name || '-',
      item.teachers_name || '-',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'indicator_summary_table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (matchingSubmissions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-4 text-sm text-slate-300">
        No matching RM submissions found for this selection.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/90 p-4" ref={tableRef}>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs text-slate-400">Showing {matchingSubmissions.length} matching submission{matchingSubmissions.length === 1 ? '' : 's'}</div>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center rounded-full border border-cyan-500/70 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200 transition hover:bg-cyan-500/20"
        >
          Download Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Observer</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">District</th>
              <th className="px-3 py-2">Block</th>
              <th className="px-3 py-2">Cluster</th>
              <th className="px-3 py-2">GP</th>
              <th className="px-3 py-2">School</th>
              <th className="px-3 py-2">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {matchingSubmissions.map((item) => (
              <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                <td className="px-3 py-2 align-top text-slate-200">{formatDate(item.date || item.created_at)}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.selected_name || item.verified_email || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.state || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.district || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.block || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.cluster || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.gram_panchayat || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.school_name || '-'}</td>
                <td className="px-3 py-2 align-top text-slate-200">{item.teachers_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
