import type { ClearanceRequest, ClearanceFormData, ClearanceStats, User } from '../types';

const API_BASE_URL = 'http://localhost:8008/api';

export const apiService = {
  // Auth Services
  login: async (credentials: Record<string, string>): Promise<{ user: User; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.non_field_errors?.[0] || err.detail || 'Login failed');
    }
    return res.json();
  },

  register: async (userData: Record<string, string>): Promise<{ user: User; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(Object.values(err).flat().join(', ') || 'Registration failed');
    }
    return res.json();
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const res = await fetch(`${API_BASE_URL}/auth/me/`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Permits Services
  getPermits: async (params?: { search?: string; status?: string; category?: string }): Promise<ClearanceRequest[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);

    const url = `${API_BASE_URL}/permits/${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch clearance requests');
    return res.json();
  },

  getPermitById: async (id: number | string): Promise<ClearanceRequest> => {
    const res = await fetch(`${API_BASE_URL}/permits/${id}/`);
    if (!res.ok) throw new Error('Clearance request not found');
    return res.json();
  },

  submitPermit: async (formData: ClearanceFormData): Promise<ClearanceRequest> => {
    const res = await fetch(`${API_BASE_URL}/permits/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(Object.values(err).flat().join(', ') || 'Failed to submit clearance request');
    }
    return res.json();
  },

  respondPermit: async (
    id: number | string,
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
    response_notes?: string,
    issued_permit_code?: string,
    attached_document_name?: string,
    attached_document_url?: string
  ): Promise<{ message: string; permit: ClearanceRequest }> => {
    const res = await fetch(`${API_BASE_URL}/permits/${id}/respond/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        response_notes,
        issued_permit_code,
        attached_document_name,
        attached_document_url
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(Object.values(err).flat().join(', ') || 'Failed to update permit status');
    }
    return res.json();
  },

  uploadDocument: async (file: File): Promise<{ attached_document_name: string; attached_document_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload-document/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload document');
    }
    return res.json();
  },

  getStats: async (): Promise<ClearanceStats> => {
    const res = await fetch(`${API_BASE_URL}/stats/`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  }
};
