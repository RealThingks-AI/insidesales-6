export interface ITPolicy {
  id: string;
  policy_id: string;
  policy_name: string;
  category: string;
  description: string | null;
  owner_id: string | null;
  department: string | null;
  review_frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  last_review_date: string | null;
  next_review_date: string | null;
  status: 'Compliant' | 'Non-Compliant' | 'Under Review';
  attachments: FileAttachment[];
  remarks: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  owner?: {
    full_name: string;
  };
}

export interface FileAttachment {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

export interface PolicyFilters {
  category: string;
  status: 'all' | 'Compliant' | 'Non-Compliant' | 'Under Review';
  search: string;
}

export interface DepartmentCompliance {
  department: string;
  compliant: number;
  nonCompliant: number;
  underReview: number;
}
