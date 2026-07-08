// Типы для дашборда персонала

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type CaseStatus = 'open' | 'in_progress' | 'resolved' | 'false_positive';

export interface Case {
  id: number;
  risk_level: RiskLevel;
  category: string;
  source_message: string;
  status: CaseStatus;
  created_at: string;
  student_email: string;
  student_id: number;
}

export interface StaffMessage {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  created_at: string;
}

export interface StaffUser {
  id: number;
  username: string;
  role: string;
}