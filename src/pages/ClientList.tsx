import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, RefreshCw, FileText, Award, Eye, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';

export const ClientList: React.FC = () => {
  const [permits, setPermits] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ClearanceRequest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const permitsData = await apiService.getPermits({ search, status: statusFilter });
      setPermits(permitsData);
    } catch (err) {
      console.error('Failed to load client permits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiService.deletePermit(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete permit request');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} style={{ color: '#0284c7' }} /> Client Permit Applications & Statuses
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Check every submitted permit, view real-time clearance status, read CAA responses, and access issued permit codes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Status
          </button>
          <Link
            to="/"
            className="btn-primary-rcaa"
            style={{ margin: 0, padding: '8px 16px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            + New Clearance Request
          </Link>
        </div>
      </div>

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
              placeholder="Search reference code, tail #, callsign, or airline..."
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
            <option value="PENDING">Pending Verification</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved Permits</option>
            <option value="REJECTED">Rejected Requests</option>
          </select>
        </div>
      </div>

      {/* Client Permits Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference Code</th>
              <th>Airline / Operator</th>
              <th>Aircraft & Callsign</th>
              <th>Category & Type</th>
              <th>Clearance Status</th>
              <th>Official RCAA Response & Issued Permit #</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading permit statuses...
                </td>
              </tr>
            ) : permits.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No submitted permit applications found matching your criteria.
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

                  {/* Official Response & Issued Permit Code Column */}
                  <td style={{ verticalAlign: 'top', maxWidth: '340px' }}>
                    {permit.issued_permit_code && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '0.3rem' }}>
                        <Award size={12} /> {permit.issued_permit_code}
                      </div>
                    )}
                    <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.3' }}>
                      {permit.response_notes || 'Clearance request submitted. Awaiting RCAA verification.'}
                    </div>
                    {permit.attached_document_name && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                        <FileText size={13} style={{ color: '#0284c7' }} />
                        <span style={{ fontWeight: 600, color: '#0369a1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {permit.attached_document_name}
                        </span>
                        {permit.attached_document_url && (
                          <a
                            href={permit.attached_document_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#0284c7',
                              fontWeight: 700,
                              textDecoration: 'none',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            View Document <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                      <Link
                        to={`/client-list/${permit.id}`}
                        style={{
                          padding: '6px 12px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={14} /> View Details
                      </Link>

                      <button
                        onClick={() => setDeleteTarget(permit)}
                        style={{
                          padding: '6px 10px',
                          background: '#f1f5f9',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Delete Permit Application"
                      >
                        <Trash2 size={14} /> Delete
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Confirm Permit Deletion</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  This will permanently remove the clearance request from the database.
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
    </div>
  );
};
