import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GROUP_A_PROCESSES, GP_OPTIONAL_PROCESSES, RM_INITIAL_STATE, PROCESS_HIERARCHY } from '../data/constants';
import { supabase } from '../config/supabaseClient';
import { GOOGLE_SHEET_URL } from '../config/appConfig';
import { Capacitor } from '@capacitor/core';
import { hasBasicDetails, isRmComplete, validateBasicDetails, validateRMSelection, hasRequiredAttachments, isQuestionnaireComplete, validateQuestionnaire } from '../utils/validations';
import { uploadFileToStorage } from '../utils/storage';

const FORCE_DEV_AUTH = import.meta.env.VITE_FORCE_DEV_AUTH === 'true';
const DEV_USER_EMAIL = import.meta.env.VITE_DEV_USER_EMAIL || 'dev@example.com';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const formatUserNameFromEmail = (email = '') => {
  const local = email.split('@')[0] || '';
  return local
    .split(/[^a-zA-Z]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};
const getFirstName = (fullName = '') => {
  if (!fullName) return '';
  return fullName.split(' ')[0]; 
};
const normalizeDropdownOption = (option) => {
  if (typeof option !== 'string') return option;
  return option.trim().replace(/^\s*level\s*[:-]?\s*/i, '').trim();
};

const normalizeCategories = (category) => {
  if (Array.isArray(category)) {
    return category.flatMap((item) => String(item).split(',').map((value) => value.trim())).filter(Boolean);
  }
  if (typeof category === 'string') {
    return category.split(',').map((value) => value.trim()).filter(Boolean);
  }
  return [];
};

const lookupValue = (item, keys) => {
  if (!item || typeof item !== 'object') return undefined;
  const normalized = Object.entries(item).reduce((acc, [key, value]) => {
    const normKey = String(key || '').trim().toLowerCase().replace(/[_\s]+/g, ' ');
    acc[normKey] = value;
    return acc;
  }, {});

  for (const key of keys) {
    const normalizedKey = key.toLowerCase().replace(/[_\s]+/g, ' ');
    if (normalizedKey in normalized) return normalized[normalizedKey];
  }
  return undefined;
};

const normalizeItemId = (item, text) => {
  const explicitId = item.ID || item.id || item['ID'];
  if (explicitId) return String(explicitId).trim();
  if (typeof text === 'string' && text.trim()) {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return `item-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeQuestionItem = (item) => {
  const text = item['Question Text'] || item.text || item['Question'];
  return {
    id: normalizeItemId(item, text),
    text,
    type: item.Type || item.type || 'Dropdown',
    categories: normalizeCategories(item.Category || item.category || 'Other'),
    options: typeof item.Options === 'string'
      ? item.Options.split(',').map(option => normalizeDropdownOption(option)).filter(Boolean)
      : Array.isArray(item.Options)
        ? item.Options.map(normalizeDropdownOption).filter(Boolean)
        : [],
  };
};

const normalizeIndicatorItem = (item) => {
  const text = item['Indicator Text'] || item.text || item['Indicator'];
  return {
    id: normalizeItemId(item, text),
    text,
    categories: normalizeCategories(item.Category || item.category || 'Other'),
  };
};

const normalizeParticipationItem = (item) => {
  const text = lookupValue(item, ['Participants', 'Participant', 'Question Text', 'Question']);
  const id = normalizeItemId(item, text);
  return {
    id,
    text,
    type: item.Type || item.type || 'numeric',
    categories: normalizeCategories(
      lookupValue(item, ['Process Name', 'process_name', 'Category', 'category']) || 'Other'
    ),
  };
};

const isRmRow = (item) => (
  item &&
  typeof item === 'object' &&
  (lookupValue(item, ['State']) !== undefined || lookupValue(item, ['District']) !== undefined || lookupValue(item, ['Block']) !== undefined || lookupValue(item, ['School Name']) !== undefined || lookupValue(item, ["Teachers' Name"]) !== undefined)
);

const isParticipationRow = (item) => (
  item &&
  typeof item === 'object' &&
  lookupValue(item, ['Process Name', 'process_name']) !== undefined && lookupValue(item, ['Participants', 'Participant']) !== undefined
);

const isQuestionRow = (item) => (
  item &&
  typeof item === 'object' &&
  lookupValue(item, ['Question Text', 'Question']) !== undefined && lookupValue(item, ['Category', 'category']) !== undefined
);

const isIndicatorRow = (item) => (
  item &&
  typeof item === 'object' &&
  lookupValue(item, ['Indicator Text', 'Indicator']) !== undefined && lookupValue(item, ['Category', 'category']) !== undefined
);

const asArray = (value) => Array.isArray(value) ? value : [];

const extractProcessTypes = (items) => {
  const seen = new Set();
  const types = [];

  items.forEach((item) => {
    const categories = Array.isArray(item.categories)
      ? item.categories
      : typeof item.category === 'string'
        ? [item.category.trim()]
        : [];

    categories.forEach((category) => {
      if (!category || seen.has(category)) return;
      seen.add(category);
      types.push(category);
    });
  });

  return types;
};

export function useProcessTracker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationContext, setValidationContext] = useState(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState('');
  const [rmData, setRmData] = useState([]);
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [dynamicIndicators, setDynamicIndicators] = useState([]);
  const [participationQuestions, setParticipationQuestions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState('');
  const [showSplash, setShowSplash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_blockStep1AutoAdvance, setBlockStep1AutoAdvance] = useState(false);
  const [_blockStep2AutoAdvance, setBlockStep2AutoAdvance] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [iecSubmissions, setIecSubmissions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [iecHistoryLoading, setIecHistoryLoading] = useState(false);
  const [iecHistoryError, setIecHistoryError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [processTypes, setProcessTypes] = useState([]);

  const questionMeta = useMemo(() => {
    const meta = {};

    dynamicQuestions.forEach((item) => {
      if (item.id) meta[item.id] = { text: item.text || '', categories: item.categories || [] };
    });

    dynamicIndicators.forEach((item) => {
      if (item.id) meta[item.id] = { text: item.text || '', categories: item.categories || [] };
    });

    return meta;
  }, [dynamicQuestions, dynamicIndicators]);

  const splashShown = useRef(false);
  const fileInputRef = useRef(null);
  const gpInputRef = useRef(null);
  const [formData, setFormData] = useState({
    observer_name: '',
    observer_name_manual: '',
    date: getTodayDate(),
    process_type: '',
    answers: {},
    participation: {},
    files: [],
    gp_receipt_file: null,
    rm: { ...RM_INITIAL_STATE }
  });

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        if (!GOOGLE_SHEET_URL) throw new Error('VITE_GOOGLE_SHEET_URL is not configured.');
        
        // --- ADDED FETCH HEADERS & REDIRECT FOR CORS FIX ---
        const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'GET',
        redirect: 'follow' // Sirf redirect allow karna hai, custom headers nahi bhejney
      });

        if (!response.ok) throw new Error('Unable to fetch Google sheet data.');

        const payload = await response.json();
        const isTopLevelRmData = Array.isArray(payload) && payload.some(isRmRow);
        const rawRmData = isTopLevelRmData
          ? payload
          : (
              payload.rmData ||
              payload.RMData ||
              payload.rm_data ||
              payload.data?.rmData ||
              payload.data?.RMData ||
              payload.data?.rm_data ||
              []
            );
        const rawQuestions = Array.isArray(payload)
          ? payload.filter(isQuestionRow)
          : (payload.questions || payload.data?.questions || []);
        const rawIndicators = Array.isArray(payload)
          ? payload.filter(isIndicatorRow)
          : (payload.indicators || payload.data?.indicators || []);
        const rawParticipation = Array.isArray(payload)
          ? payload.filter(isParticipationRow)
          : (payload.participation || payload.data?.participation || []);

        const normalizedQuestions = asArray(rawQuestions).map(normalizeQuestionItem).filter((item) => item.id && item.text);
        const normalizedIndicators = asArray(rawIndicators).map(normalizeIndicatorItem).filter((item) => item.id && item.text);
        const normalizedParticipation = asArray(rawParticipation).map(normalizeParticipationItem).filter((item) => item.id && item.text);
        const mergedTypes = extractProcessTypes([...normalizedQuestions, ...normalizedIndicators]);

        setRmData(asArray(rawRmData));
        setDynamicQuestions(normalizedQuestions);
        setDynamicIndicators(normalizedIndicators);
        setParticipationQuestions(normalizedParticipation);
        setProcessTypes(mergedTypes);
      } catch (error) {
        console.error('Google sheet data fetch error:', error);
        setRmData([]);
        setProcessTypes([]);
        setDynamicQuestions([]);
        setDynamicIndicators([]);
        setParticipationQuestions([]);
        toast.error('Unable to load questionnaire data from the Google sheet. Please retry or check sheet access.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSheetData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentStep !== 1 && currentStep !== 5) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Unsaved data will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep]);

  useEffect(() => {
    if (FORCE_DEV_AUTH) {
      setUserEmail(DEV_USER_EMAIL);
      setAuthChecking(false);
      return;
    }

    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    const setSessionUser = (session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
        const metadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        setUserName(getFirstName(metadataName || formatUserNameFromEmail(session.user.email)));
        if (!splashShown.current) {
          setShowSplash(true);
          splashShown.current = true;
        }
      } else {
        setUserEmail(null);
        setUserName('');
      }
    };

    const handleOAuthRedirect = async () => {
      try {
        const hasAuthTokens = [
          'access_token',
          'refresh_token',
          'type',
          'expires_in',
          'provider_token'
        ].some((key) => window.location.search.includes(key) || window.location.hash.includes(key));
        if (!hasAuthTokens) return false;

        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) {
          console.error('Supabase redirect session parse failed:', error);
        }
        if (data?.session) {
          setSessionUser(data.session);
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
      } catch (error) {
        console.error('Error parsing Supabase redirect URL:', error);
      }
      return false;
    };

    const initSession = async () => {
      if (window.location.search.includes('error=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const handled = await handleOAuthRedirect();
      if (handled) {
        setAuthChecking(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session);
      setAuthChecking(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUser(session);
      if (!session) {
        splashShown.current = false;
      }
    });

    initSession();

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!showSplash) return undefined;
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, [showSplash]);

  const fetchSubmissionHistory = useCallback(async () => {
    if (!supabase || !userEmail) return;
    setHistoryLoading(true);
    setHistoryError('');

    const { data, error } = await supabase
      .from('process_submissions_2026')
      .select('id, created_at, verified_email, selected_name, process_type, state, district, block, cluster, gram_panchayat, school_name, udise_code, teachers_name, attachment_url, gp_receipt_url, answers, participation_details, date')
      .eq('verified_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load submission history:', error);
      setHistoryError('Unable to load submission history.');
      setSubmissions([]);
    } else {
      setSubmissions(data || []);
    }
    setHistoryLoading(false);
  }, [userEmail]);

  const fetchIecSubmissionHistory = useCallback(async () => {
    if (!supabase) return;
    setIecHistoryLoading(true);
    setIecHistoryError('');

    const { data, error } = await supabase
      .from('process_submissions_2026')
      .select('id, created_at, verified_email, selected_name, process_type, state, district, block, cluster, gram_panchayat, school_name, udise_code, teachers_name, attachment_url, gp_receipt_url, answers, participation_details, date')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load IEC submission history:', error);
      setIecHistoryError('Unable to load IEC submission history.');
      setIecSubmissions([]);
    } else {
      setIecSubmissions(data || []);
    }
    setIecHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    fetchSubmissionHistory();
    fetchIecSubmissionHistory();
  }, [fetchSubmissionHistory, fetchIecSubmissionHistory, userEmail]);

  const applySession = useCallback((session) => {
    if (session?.user) {
      setUserEmail(session.user.email);
      const metadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
      setUserName(getFirstName(metadataName || formatUserNameFromEmail(session.user.email)));
      setAuthChecking(false);
      setShowSplash(false);
      splashShown.current = true;
      return true;
    }
    return false;
  }, []);

  const handleAuthDeepLink = useCallback(async (url) => {
    if (!supabase || !url || !url.includes('processtracker://')) return false;

    try {
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);
      const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
      const getParam = (key) => params.get(key) || hashParams.get(key);
      const authCode = getParam('code');
      const accessToken = getParam('access_token');
      const refreshToken = getParam('refresh_token');

      if (authCode) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
        if (error) throw error;
        if (applySession(data?.session)) return true;
      }

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        if (applySession(data?.session)) return true;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return applySession(session);
    } catch (error) {
      console.error('Supabase deep link session failed:', error);
      toast.error('Login link could not be opened. Please request a new link.');
      setAuthChecking(false);
      return false;
    }
  }, [applySession]);

  const handleGoogleLogin = async () => {
    if (FORCE_DEV_AUTH) {
      setUserEmail(DEV_USER_EMAIL);
      setUserName(getFirstName(formatUserNameFromEmail(DEV_USER_EMAIL)));
      return;
    }

    if (!supabase) {
      toast.error('Supabase is not connected.');
      return;
    }

    // प्लेटफ़ॉर्म के हिसाब से रिडायरेक्ट URL तय करें
    const getRedirectUrl = () => {
      if (Capacitor.isNativePlatform()) {
        return 'processtracker://login';
      }
      return window.location.origin; // Localhost या Web के लिए
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() } 
    });

    if (error) {
      console.error('Supabase OAuth redirect error:', error);
      toast.error('Login failed to start. Please try again.');
      return;
    }

    if (data?.url) {
      window.location.assign(data.url);
      return;
    }

    console.error('Supabase OAuth did not return a redirect URL.', data);
      toast.error('Login could not complete. Please try again.');
  };

  const handleLogout = async () => {
    if (!supabase) {
      toast.error('Supabase is not connected.');
      return;
    }

    await supabase.auth.signOut();
    setUserEmail(null);
    setUserName('');
    setFormData(prev => ({ ...prev, observer_name: '', observer_name_manual: '' }));
  };

  const notifyValidationError = useCallback((message) => toast.error(message), []);
  const isGroupA = GROUP_A_PROCESSES.includes(formData.process_type);

  useEffect(() => {
    if (!userName) return;
    setFormData(prev => {
      if (prev.observer_name) return prev;
      return { ...prev, observer_name: getFirstName(userName) };
    });
  }, [userName]);

  const active_questions = useMemo(() => {
    if (isGroupA) {
      return dynamicQuestions.filter((item) => item.categories.includes(formData.process_type));
    }
    return dynamicIndicators.filter((item) => item.categories.includes(formData.process_type));
  }, [dynamicQuestions, dynamicIndicators, formData.process_type, isGroupA]);

  const active_participation_questions = useMemo(() => {
    if (!formData.process_type) return participationQuestions;
    return participationQuestions.filter((item) => item.categories.includes(formData.process_type));
  }, [participationQuestions, formData.process_type]);

  const visibleFields = useMemo(() => PROCESS_HIERARCHY[formData.process_type] || [], [formData.process_type]);
  const isFieldVisible = useCallback((field) => visibleFields.includes(field), [visibleFields]);
  const isGpOptional = GP_OPTIONAL_PROCESSES.includes(formData.process_type);
  
  const showDistrictField = isFieldVisible('district');
  const showBlockField = isFieldVisible('block');
  const showClusterField = isFieldVisible('cluster');
  const showGpField = isFieldVisible('gp');
  const showSchoolField = isFieldVisible('school');
  const showTeacherField = isFieldVisible('teacher');
  const nextStepAfterRm = 2;

  const validateBasicDetailsLocal = useCallback(() => validateBasicDetails(formData, notifyValidationError, setValidationContext), [formData, notifyValidationError]);
  const validateRMSelectionLocal = useCallback(() => validateRMSelection(formData, isFieldVisible, isGpOptional, notifyValidationError, setValidationContext), [formData, isFieldVisible, isGpOptional, notifyValidationError]);
  const validateQuestionnaireLocal = useCallback(() => validateQuestionnaire(formData, active_questions, isGroupA, notifyValidationError, setValidationContext), [formData, active_questions, isGroupA, notifyValidationError]);
  const isQuestionnaireCompleteLocal = useCallback(() => isQuestionnaireComplete(formData, active_questions, isGroupA), [formData, active_questions, isGroupA]);
  const hasBasicDetailsLocal = useCallback(() => hasBasicDetails(formData), [formData]);
  const isRmCompleteLocal = useCallback(() => isRmComplete(formData, isFieldVisible, isGpOptional), [formData, isFieldVisible, isGpOptional]);
  const hasRequiredAttachmentsLocal = useCallback(() => hasRequiredAttachments(formData), [formData]);

  const handleProcessChange = (value) => {
    setErrorMsg('');
    setCurrentStep(1);
    setFormData(prev => ({ ...prev, process_type: value, rm: { ...RM_INITIAL_STATE }, participation: {}, answers: {} }));
  };

  const handleNumericKeyDown = (e) => {
    if (['.', '-', 'e', 'E'].includes(e.key)) e.preventDefault();
  };

  const openSubmissionHistory = async () => {
    setShowHistory(true);
    await Promise.allSettled([fetchSubmissionHistory(), fetchIecSubmissionHistory()]);
  };

  const closeSubmissionHistory = useCallback(() => {
    setShowHistory(false);
  }, []);

  const handleAddFiles = (e) => {
    if (e.target.files?.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== indexToRemove) }));
  };

  const handleRemoveGpReceipt = () => {
    setFormData(prev => ({ ...prev, gp_receipt_file: null }));
    if (gpInputRef.current) gpInputRef.current.value = '';
  };

  const handleValidationModalClose = () => {
    const targetId = validationContext?.targetId;
    setValidationContext(null);
    if (!targetId) return;
    setHighlightedQuestionId(targetId);
    window.setTimeout(() => {
      document.getElementById(`question-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById(`answer-${targetId}`)?.focus({ preventScroll: true });
    }, 80);
    window.setTimeout(() => setHighlightedQuestionId(null), 3000);
  };

  const handleFinalSubmit = async () => {
    if (!validateQuestionnaireLocal()) return;
    if (!validateRMSelectionLocal()) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const finalObserver = formData.observer_name === 'Other' ? formData.observer_name_manual : formData.observer_name;
      const isManualBlockFinal = formData.rm.block === 'OTHER_BLOCK';
      const isManualClusterFinal = formData.rm.cluster === 'OTHER_CLUSTER';
      const isManualGpFinal = formData.rm.gp === 'OTHER_GP';
      const isManualSchoolFinal = formData.rm.school === 'OTHER_SCHOOL';
      const isManualModeFinal = isManualBlockFinal || isManualClusterFinal || isManualGpFinal || isManualSchoolFinal;

      const finalBlock = showBlockField ? (isManualBlockFinal ? formData.rm.block_manual : formData.rm.block) : '';
      const finalCluster = showClusterField ? (isManualClusterFinal ? formData.rm.cluster_manual : formData.rm.cluster) : '';
      const finalGp = showGpField ? (isManualClusterFinal || isManualGpFinal ? formData.rm.gp_manual : formData.rm.gp) : '';
      const finalSchool = showSchoolField ? (isManualModeFinal || isManualSchoolFinal ? formData.rm.school_manual : formData.rm.school) : '';
      const finalTeacher = showTeacherField ? (isManualModeFinal || formData.rm.teacher === 'OTHER_TEACHER' ? formData.rm.teacher_manual : formData.rm.teacher) : '';

      let finalUdise = null;
      if (finalSchool && formData.rm.school && formData.rm.school !== 'OTHER_SCHOOL') {
        const schoolRow = rmData.find(r => r['School Name'] === finalSchool);
        if (schoolRow) finalUdise = schoolRow['UDISE Code'];
      }

      const standardUploadResults = await Promise.all(
        formData.files.map((file) => uploadFileToStorage(file, finalObserver, formData).catch((error) => {
          console.error('Attachment upload failed:', error);
          throw new Error(`Attachment upload failed: ${error.message || 'Unknown error'}`);
        }))
      );
      const standardUrls = standardUploadResults.filter(Boolean);

      let gpReceiptUrl = null;
      if (formData.gp_receipt_file) {
        gpReceiptUrl = await uploadFileToStorage(formData.gp_receipt_file, finalObserver, formData).catch((error) => {
          console.error('GP receipt upload failed:', error);
          throw new Error(`GP receipt upload failed: ${error.message || 'Unknown error'}`);
        });
      }

      const dbPayload = {
        verified_email: userEmail,
        selected_name: finalObserver,
        date: formData.date,
        process_type: formData.process_type,
        state: formData.rm.state,
        district: showDistrictField ? formData.rm.district : '',
        block: finalBlock,
        cluster: finalCluster,
        gram_panchayat: finalGp,
        school_name: finalSchool,
        udise_code: finalUdise,
        teachers_name: finalTeacher,
        attachment_url: standardUrls.join(', '),
        gp_receipt_url: gpReceiptUrl,
        answers: formData.answers,
        participation_details: formData.participation
      };

      const { error: dbError } = await supabase.from('process_submissions_2026').insert(dbPayload);
      if (dbError) throw new Error(dbError.message || dbError.details || 'Database rejected the submission.');

      toast.success('Form submitted successfully');
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(`Error: ${error.message}`);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionnaireTitle = formData.process_type === "Teacher's Collective"
    ? "Teacher's Collective Framework"
    : formData.process_type === 'Classroom Observation' || formData.process_type === 'School Visit'
      ? 'TPD Framework'
      : formData.process_type === 'DESC'
        ? 'DESC Photos & Documents'
        : formData.process_type === 'Other'
          ? 'Other'
          : formData.process_type
            ? `${formData.process_type} Indicators`
            : 'Indicators';

  return {
    currentStep,
    setCurrentStep,
    errorMsg,
    setErrorMsg,
    validationContext,
    setValidationContext,
    highlightedQuestionId,
    rmData,
    isLoadingData,
    authChecking,
    userEmail,
    showSplash,
    isSubmitting,
    blockStep1AutoAdvance: _blockStep1AutoAdvance,
    blockStep2AutoAdvance: _blockStep2AutoAdvance,
    setBlockStep1AutoAdvance,
    setBlockStep2AutoAdvance,
    fileInputRef,
    gpInputRef,
    formData,
    setFormData,
    handleGoogleLogin,
    notifyValidationError,
    isGroupA,
    active_questions,
    nextStepAfterRm,
    questionMeta,
    validateBasicDetailsLocal,
    validateRMSelectionLocal,
    validateQuestionnaireLocal,
    isQuestionnaireCompleteLocal,
    hasRequiredAttachmentsLocal,
    hasBasicDetailsLocal,
    isRmCompleteLocal,
    handleProcessChange,
    handleNumericKeyDown,
    handleAddFiles,
    handleRemoveFile,
    handleRemoveGpReceipt,
    handleValidationModalClose,
    handleFinalSubmit,
    questionnaireTitle,
    participation_questions_list: active_participation_questions,
    participationQuestions,
    submissions,
    processTypes,
    historyLoading,
    historyError,
    iecSubmissions,
    iecHistoryLoading,
    iecHistoryError,
    showHistory,
    openSubmissionHistory,
    closeSubmissionHistory,
    userName,
    handleLogout,
    handleAuthDeepLink,
  };
}