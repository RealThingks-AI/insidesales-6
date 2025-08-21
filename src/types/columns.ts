
export interface ContactColumn {
  key: string;
  label: string;
  visible: boolean;
  type?: 'text' | 'email' | 'phone' | 'date' | 'select';
}

export interface LeadColumn {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  type?: 'text' | 'email' | 'phone' | 'date' | 'select' | 'number';
}
