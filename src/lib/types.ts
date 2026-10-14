export type HelpLevel = 'basic' | 'guided' | 'detailed';

export type TaskStatus = 'due' | 'overdue' | 'done';

export type HomeType =
  | 'house'
  | 'apartment'
  | 'condo'
  | 'townhouse'
  | 'other';

export type ApplianceCategory =
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'appliance'
  | 'other';

export type Property = {
  id: string;
  user_id: string;
  nickname: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  home_type: HomeType;
  year_built: number | null;
  square_feet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  climate_zone: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  created_at: string;
  updated_at: string;
};

export type Appliance = {
  id: string;
  user_id: string;
  property_id: string | null;
  name: string;
  category: ApplianceCategory;
  make: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_expires_at: string | null;
  lifespan_years: number | null;
  manual_url: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  appliance_id: string | null;
  title: string;
  appliance: string | null;
  due_date: string;
  status: TaskStatus;
  notes: string | null;
  repeat: string;
  last_completed: string | null;
};

export const CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  appliance: 'Appliance',
  other: 'Other',
};