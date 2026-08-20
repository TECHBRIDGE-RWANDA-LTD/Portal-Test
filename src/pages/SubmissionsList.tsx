import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceRequest, ClearanceStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  X,
  FileText,
  Award,
  Trash2,
  Edit3,
  AlertTriangle,
  Save
} from 'lucide-react';

export const SubmissionsList: React.FC = () => {
  const [permits, setPermits] = useState<ClearanceRequest[]>([]);
  const [stats, setStats] = useState<ClearanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Delete State & Modal
  const [deleteTarget, setDeleteTarget] = useState<ClearanceRequest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit State & Modal
  const [editTarget, setEditTarget] = useState<ClearanceRequest | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClearanceRequest>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permitsData, statsData] = await Promise.all([
        apiService.getPermits({ search, status: statusFilter }),
        apiService.getStats()
      ]);
      setPermits(permitsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleQuickStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    try {
      const note = status === 'APPROVED'
        ? 'Flight clearance approved by RCAA Authority.'
        : 'Flight clearance denied by RCAA Authority.';
      await apiService.respondPermit(id, status, note);
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Delete Action Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deletePermit(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete clearance request');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit Action Handlers
  const handleOpenEdit = (permit: ClearanceRequest) => {
    setEditTarget(permit);
    setEditFormData({
      airline_operator: permit.airline_operator,
      aircraft_registration: permit.aircraft_registration,
      aircraft_callsign: permit.aircraft_callsign,
      pilot_in_command: permit.pilot_in_command,
      first_officer: permit.first_officer,
      clearance_category: permit.clearance_category,
      clearance_type: permit.clearance_type,
      purpose_of_flight: permit.purpose_of_flight,
      entry_point: permit.entry_point || '',
      exit_point: permit.exit_point || '',
      flight_date: permit.flight_date || '',
      passengers_count: permit.passengers_count,
      cargo_details: permit.cargo_details || '',
      status: permit.status,
      response_notes: permit.response_notes || '',
      issued_permit_code: permit.issued_permit_code || ''
    });
    setEditError(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await apiService.updatePermit(editTarget.id, editFormData);
      setEditTarget(null);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update clearance request');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Submitted Clearance Applications</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            View, edit, approve, reject, or delete submitted clearance applications
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Overview */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span className="stat-label">Total Applications</span>
              <Layers size={18} />
            </div>
            <div className="stat-value">{stats.total_requests}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309' }}>
              <span className="stat-label">Pending Verification</span>
              <AlertCircle size={18} />
            </div>
            <div className="stat-value" style={{ color: '#b45309' }}>{stats.pending_requests}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857' }}>
              <span className="stat-label">Approved Permits</span>
              <CheckCircle2 size={18} />
            </div>
            <div className="stat-value" style={{ color: '#047857' }}>{stats.approved_requests}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4338ca' }}>
              <span className="stat-label">Under Review</span>
              <Clock size={18} />
            </div>
            <div className="stat-value" style={{ color: '#4338ca' }}>{stats.under_review_requests}</div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        border: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search reference code, tail #, callsign, or operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>Filter Status:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions Table with Result Details & Actions */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference Code</th>
              <th>Airline / Operator</th>
              <th>Aircraft & Callsign</th>
              <th>Category & Type</th>
              <th>Status</th>
              <th>RCAA Admin Response & Permit Code</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading clearance submissions...
                </td>
              </tr>
            ) : permits.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No clearance requests found matching your filters.
                </td>
              </tr>
            ) : (
              permits.map(permit => (
                <tr key={permit.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', verticalAlign: 'top' }}>
                    {permit.reference_number}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '0.2rem' }}>
                      {new Date(permit.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600 }}>{permit.airline_operator}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>PIC: {permit.pilot_in_command}</div>
                  </td>

                  <td style={{ verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 700 }}>{permit.aircraft_registration}</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.4rem' }}>
                      ({permit.aircraft_callsign})
                    </span>
                  </td>

                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ fontSize: '0.88rem' }}>{permit.clearance_category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{permit.clearance_type}</div>
                  </td>

                  <td style={{ verticalAlign: 'top' }}>
                    <StatusBadge status={permit.status} />
                  </td>

                  {/* Admin Response & Permit Code Result Column */}
                  <td style={{ verticalAlign: 'top', maxWidth: '300px' }}>
                    {permit.issued_permit_code && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '0.3rem' }}>
                        <Award size={12} /> {permit.issued_permit_code}
                      </div>
                    )}
                    <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.3' }}>
                      {permit.response_notes || 'Awaiting CAA verification.'}
                    </div>
                    {permit.attached_document_name && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <FileText size={12} /> {permit.attached_document_name}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {permit.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleQuickStatus(permit.id, 'APPROVED')}
                          disabled={actionLoadingId === permit.id}
                          style={{
                            padding: '5px 8px',
                            background: '#d1fae5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                          title="Allow / Grant Request"
                        >
                          <Check size={12} /> Allow
                        </button>
                      )}

                      {permit.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleQuickStatus(permit.id, 'REJECTED')}
                          disabled={actionLoadingId === permit.id}
                          style={{
                            padding: '5px 8px',
                            background: '#ffe4e6',
                            color: '#be123c',
                            border: '1px solid #fecdd3',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                          title="Deny / Reject Request"
                        >
                          <X size={12} /> Deny
                        </button>
                      )}

                      <Link
                        to={`/submissions/${permit.id}`}
                        style={{
                          padding: '5px 8px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                        title="View Details"
                      >
                        <Eye size={12} /> View
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(permit)}
                        style={{
                          padding: '5px 8px',
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                        title="Edit Clearance Application"
                      >
                        <Edit3 size={12} /> Edit
                      </button>

                      <button
                        onClick={() => setDeleteTarget(permit)}
                        style={{
                          padding: '5px 8px',
                          background: '#f1f5f9',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                        title="Delete Clearance Application"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <AlertTriangle size={32} />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Confirm Application Deletion</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  This will permanently remove the record from the database.
                </p>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '1rem',
              fontSize: '0.88rem'
            }}>
              <div><strong>Reference Code:</strong> <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{deleteTarget.reference_number}</span></div>
              <div><strong>Airline / Operator:</strong> {deleteTarget.airline_operator}</div>
              <div><strong>Aircraft Registration:</strong> {deleteTarget.aircraft_registration} ({deleteTarget.aircraft_callsign})</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Trash2 size={16} /> {deleteLoading ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} style={{ color: '#0284c7' }} /> Edit Application: {editTarget.reference_number}
              </h3>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{ background: '#ffe4e6', color: '#be123c', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Airline / Operator</label>
                  <input
                    type="text"
                    name="airline_operator"
                    className="form-input"
                    value={editFormData.airline_operator || ''}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Aircraft Registration</label>
                  <input
                    type="text"
                    name="aircraft_registration"
                    className="form-input"
                    value={editFormData.aircraft_registration || ''}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Aircraft Callsign</label>
                  <input
                    type="text"
                    name="aircraft_callsign"
                    className="form-input"
                    value={editFormData.aircraft_callsign || ''}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pilot in Command</label>
                  <input
                    type="text"
                    name="pilot_in_command"
                    className="form-input"
                    value={editFormData.pilot_in_command || ''}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">First Officer</label>
                  <input
                    type="text"
                    name="first_officer"
                    className="form-input"
                    value={editFormData.first_officer || ''}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clearance Category</label>
                  <select
                    name="clearance_category"
                    className="form-select"
                    value={editFormData.clearance_category || ''}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="Overflight">Overflight</option>
                    <option value="Landing & Takeoff">Landing</option>
                    <option value="Technical Stop">Technical Stop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Clearance Type</label>
                  <select
                    name="clearance_type"
                    className="form-select"
                    value={editFormData.clearance_type || ''}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="Diplomatic">Diplomatic</option>
                    <option value="Cargo">Cargo</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Private">Private</option>
                    <option value="Military">Military</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={editFormData.status || 'PENDING'}
                    onChange={handleEditInputChange}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of Flight</label>
                <input
                  type="text"
                  name="purpose_of_flight"
                  className="form-input"
                  value={editFormData.purpose_of_flight || ''}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Entry Point</label>
                  <input
                    type="text"
                    name="entry_point"
                    className="form-input"
                    value={editFormData.entry_point || ''}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Exit Point</label>
                  <input
                    type="text"
                    name="exit_point"
                    className="form-input"
                    value={editFormData.exit_point || ''}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Flight Date</label>
                  <input
                    type="date"
                    name="flight_date"
                    className="form-input"
                    value={editFormData.flight_date || ''}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passengers</label>
                  <input
                    type="number"
                    name="passengers_count"
                    className="form-input"
                    value={editFormData.passengers_count || 0}
                    onChange={handleEditInputChange}
                    min={0}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cargo / Payload Summary</label>
                <input
                  type="text"
                  name="cargo_details"
                  className="form-input"
                  value={editFormData.cargo_details || ''}
                  onChange={handleEditInputChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditTarget(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-rcaa"
                  style={{ margin: 0, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={editLoading}
                >
                  <Save size={16} /> {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
