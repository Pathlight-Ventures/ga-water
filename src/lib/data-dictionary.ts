// Data Dictionary for SDWIS codes and descriptions
// This provides human-readable descriptions for the various codes used in the database

export const DATA_DICTIONARY = {
  // Public Water System Types
  pws_type: {
    'CWS': 'Community Water System',
    'TNCWS': 'Transient Non-Community Water System',
    'NTNCWS': 'Non-Transient Non-Community Water System'
  },

  // Public Water System Activity Status
  pws_activity: {
    'A': 'Active',
    'I': 'Inactive',
    'N': 'Now Non-Public',
    'M': 'Merged',
    'P': 'Future Regulated'
  },

  // Violation Categories
  violation_category: {
    'TT': 'Treatment Technique Violation',
    'MRDL': 'Maximum Residual Disinfectant Level',
    'Other': 'Other Violation',
    'MCL': 'Maximum Contaminant Level Violation',
    'MR': 'Monitoring and Reporting',
    'MON': 'Monitoring Violation',
    'RPT': 'Reporting Violation'
  },

  // Violation Status
  violation_status: {
    'Resolved': 'The violation has been resolved',
    'Archived': 'The violation is archived (more than 5 years old)',
    'Addressed': 'The violation is addressed by formal enforcement',
    'Unaddressed': 'The violation has not been addressed'
  },

  // Primary Source Codes
  primary_source: {
    'GW': 'Ground Water',
    'GWP': 'Ground Water Purchased',
    'SW': 'Surface Water',
    'SWP': 'Surface Water Purchased',
    'GU': 'Ground Water Under Influence',
    'GUP': 'Ground Water Under Influence Purchased'
  },

  // Owner Type Codes
  owner_type: {
    'F': 'Federal Government',
    'L': 'Local Government',
    'M': 'Public/Private',
    'N': 'Native American',
    'P': 'Private',
    'S': 'State Government'
  },

  // Water Type Codes
  water_type: {
    'GW': 'Ground Water',
    'SW': 'Surface Water',
    'GU': 'Ground Water Under Influence'
  },

  // Availability Codes
  availability: {
    'E': 'Emergency',
    'I': 'Interim',
    'P': 'Permanent',
    'O': 'Other',
    'S': 'Seasonal',
    'U': 'Unknown'
  },

  // Area Type Codes
  area_type: {
    'TR': 'Tribal',
    'CN': 'County',
    'ZC': 'Zip Code',
    'CT': 'City',
    'IR': 'Indian Reservation'
  },

  // Evaluation Codes (for site visits)
  evaluation: {
    'M': 'Minor Deficiencies',
    'N': 'No Deficiencies',
    'R': 'Recommendations Made',
    'S': 'Significant Deficiencies',
    'X': 'Not Evaluated',
    'Z': 'Not Applicable',
    'D': 'Sanitary Defect'
  },

  // Result Sign Codes (for samples)
  result_sign: {
    'L': 'Less Than (Below Detection Limit)',
    'E': 'Equal To (Exact Value)'
  },

  // Rule Family Codes
  rule_family: {
    '100': 'Microbials',
    '200': 'Disinfectants and Disinfection Byproducts',
    '300': 'Chemicals',
    '400': 'Other',
    '500': 'Not Regulated'
  },

  // Rule Codes
  rule_code: {
    '110': 'Total Coliform Rule',
    '111': 'Revised Total Coliform Rule',
    '121': 'Surface Water Treatment Rule',
    '122': 'Long Term 1 Enhanced Surface Water Treatment Rule',
    '123': 'Long Term 2 Enhanced Surface Water Treatment Rule',
    '130': 'Filter Backwash Rule',
    '140': 'Ground Water Rule',
    '210': 'Stage 1 Disinfectants and Disinfection Byproducts Rule',
    '220': 'Stage 2 Disinfectants and Disinfection Byproducts Rule',
    '230': 'Total Trihalomethanes',
    '310': 'Volatile Organic Chemicals',
    '320': 'Synthetic Organic Chemicals',
    '330': 'Inorganic Chemicals',
    '331': 'Nitrates',
    '332': 'Arsenic',
    '333': 'Inorganic Chemicals',
    '340': 'Radionuclides',
    '350': 'Lead and Copper Rule',
    '410': 'Public Notice Rule',
    '420': 'Consumer Confidence Rule',
    '430': 'Miscellaneous',
    '500': 'Not Regulated'
  }
} as const;

// Utility functions for looking up descriptions
export function getPwsTypeDescription(code: string): string {
  return DATA_DICTIONARY.pws_type[code as keyof typeof DATA_DICTIONARY.pws_type] || 'Unknown';
}

export function getPwsActivityDescription(code: string): string {
  return DATA_DICTIONARY.pws_activity[code as keyof typeof DATA_DICTIONARY.pws_activity] || 'Unknown';
}

export function getViolationCategoryDescription(code: string): string {
  return DATA_DICTIONARY.violation_category[code as keyof typeof DATA_DICTIONARY.violation_category] || 'Unknown';
}

export function getViolationStatusDescription(code: string): string {
  return DATA_DICTIONARY.violation_status[code as keyof typeof DATA_DICTIONARY.violation_status] || 'Unknown';
}

export function getPrimarySourceDescription(code: string): string {
  return DATA_DICTIONARY.primary_source[code as keyof typeof DATA_DICTIONARY.primary_source] || 'Unknown';
}

export function getOwnerTypeDescription(code: string): string {
  return DATA_DICTIONARY.owner_type[code as keyof typeof DATA_DICTIONARY.owner_type] || 'Unknown';
}

export function getWaterTypeDescription(code: string): string {
  return DATA_DICTIONARY.water_type[code as keyof typeof DATA_DICTIONARY.water_type] || 'Unknown';
}

export function getAvailabilityDescription(code: string): string {
  return DATA_DICTIONARY.availability[code as keyof typeof DATA_DICTIONARY.availability] || 'Unknown';
}

export function getAreaTypeDescription(code: string): string {
  return DATA_DICTIONARY.area_type[code as keyof typeof DATA_DICTIONARY.area_type] || 'Unknown';
}

export function getEvaluationDescription(code: string): string {
  return DATA_DICTIONARY.evaluation[code as keyof typeof DATA_DICTIONARY.evaluation] || 'Unknown';
}

export function getResultSignDescription(code: string): string {
  return DATA_DICTIONARY.result_sign[code as keyof typeof DATA_DICTIONARY.result_sign] || 'Unknown';
}

export function getRuleFamilyDescription(code: string): string {
  return DATA_DICTIONARY.rule_family[code as keyof typeof DATA_DICTIONARY.rule_family] || 'Unknown';
}

export function getRuleCodeDescription(code: string): string {
  return DATA_DICTIONARY.rule_code[code as keyof typeof DATA_DICTIONARY.rule_code] || 'Unknown';
}

// Helper function to get all descriptions for a given type
export function getAllDescriptions(type: keyof typeof DATA_DICTIONARY): Record<string, string> {
  return DATA_DICTIONARY[type];
}

// Helper function to check if a code is health-based
export function isHealthBasedViolation(category: string): boolean {
  return ['TT', 'MRDL', 'MCL'].includes(category);
}

// Helper function to get violation severity color
export function getViolationStatusColor(status: string): string {
  switch (status) {
    case 'Resolved':
      return 'text-green-600';
    case 'Addressed':
      return 'text-yellow-600';
    case 'Unaddressed':
      return 'text-red-600';
    case 'Archived':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

// Helper function to get evaluation color
export function getEvaluationColor(code: string): string {
  switch (code) {
    case 'S':
      return 'text-red-600';
    case 'M':
      return 'text-yellow-600';
    case 'R':
      return 'text-blue-600';
    case 'N':
      return 'text-green-600';
    case 'D':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
} 