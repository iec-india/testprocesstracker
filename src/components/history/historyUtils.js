export const PARTICIPATION_LABELS = {
  p01: 'Teachers',
  p02: 'Students',
  p03: 'SMC Members',
  p04: 'Elected PRI Dep.Members',
  p05: 'PRI Dep.Members',
  p06: 'Parents',
  p07: 'Block Officials',
  p08: 'District Officials',
  p09: 'GP President',
  p10: 'ZP President',
  p11: 'Block President',
  p12: 'ARP/BRP/CRC',
  p13: 'SS/CAC/CRC',
  p14: 'ICDS Members',
  p15: 'DIET Mentors',
  p16: 'SRG',
  p17: 'Helth Dept. Members',
  p18: 'PRI Members',
  p19: 'Other',
};

export const REPORT_STATES = ['Uttar Pradesh', 'Uttarakhand', 'Chhattisgarh', 'Bihar'];

export const getParticipationLabel = (key) => PARTICIPATION_LABELS[key] || key;

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

export const getParticipationTotal = (participation) => {
  if (!participation || typeof participation !== 'object') return 0;
  return Object.values(participation)
    .map((value) => Number(value) || 0)
    .reduce((sum, current) => sum + current, 0);
};

export const parseAttachmentUrls = (csv) => {
  if (!csv) return [];
  return String(csv).split(',').map((value) => value.trim()).filter(Boolean);
};

export const getDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getSubmissionName = (item) => item.selected_name || item.verified_email || 'Unknown';

export const getProcessStyle = (processType) => {
  const emerald = {
    card: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 text-sky-200 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.45)]',
    badge: 'bg-emerald-600 text-slate-900',
  };
  const sky = {
    card: 'border-sky-500/40 bg-gradient-to-br from-sky-950 via-sky-900 to-sky-700 text-emerald-200 shadow-[0_10px_30px_-15px_rgba(56,189,248,0.45)]',
    badge: 'bg-sky-600 text-slate-900',
  };
  const fallback = {
    card: 'border-slate-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_10px_30px_-15px_rgba(148,163,184,0.45)]',
    badge: 'bg-slate-600 text-white',
  };

  const styles = {
    "Teacher's Collective": emerald,
    'Classroom Observation': emerald,
    'School Visit': emerald,
    BPM: emerald,
    DIET: emerald,
    LN_Support: emerald,
    AWTC: {
      card: 'border-teal-500/40 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 text-sky-200 shadow-[0_10px_30px_-15px_rgba(20,184,166,0.45)]',
      badge: 'bg-teal-600 text-slate-900',
    },
    ZPEC: {
      card: 'border-violet-500/40 bg-gradient-to-br from-violet-950 via-violet-900 to-violet-700 text-fuchsia-200 shadow-[0_10px_30px_-15px_rgba(192,38,211,0.45)]',
      badge: 'bg-violet-600 text-slate-900',
    },
    GP: sky,
    BESC: sky,
    DESC: sky,
    Other: fallback,
    Unknown: fallback,
  };

  return styles[processType] || fallback;
};
