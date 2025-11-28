export enum TestCategory {
  CBC = 'Complete Blood Count',
  LIVER = 'Liver Function',
  KIDNEY = 'Kidney Function',
  LIPID = 'Lipid Profile',
  ELECTROLYTES = 'Electrolytes',
  INFLAMMATION = 'Inflammation Markers',
  THYROID = 'Thyroid Function',
  OTHER = 'Other'
}

export enum ResultStatus {
  NORMAL = 'Normal',
  HIGH = 'High',
  LOW = 'Low',
  CRITICAL = 'Critical',
  UNKNOWN = 'Unknown'
}

export interface LabResult {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  category: TestCategory | string;
  status: ResultStatus;
  interpretation?: string;
  clinicalSignificance?: string;
  possibleCauses?: string[];
}

export interface ClinicalInterpretation {
  keyFindings: string[];
  clinicalImplications: string[];
  recommendedActions: string[];
}

export interface DietaryRecommendation {
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  items: string[];
}

export interface LabReportData {
  id?: string;
  user_id?: string;
  patientName?: string;
  reportDate?: string;
  labName?: string;
  results: LabResult[];
  summary: string;
  abnormalities: string[];
  uploadDate?: string;
  clinicalInterpretation?: ClinicalInterpretation;
  dietaryRecommendations?: DietaryRecommendation[];
}

export interface UserProfile {
  id?: string; // Links to Auth User ID
  name: string;
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  bloodType: string;
  email: string;
  phone: string;
}

export interface HealthMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'alert';
  trend?: 'up' | 'down' | 'stable';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BackupData {
  version: string;
  exportDate: string;
  user: UserProfile;
  reports: LabReportData[];
}
