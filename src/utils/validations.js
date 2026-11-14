const noop = () => {};

const fieldContext = (message, targetId) => ({
  title: 'कुछ फील्ड अधूरे हैं',
  subtitle: 'कृपया सभी आवश्यक फील्ड भरें',
  message,
  targetId,
});

const questionContext = (message, targetId = null) => ({
  title: 'कुछ प्रश्न अधूरे हैं',
  subtitle: 'कृपया सभी आवश्यक प्रश्नों का उत्तर दें',
  label: 'Missing Question',
  message,
  targetId,
});

const fileContext = (message) => ({
  title: 'कुछ फाइलें अधूरी हैं',
  subtitle: 'कृपया आवश्यक फाइलें अपलोड करें',
  message,
  targetId: null,
});

const setContext = (setValidationContext, context) => {
  if (typeof setValidationContext === 'function') setValidationContext(context);
};

const textValue = (value) => (value || '').toString().trim();

export const hasBasicDetails = (formData) => {
  if (!formData?.observer_name) return false;
  if (formData.observer_name === 'Other' && !textValue(formData.observer_name_manual)) return false;
  if (!formData.date) return false;
  if (!formData.process_type) return false;
  return true;
};

export const isRmComplete = (formData, isFieldVisible = noop, isGpOptional = false) => {
  if (!formData?.process_type) return true;
  if (formData.process_type === 'Other') return !!formData.rm?.state;

  const rm = formData.rm || {};
  const isManualBlock = rm.block === 'OTHER_BLOCK';
  const isManualCluster = rm.cluster === 'OTHER_CLUSTER';
  const isManualGp = rm.gp === 'OTHER_GP';
  const isManualSchool = rm.school === 'OTHER_SCHOOL';
  const isManualTeacher = rm.teacher === 'OTHER_TEACHER';

  if (isFieldVisible('state') && !rm.state) return false;
  if (isFieldVisible('district') && !rm.district) return false;
  if (isFieldVisible('block') && !rm.block) return false;
  if (isFieldVisible('block') && isManualBlock && !textValue(rm.block_manual)) return false;
  if (isFieldVisible('cluster') && !rm.cluster) return false;
  if (isFieldVisible('cluster') && isManualCluster && !textValue(rm.cluster_manual)) return false;
  if (isFieldVisible('gp') && !isGpOptional && !rm.gp) return false;
  if (isFieldVisible('gp') && !isGpOptional && (isManualCluster || isManualGp) && !textValue(rm.gp_manual)) return false;
  if (isFieldVisible('gp') && isGpOptional && isManualGp && !textValue(rm.gp_manual)) return false;
  if (isFieldVisible('school') && !rm.school && !textValue(rm.school_manual)) return false;
  if (isFieldVisible('school') && (isManualBlock || isManualCluster || isManualGp || isManualSchool) && !textValue(rm.school_manual)) return false;
  if (isFieldVisible('teacher') && !rm.teacher && !textValue(rm.teacher_manual)) return false;
  if (isFieldVisible('teacher') && (isManualBlock || isManualCluster || isManualGp || isManualSchool || isManualTeacher) && !textValue(rm.teacher_manual)) return false;

  return true;
};

export const validateBasicDetails = (formData, notifyValidationError = noop, setValidationContext = noop) => {
  if (!formData?.observer_name) {
    notifyValidationError('Please select your name before continuing.');
    setContext(setValidationContext, fieldContext('कृपया अपना नाम चुनें', 'observer_name'));
    return false;
  }

  if (formData.observer_name === 'Other' && !textValue(formData.observer_name_manual)) {
    notifyValidationError('Please enter your name manually.');
    setContext(setValidationContext, fieldContext('कृपया अपना नाम मैन्युअली दर्ज करें', 'observer_name_manual'));
    return false;
  }

  if (!formData.date) {
    notifyValidationError('Please choose a meeting date.');
    setContext(setValidationContext, fieldContext('कृपया तारीख चुनें', 'date'));
    return false;
  }

  if (!formData.process_type) {
    notifyValidationError('Please choose a process type.');
    setContext(setValidationContext, fieldContext('कृपया प्रक्रिया का चयन करें', 'process_type'));
    return false;
  }

  return true;
};

export const validateRMSelection = (formData, isFieldVisible = noop, isGpOptional = false, notifyValidationError = noop, setValidationContext = noop) => {
  if (!formData?.process_type) return true;

  const rm = formData.rm || {};
  const isManualBlock = rm.block === 'OTHER_BLOCK';
  const isManualCluster = rm.cluster === 'OTHER_CLUSTER';
  const isManualGp = rm.gp === 'OTHER_GP';
  const isManualSchool = rm.school === 'OTHER_SCHOOL';
  const isManualTeacher = rm.teacher === 'OTHER_TEACHER';

  const fail = (toastMessage, modalMessage, targetId) => {
    notifyValidationError(toastMessage);
    setContext(setValidationContext, fieldContext(modalMessage, targetId));
    return false;
  };

  if (formData.process_type === 'Other') {
    return rm.state ? true : fail('Please select the state.', 'कृपया राज्य चुनें', 'state');
  }

  if (isFieldVisible('state') && !rm.state) return fail('Please select the state.', 'कृपया राज्य चुनें', 'state');
  if (isFieldVisible('district') && !rm.district) return fail('Please select the district.', 'कृपया जिला चुनें', 'district');

  if (isFieldVisible('block')) {
    if (!rm.block) return fail('Please select the block.', 'कृपया ब्लॉक चुनें', 'block');
    if (isManualBlock && !textValue(rm.block_manual)) return fail('Please enter the block name manually.', 'कृपया मैन्युअल ब्लॉक नाम दर्ज करें', 'block_manual');
  }

  if (isFieldVisible('cluster')) {
    if (!rm.cluster) return fail('Please select the cluster.', 'कृपया संकुल चुनें', 'cluster');
    if (isManualCluster && !textValue(rm.cluster_manual)) return fail('Please enter the cluster name manually.', 'कृपया मैन्युअल संकुल नाम दर्ज करें', 'cluster_manual');
  }

  if (isFieldVisible('gp') && !isGpOptional) {
    if (!rm.gp) return fail('Please select the Gram Panchayat.', 'कृपया ग्राम पंचायत चुनें', 'gp');
    if ((isManualCluster || isManualGp) && !textValue(rm.gp_manual)) return fail('Please enter the Gram Panchayat name manually.', 'कृपया मैन्युअल ग्राम पंचायत नाम दर्ज करें', 'gp_manual');
  }

  if (isFieldVisible('gp') && isGpOptional && isManualGp && !textValue(rm.gp_manual)) {
    return fail('Please enter the Gram Panchayat name manually.', 'कृपया मैन्युअल ग्राम पंचायत नाम दर्ज करें', 'gp_manual');
  }

  if (isFieldVisible('school')) {
    if (!rm.school && !textValue(rm.school_manual)) return fail('Please select or enter the school name.', 'कृपया विद्यालय चुनें या मैन्युअल नाम दर्ज करें', 'school');
    if ((isManualBlock || isManualCluster || isManualGp || isManualSchool) && !textValue(rm.school_manual)) return fail('Please enter the school name manually.', 'कृपया मैन्युअल विद्यालय नाम दर्ज करें', 'school_manual');
  }

  if (isFieldVisible('teacher')) {
    if (!rm.teacher && !textValue(rm.teacher_manual)) return fail('Please select or enter the teacher name.', 'कृपया शिक्षक चुनें या मैन्युअल नाम दर्ज करें', 'teacher');
    if ((isManualBlock || isManualCluster || isManualGp || isManualSchool || isManualTeacher) && !textValue(rm.teacher_manual)) return fail('Please enter the teacher name manually.', 'कृपया मैन्युअल शिक्षक नाम दर्ज करें', 'teacher_manual');
  }

  return true;
};

export const hasRequiredAttachments = (formData) => {
  if (!formData?.files || formData.files.length < 2) return false;
  if (formData.process_type === 'GP' && !formData.gp_receipt_file) return false;
  return true;
};

export const isQuestionnaireComplete = (formData, active_questions = [], isGroupA = false) => {
  if (!formData?.process_type) return false;
  if (formData.process_type === 'DESC' || formData.process_type === 'Other') return true;

  if (isGroupA) {
    return active_questions.every(q => textValue(formData.answers?.[q.id]) !== '');
  }

  return active_questions.some(q => formData.answers?.[q.id] === true);
};

export const validateQuestionnaire = (formData, active_questions = [], isGroupA = false, notifyValidationError = noop, setValidationContext = noop) => {
  if (formData?.process_type !== 'DESC' && formData?.process_type !== 'Other') {
    if (isGroupA) {
      for (const q of active_questions) {
        if (textValue(formData.answers?.[q.id]) === '') {
          notifyValidationError('Please answer all questionnaire questions before continuing.');
          setContext(setValidationContext, questionContext(`Q. ${q.text}`, q.id));
          return false;
        }
      }
    } else if (!active_questions.some(q => formData.answers?.[q.id] === true)) {
      notifyValidationError('Please select at least one indicator.');
      setContext(setValidationContext, fieldContext('कृपया कम से कम एक इंडिकेटर चुनें', null));
      return false;
    }
  }

  if (formData?.process_type === 'GP' && !formData.gp_receipt_file) {
    notifyValidationError('A GP receipt document is required for GP process.');
    setContext(setValidationContext, fieldContext('GP प्रक्रिया के लिए GP रिसीट दस्तावेज जरूरी है', null));
    return false;
  }

  if (!formData?.files || formData.files.length < 2) {
    notifyValidationError('Please upload at least 2 files to continue.');
    setContext(setValidationContext, fileContext('कृपया कम से कम 2-3 प्रक्रिया फोटो/दस्तावेज अपलोड करें'));
    return false;
  }

  return true;
};
