import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceRequest, PermitStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Plane,
  Calendar,
  FileCheck,
  Upload,
  FileText,
  Award,
  ExternalLink
} from 'lucide-react';

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [permit, setPermit] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Action Workspace state
  const [targetStatus, setTargetStatus] = useState<PermitStatus>('APPROVED');
  const [responseNotes, setResponseNotes] = useState('');
  const [issuedPermitCode, setIssuedPermitCode] = useState('');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseSuccessMessage, setResponseSuccessMessage] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiService.getPermitById(id);
      setPermit(data);
      setTargetStatus(data.status);
      setResponseNotes(data.response_notes || '');
      setIssuedPermitCode(data.issued_permit_code || '');
      setDocName(data.attached_document_name || '');
      setDocUrl(data.attached_document_url || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permit details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  const handleActionSubmit = async (selectedStatus: PermitStatus) => {
    if (!id) return;
    setSubmittingResponse(true);
    setResponseSuccessMessage(null);

    let defaultNote = responseNotes;
    if (!defaultNote) {
      if (selectedStatus === 'APPROVED') defaultNote = 'Ad-Hoc Flight Clearance Approved per RCAA Civil Aviation Regulations.';
      else if (selectedStatus === 'REJECTED') defaultNote = 'Clearance denied due to incomplete flight documentation or security review.';
      else if (selectedStatus === 'UNDER_REVIEW') defaultNote = 'Application flagged for supplementary inspection by Air Navigation Services.';
      else defaultNote = 'Clearance request queued for verification.';
    }

    try {
      const result = await apiService.respondPermit(
        id,
        selectedStatus,
        defaultNote,
        issuedPermitCode,
        docName,
        docUrl
      );
      setPermit(result.permit);
      setTargetStatus(selectedStatus);
      setResponseSuccessMessage(`Application successfully updated to status: ${selectedStatus}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update permit application');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const res = await apiService.uploadDocument(file);
        setDocName(res.attached_document_name);
        setDocUrl(res.attached_document_url);
        setResponseSuccessMessage(`Document "${res.attached_document_name}" uploaded and attached successfully!`);
      } catch (err: any) {
        setError(err.message || 'Failed to upload document file');
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#64748b' }}>Loading application details...</p>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2 style={{ color: '#be123c' }}>Error Loading Clearance Request</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>{error}</p>
        <Link to="/submissions" className="btn-secondary">Back to Submissions</Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link
          to="/submissions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#0284c7',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Submitted Applications List
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Reference Code:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: '#0284c7' }}>
            {permit.reference_number}
          </span>
          <StatusBadge status={permit.status} />
        </div>
      </div>

      {responseSuccessMessage && (
        <div style={{
          background: '#d1fae5',
          color: '#047857',
          padding: '1rem 1.25rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid #a7f3d0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} /> {responseSuccessMessage}
        </div>
      )}

      {/* Main Grid: Application Details + Admin Action Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Application Data Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Flight & Aircraft Details */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plane size={18} style={{ color: '#0284c7' }} /> Flight & Aircraft Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Airline / Operator:</span>
                <strong style={{ color: '#0f172a' }}>{permit.airline_operator}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Aircraft Registration:</span>
                <strong style={{ color: '#0f172a' }}>{permit.aircraft_registration}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Aircraft Callsign:</span>
                <strong>{permit.aircraft_callsign}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Clearance Category:</span>
                <strong>{permit.clearance_category} ({permit.clearance_type})</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Pilot in Command:</span>
                <span>{permit.pilot_in_command}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>First Officer:</span>
                <span>{permit.first_officer}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Purpose of Flight:</span>
                <span>{permit.purpose_of_flight}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Technical Specifications & Capabilities */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: '#0284c7' }} /> Technical & Special Capabilities
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Electronic Warfare:</span>
                <span style={{ fontWeight: 600, color: permit.has_electronic_warfare ? '#be123c' : '#047857' }}>
                  {permit.has_electronic_warfare ? 'Yes (Specified)' : 'No'}
                </span>
                {permit.electronic_warfare_details && (
                  <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                    {permit.electronic_warfare_details}
                  </p>
                )}
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Aircraft Modifications:</span>
                <span style={{ fontWeight: 600, color: permit.has_aircraft_modifications ? '#b45309' : '#047857' }}>
                  {permit.has_aircraft_modifications ? 'Yes (Specified)' : 'No'}
                </span>
                {permit.aircraft_modifications_details && (
                  <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                    {permit.aircraft_modifications_details}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Route Schedule & Cargo */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: '#0284c7' }} /> Route Schedule & Payload
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Entry Point:</span>
                <strong>{permit.entry_point || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Exit Point:</span>
                <strong>{permit.exit_point || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Flight Date:</span>
                <strong>{permit.flight_date || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Passengers:</span>
                <strong>{permit.passengers_count}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Cargo Summary:</span>
                <span>{permit.cargo_details || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Official Attached Documents */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={18} style={{ color: '#0284c7' }} /> Clearance Documents & Attachments
            </h3>

            {permit.attached_document_name ? (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={24} style={{ color: '#0284c7' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                      {permit.attached_document_name}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Official CAA Document Attachment</span>
                  </div>
                </div>
                {permit.attached_document_url && (
                  <a
                    href={permit.attached_document_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 14px',
                      background: '#0284c7',
                      color: '#fff',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    View / Open Document <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>
                No clearance document uploaded yet. Use the Admin Action Panel to attach official permit files.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Admin Actions Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #0284c7',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: '#0284c7' }} /> Administrative Action Panel
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Approve, reject, edit reference code, or upload official clearance documents.
            </p>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleActionSubmit('APPROVED')}
                disabled={submittingResponse}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <CheckCircle size={16} /> Allow / Grant
              </button>

              <button
                type="button"
                onClick={() => handleActionSubmit('REJECTED')}
                disabled={submittingResponse}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <XCircle size={16} /> Deny / Reject
              </button>

              <button
                type="button"
                onClick={() => handleActionSubmit('UNDER_REVIEW')}
                disabled={submittingResponse}
                style={{
                  padding: '10px 12px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
                title="Flag for Under Review"
              >
                <Clock size={16} />
              </button>
            </div>

            {/* Detailed Form Controls */}
            <form onSubmit={(e) => { e.preventDefault(); handleActionSubmit(targetStatus); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Permit Status</label>
                <select
                  className="form-select"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as PermitStatus)}
                >
                  <option value="APPROVED">APPROVED (Grant Permit)</option>
                  <option value="REJECTED">REJECTED (Deny Request)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Flag for Review)</option>
                  <option value="PENDING">PENDING (Keep Queued)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Clearance / Permit Reference Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. PERMIT-RCAA-2026-X882"
                  value={issuedPermitCode}
                  onChange={(e) => setIssuedPermitCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attach Clearance Document (PDF/File)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Document Name (e.g. RCAA-Clearance-Certificate.pdf)"
                    value={docName}
                    onChange={(e) => {
                      setDocName(e.target.value);
                      if (e.target.value && !docUrl) {
                        setDocUrl(`http;//clever-playfulness-production-06cd.up.railway.app/media/documents/${e.target.value}`);
                      }
                    }}
                  />
                  <label
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Upload size={14} /> Upload File
                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Remarks & Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Add administrative comments, approval conditions, or denial reasons..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-rcaa"
                style={{ width: '100%', maxWidth: 'none', margin: '0.5rem 0 0 0' }}
                disabled={submittingResponse}
              >
                {submittingResponse ? 'Updating Application...' : 'Save & Transmit Action'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
