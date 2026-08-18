import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceRequest, ClearanceStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, Eye, RefreshCw, Layers, CheckCircle2, Clock, AlertCircle, Check, X, FileText, Award } from 'lucide-react';

export const SubmissionsList: React.FC = () => {
  const [permits, setPermits] = useState<ClearanceRequest[]>([]);
  const [stats, setStats] = useState<ClearanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Submitted Clearance Applications</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            View submitted request statuses, admin responses, permit codes, and process approvals
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

      {/* Submissions Table with Result Details */}
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
                    <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
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
                          padding: '5px 10px',
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
                        title="View Full Request & Response Details"
                      >
                        <Eye size={12} /> Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
