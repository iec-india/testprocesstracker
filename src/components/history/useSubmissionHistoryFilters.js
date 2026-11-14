import { useMemo, useState } from 'react';
import { getDateInputValue, getParticipationLabel, getSubmissionName, REPORT_STATES } from './historyUtils';

const matchesDateRange = (item, startDate, endDate) => {
  const dateKey = getDateInputValue(item.date || item.created_at);
  const startMatch = !startDate || (dateKey && dateKey >= startDate);
  const endMatch = !endDate || (dateKey && dateKey <= endDate);
  return startMatch && endMatch;
};

const sortedOptions = (values) => Array.from(values).sort((a, b) => (a === 'all' ? -1 : a.localeCompare(b)));

const normalizeSelectedProcess = (selectedProcess) => {
  if (Array.isArray(selectedProcess)) return selectedProcess.filter((value) => value && value !== 'all');
  if (!selectedProcess || selectedProcess === 'all') return [];
  return [selectedProcess];
};

const optionMatches = (item, filters, omittedFilter) => {
  if (!matchesDateRange(item, filters.selectedStartDate, filters.selectedEndDate)) return false;
  const selectedProcessValues = normalizeSelectedProcess(filters.selectedProcess);
  if (omittedFilter !== 'process' && selectedProcessValues.length > 0 && !selectedProcessValues.includes(item.process_type)) return false;
  if (omittedFilter !== 'district' && filters.selectedDistrict !== 'all' && filters.selectedDistrict !== item.district) return false;
  if (omittedFilter !== 'cluster' && filters.selectedCluster !== 'all' && filters.selectedCluster !== item.cluster) return false;
  if (omittedFilter !== 'gp' && filters.selectedGp !== 'all' && filters.selectedGp !== (item.gram_panchayat || item.gramPanchayat || 'Unknown')) return false;
  if (omittedFilter !== 'name' && filters.selectedName !== 'all' && filters.selectedName !== getSubmissionName(item)) return false;
  if (omittedFilter !== 'state' && filters.selectedState !== 'all' && filters.selectedState !== (item.state || 'Unknown')) return false;
  if (omittedFilter !== 'block' && filters.selectedBlock !== 'all' && filters.selectedBlock !== (item.block || 'Unknown')) return false;
  return true;
};

const formatIndicatorLabel = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'Untitled Indicator';
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatAnswerValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Blank';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

export const buildIndicatorReportData = (submissions = [], questionMeta = {}) => {
  const grouped = new Map();

  submissions.forEach((item) => {
    if (!item?.answers || typeof item.answers !== 'object') return;

    Object.entries(item.answers).forEach(([questionId, answerValue]) => {
      if (!questionId) return;
      const normalizedId = String(questionId);
      const meta = questionMeta[normalizedId] || {};
      const existing = grouped.get(normalizedId) || {
        id: normalizedId,
        label: meta.text || formatIndicatorLabel(normalizedId),
        processNames: Array.isArray(meta.categories) ? meta.categories : [],
        totalResponses: 0,
        answerBreakdown: new Map(),
      };

      existing.totalResponses += 1;
      const answerLabel = formatAnswerValue(answerValue);
      existing.answerBreakdown.set(answerLabel, (existing.answerBreakdown.get(answerLabel) || 0) + 1);
      grouped.set(normalizedId, existing);
    });
  });

  const groupedItems = Array.from(grouped.values()).map((item) => ({
    ...item,
    questionIds: [item.id],
    answerBreakdown: new Map(item.answerBreakdown),
  }));

  const dedupedByLabel = new Map();
  groupedItems.forEach((item) => {
    const existing = dedupedByLabel.get(item.label);
    if (!existing) {
      dedupedByLabel.set(item.label, {
        ...item,
        processNames: Array.isArray(item.processNames) ? Array.from(new Set(item.processNames)) : [],
        questionIds: Array.isArray(item.questionIds) ? Array.from(new Set(item.questionIds)) : [item.id],
      });
      return;
    }

    existing.totalResponses += item.totalResponses;
    existing.questionIds = Array.from(new Set([...(existing.questionIds || []), ...(item.questionIds || [item.id])]));
    existing.processNames = Array.from(new Set([...(existing.processNames || []), ...(item.processNames || [])]));
    item.answerBreakdown.forEach((count, answer) => {
      existing.answerBreakdown.set(answer, (existing.answerBreakdown.get(answer) || 0) + count);
    });
  });

  return Array.from(dedupedByLabel.values())
    .map((item) => ({
      ...item,
      answerBreakdown: Array.from(item.answerBreakdown.entries())
        .map(([answer, count]) => ({ answer, count }))
        .sort((a, b) => b.count - a.count || a.answer.localeCompare(b.answer)),
    }))
    .sort((a, b) => b.totalResponses - a.totalResponses || a.label.localeCompare(b.label));
};

export function useSubmissionHistoryFilters({ submissions = [], iecSubmissions = [], questionMeta = {} }) {
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedGp, setSelectedGp] = useState('all');
  const [selectedName, setSelectedName] = useState('all');
  const [selectedProcess, setSelectedProcess] = useState([]);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [viewMode, setViewMode] = useState(null);

  const displayedSubmissions = useMemo(() => {
    if (viewMode === 'iec') return iecSubmissions;
    if (viewMode === 'individual') return submissions;
    if (viewMode === 'process-indicators') return [...submissions, ...iecSubmissions];
    return [];
  }, [viewMode, iecSubmissions, submissions]);

  const filterValues = useMemo(() => ({
    selectedStartDate,
    selectedEndDate,
    selectedDistrict,
    selectedCluster,
    selectedGp,
    selectedName,
    selectedProcess,
    selectedState,
    selectedBlock,
  }), [selectedStartDate, selectedEndDate, selectedDistrict, selectedCluster, selectedGp, selectedName, selectedProcess, selectedState, selectedBlock]);

  const selectedProcessValues = useMemo(() => normalizeSelectedProcess(selectedProcess), [selectedProcess]);

  const processOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      if (optionMatches(item, filterValues, 'process') && item.process_type) values.add(item.process_type);
    });
    if (Array.isArray(selectedProcess)) {
      selectedProcess.forEach((processType) => values.add(processType));
    } else if (selectedProcess !== 'all') {
      values.add(selectedProcess);
    }
    return Array.from(values);
  }, [displayedSubmissions, filterValues, selectedProcess]);

  const districtOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      if (optionMatches(item, filterValues, 'district') && item.district) values.add(item.district);
    });
    if (selectedDistrict !== 'all') values.add(selectedDistrict);
    return sortedOptions(values);
  }, [displayedSubmissions, filterValues, selectedDistrict]);

  const nameOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      const label = getSubmissionName(item);
      if (optionMatches(item, filterValues, 'name') && label) values.add(label);
    });
    if (selectedName !== 'all') values.add(selectedName);
    return sortedOptions(values);
  }, [displayedSubmissions, filterValues, selectedName]);

  const blockOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      if (optionMatches(item, filterValues, 'block') && item.block) values.add(item.block);
    });
    if (selectedBlock !== 'all') values.add(selectedBlock);
    return sortedOptions(values);
  }, [displayedSubmissions, filterValues, selectedBlock]);

  const clusterOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      if (optionMatches(item, filterValues, 'cluster') && item.cluster) values.add(item.cluster);
    });
    if (selectedCluster !== 'all') values.add(selectedCluster);
    return sortedOptions(values);
  }, [displayedSubmissions, filterValues, selectedCluster]);

  const gpOptions = useMemo(() => {
    const values = new Set(['all']);
    displayedSubmissions.forEach((item) => {
      const gp = item.gram_panchayat || item.gramPanchayat;
      if (optionMatches(item, filterValues, 'gp') && gp) values.add(gp);
    });
    if (selectedGp !== 'all') values.add(selectedGp);
    return sortedOptions(values);
  }, [displayedSubmissions, filterValues, selectedGp]);

  const filteredByOtherCriteria = useMemo(() => {
    return displayedSubmissions.filter((item) => {
      const processMatch = selectedProcessValues.length === 0 || selectedProcessValues.includes(item.process_type);
      return (
        matchesDateRange(item, selectedStartDate, selectedEndDate) &&
        processMatch &&
        (selectedDistrict === 'all' || selectedDistrict === item.district) &&
        (selectedCluster === 'all' || selectedCluster === item.cluster) &&
        (selectedGp === 'all' || selectedGp === (item.gram_panchayat || item.gramPanchayat || 'Unknown')) &&
        (selectedName === 'all' || selectedName === getSubmissionName(item)) &&
        (selectedBlock === 'all' || selectedBlock === (item.block || 'Unknown'))
      );
    });
  }, [displayedSubmissions, selectedStartDate, selectedEndDate, selectedProcessValues, selectedDistrict, selectedCluster, selectedGp, selectedName, selectedBlock]);

  const filteredSubmissions = useMemo(() => {
    return filteredByOtherCriteria.filter((item) => selectedState === 'all' || selectedState === (item.state || 'Unknown'));
  }, [filteredByOtherCriteria, selectedState]);

  const summaryData = useMemo(() => {
    const summaryMap = new Map();
    filteredSubmissions.forEach((item) => {
      const key = item.process_type || 'Unknown';
      summaryMap.set(key, (summaryMap.get(key) || 0) + 1);
    });
    return Array.from(summaryMap.entries())
      .map(([label, value]) => ({ label, value, processType: label, count: value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSubmissions]);

  const participationSummary = useMemo(() => {
    const totals = new Map();
    filteredSubmissions.forEach((item) => {
      const details = item.participation_details;
      if (!details || typeof details !== 'object') return;
      Object.entries(details).forEach(([key, value]) => {
        const label = getParticipationLabel(key);
        totals.set(label, (totals.get(label) || 0) + (Number(value) || 0));
      });
    });
    return Array.from(totals.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [filteredSubmissions]);

  const stateCounts = useMemo(() => {
    const counts = {};
    REPORT_STATES.forEach((state) => {
      counts[state] = filteredByOtherCriteria.filter((item) => item.state === state).length;
    });
    return counts;
  }, [filteredByOtherCriteria]);

  const districtCounts = useMemo(() => {
    const countsByState = {};
    filteredByOtherCriteria.forEach((item) => {
      const state = item.state || 'Unknown';
      const district = item.district || 'Unknown';
      if (!countsByState[state]) countsByState[state] = new Map();
      countsByState[state].set(district, (countsByState[state].get(district) || 0) + 1);
    });
    return Object.fromEntries(
      Object.entries(countsByState).map(([state, map]) => [
        state,
        Array.from(map.entries())
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value),
      ]),
    );
  }, [filteredByOtherCriteria]);

  const totalParticipation = useMemo(() => {
    return participationSummary.reduce((sum, item) => sum + item.value, 0);
  }, [participationSummary]);

  const indicatorReportData = useMemo(() => buildIndicatorReportData(filteredSubmissions, questionMeta), [filteredSubmissions, questionMeta]);

  const clearFilters = () => {
    setSelectedStartDate('');
    setSelectedEndDate('');
    setSelectedDistrict('all');
    setSelectedCluster('all');
    setSelectedGp('all');
    setSelectedName('all');
    setSelectedProcess([]);
    setSelectedState('all');
    setSelectedBlock('all');
  };

  return {
    filters: {
      selectedStartDate,
      selectedEndDate,
      selectedDistrict,
      selectedCluster,
      selectedGp,
      selectedName,
      selectedProcess,
      selectedState,
      selectedBlock,
      viewMode,
    },
    setters: {
      setSelectedStartDate,
      setSelectedEndDate,
      setSelectedDistrict,
      setSelectedCluster,
      setSelectedGp,
      setSelectedName,
      setSelectedProcess,
      setSelectedState,
      setSelectedBlock,
      setViewMode,
    },
    options: {
      processOptions,
      districtOptions,
      nameOptions,
      blockOptions,
      clusterOptions,
      gpOptions,
    },
    displayedSubmissions,
    filteredSubmissions,
    summaryData,
    participationSummary,
    indicatorReportData,
    stateCounts,
    districtCounts,
    totalParticipation,
    clearFilters,
  };
}
