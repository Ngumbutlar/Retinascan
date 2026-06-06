export interface ClinicalRecommendation {
  severity: string;
  urgency: string;
  action: string;
  followup: string;
  color: string;
  refer: boolean;
}

export interface ScreeningResult {
  success: boolean;
  record_id: number;
  patient: {
    name: string;
    age: number;
    sex: string;
    hospital_id: string;
    eye: string;
  };
  result: {
    grade: number;
    grade_label: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
  recommendation: ClinicalRecommendation;
  screened_at: string;
}

/** Router location state passed to the Results page after screening. */
export interface ResultsLocationState {
  record_id: number;
  patient: {
    name: string;
    age: number;
    sex: string;
    hospital_id: string;
    eye: string;
  };
  result: {
    grade: number;
    grade_label: string;
    confidence: number;
    probabilities: {
      'No DR': number;
      Mild: number;
      Moderate: number;
      Severe: number;
      Proliferative: number;
    };
  };
  recommendation: ClinicalRecommendation;
  screened_at: string;
  fundus_image_preview: string;
}

export const DR_GRADE_LABELS = [
  'No DR',
  'Mild',
  'Moderate',
  'Severe',
  'Proliferative',
] as const;

export const SEVERITY_SCALE_COLORS = [
  '#2E8B57',
  '#52A86A',
  '#F4A261',
  '#E76F51',
  '#C1121F',
] as const;

export interface DashboardStats {
  screenings_today: number;
  screenings_this_month: number;
  screenings_total: number;
  referrals_generated: number;
  grade_distribution: Record<string, number>;
}
