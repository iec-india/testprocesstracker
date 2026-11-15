// src/data/constants.js

export const GROUP_A_PROCESSES = [
  "Teacher's Collective",
  "Classroom Observation",
  "School Visit",
  "AWTC",
  "ZPEC",
  "Other",
  "SMCOL",
  "SMCOS",
  "SLC",
  "SGS",
  "SMC",
  "SMCA",
  "ICM",
  "VLW",
  "DPRM"
];

export const GP_OPTIONAL_PROCESSES = ["Classroom Observation", "School Visit", "LN_Support"];

export const RM_INITIAL_STATE = {
  state: '',
  district: '',
  block: '',
  block_manual: '',
  cluster: '',
  cluster_manual: '',
  gp: '',
  gp_manual: '',
  school: '',
  school_manual: '',
  teacher: '',
  teacher_manual: '',
  school_udise: null
};

export const PROCESS_HIERARCHY = {
  "Classroom Observation": ['state', 'district', 'block', 'cluster', 'school', 'teacher'],
  "School Visit": ['state', 'district', 'block', 'cluster', 'school', 'teacher'],
  LN_Support: ['state', 'district', 'block', 'cluster', 'school', 'teacher'],
  Other: ['state', 'district', 'block', 'cluster', 'school', 'teacher'],
  GP: ['state', 'district', 'block', 'cluster', 'gp'],
  "Teacher's Collective": ['state', 'district', 'block', 'cluster'],
  AWTC: ['state', 'district', 'block', 'cluster'],
  ZPEC: ['state', 'district'],
  BESC: ['state', 'district', 'block'],
  BPM: ['state', 'district', 'block'],
  DIET: ['state', 'district'],
  DESC: ['state', 'district'],
  
  // MIS Master Processes Location Hierarchy:
  SMCOL: ['state', 'district', 'block', 'cluster', 'gp', 'school'],
  SMCOS: ['state', 'district', 'block', 'cluster', 'gp', 'school'],
  SGS: ['state', 'district', 'block', 'cluster', 'school'],
  SMC: ['state', 'district', 'block', 'cluster', 'school'],
  SMCA: ['state', 'district', 'block', 'cluster', 'school'],
  ICM: ['state', 'district', 'block'],
  VLW: ['state', 'district', 'block'],
  DPRM: ['state', 'district'],
  SLC: ['state']
};