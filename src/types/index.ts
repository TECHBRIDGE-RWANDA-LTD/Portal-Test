export type PermitStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

export interface ClearanceRequest {
  id: number;
  reference_number: string;
  airline_operator: string;
  aircraft_registration: string;
  has_electronic_warfare: boolean;
  electronic_warfare_details?: string | null;
  has_aircraft_modifications: boolean;
  aircraft_modifications_details?: string | null;
  clearance_category: string;
  clearance_type: string;
  purpose_of_flight: string;
  aircraft_callsign: string;
  pilot_in_command: string;
  first_officer: string;
  entry_point?: string | null;
  exit_point?: string | null;
  flight_date?: string | null;
  passengers_count: number;
  cargo_details?: string | null;
  status: PermitStatus;
  response_notes: string;
  issued_permit_code?: string | null;
  attached_document_name?: string | null;
  attached_document_url?: string | null;
  submitted_by?: number | null;
  submitted_by_user?: User | null;
  created_at: string;
  updated_at: string;
}

export interface ClearanceFormData {
  airline_operator: string;
  aircraft_registration: string;
  has_electronic_warfare: boolean;
  electronic_warfare_details: string;
  has_aircraft_modifications: boolean;
  aircraft_modifications_details: string;
  clearance_category: string;
  clearance_type: string;
  purpose_of_flight: string;
  aircraft_callsign: string;
  pilot_in_command: string;
  first_officer: string;
  entry_point: string;
  exit_point: string;
  flight_date: string;
  passengers_count: number;
  cargo_details: string;
}

export interface ClearanceStats {
  total_requests: number;
  pending_requests: number;
  under_review_requests: number;
  approved_requests: number;
  rejected_requests: number;
}
