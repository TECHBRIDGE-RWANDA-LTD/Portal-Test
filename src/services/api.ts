import type { ClearanceRequest, ClearanceFormData, ClearanceStats, User } from '../types';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const PRIMARY_API_URL = isLocalhost
  ? 'http://127.0.0.1:8000/api'
  : 'https://clever-playfulness-production-06cd.up.railway.app/api';

const SECONDARY_API_URL = isLocalhost
  ? 'https://clever-playfulness-production-06cd.up.railway.app/api'
  : 'http://127.0.0.1:8000/api';

const fetchWithFallback = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  try {
    const res = await fetch(`${PRIMARY_API_URL}${endpoint}`, options);
    if (res.ok) return res;
  } catch (e) {
    // Primary URL network error
  }

  try {
    const secondaryRes = await fetch(`${SECONDARY_API_URL}${endpoint}`, options);
    if (secondaryRes.ok) return secondaryRes;
  } catch (e) {
    // Secondary URL network error
  }

  return fetch(`${PRIMARY_API_URL}${endpoint}`, options);
};

export const apiService = {
  // Auth Services
  login: async (credentials: Record<string, string>): Promise<{ user: User; message: string }> => {
    const res = await fetchWithFallback('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.non_field_errors?.[0] || err.detail || 'Login failed');
    }
    return res.json();
  },

  register: async (userData: Record<string, string>): Promise<{ user: User; message: string }> => {
    const res = await fetchWithFallback('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(Object.values(err).flat().join(', ') || 'Registration failed');
    }
    return res.json();
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const res = await fetchWithFallback('/auth/me/');
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Permits Services
  getPermits: async (params?: { search?: string; status?: string; category?: string }): Promise<ClearanceRequest[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status.toUpperCase() !== 'ALL') {
        query.append('status', params.status);
      }
      if (params?.category && params.category.toUpperCase() !== 'ALL') {
        query.append('category', params.category);
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetchWithFallback(`/permits/${queryString}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('API getPermits warning:', err);
      return [];
    }
  },

  getPermitById: async (id: number | string): Promise<ClearanceRequest> => {
    const res = await fetchWithFallback(`/permits/${id}/`);
    if (!res.ok) throw new Error('Clearance request not found');
    return res.json();
  },

  submitPermit: async (formData: ClearanceFormData): Promise<ClearanceRequest> => {
    const payload = {
      ...formData,
      flight_date: formData.flight_date ? formData.flight_date : null,
    };
    const res = await fetchWithFallback('/permits/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
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
    const res = await fetchWithFallback(`/permits/${id}/respond/`, {
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
      const err = await res.json().catch(() => ({}));
      throw new Error(Object.values(err).flat().join(', ') || 'Failed to update permit status');
    }
    return res.json();
  },

  uploadDocument: async (file: File): Promise<{ attached_document_name: string; attached_document_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetchWithFallback('/upload-document/', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document');
    }
    return res.json();
  },

  updatePermit: async (id: number | string, data: Partial<ClearanceRequest>): Promise<ClearanceRequest> => {
    const res = await fetchWithFallback(`/permits/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(Object.values(err).flat().join(', ') || 'Failed to update clearance request');
    }
    return res.json();
  },

  deletePermit: async (id: number | string): Promise<void> => {
    const res = await fetchWithFallback(`/permits/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete clearance request');
    }
  },

  getStats: async (): Promise<ClearanceStats> => {
    try {
      const res = await fetchWithFallback('/stats/');
      if (!res.ok) {
        return { total_requests: 0, pending_requests: 0, under_review_requests: 0, approved_requests: 0, rejected_requests: 0 };
      }
      return await res.json();
    } catch (err) {
      return { total_requests: 0, pending_requests: 0, under_review_requests: 0, approved_requests: 0, rejected_requests: 0 };
    }
  }
};
