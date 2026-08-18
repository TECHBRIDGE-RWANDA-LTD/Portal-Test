import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Plane,
  Calendar,
  FileText,
  Award,
  ExternalLink
} from 'lucide-react';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [permit, setPermit] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiService.getPermitById(id);
      setPermit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permit details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#64748b' }}>Fetching your clearance permit status & details...</p>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2 style={{ color: '#be123c' }}>Error Loading Clearance Request</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>{error}</p>
        <Link to="/client-list" className="btn-secondary">Back to Client List</Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link
          to="/client-list"
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
          <ArrowLeft size={16} /> Back to Client Applications List
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Reference Code:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: '#0284c7' }}>
            {permit.reference_number}
          </span>
          <StatusBadge status={permit.status} />
        </div>
      </div>

      {/* Official Government Decision & Response Card */}
      <div style={{
        background: permit.status === 'APPROVED' ? '#f0fdf4' : permit.status === 'REJECTED' ? '#fff1f2' : '#f8fafc',
        border: `2px solid ${permit.status === 'APPROVED' ? '#86efac' : permit.status === 'REJECTED' ? '#fca5a5' : '#cbd5e1'}`,
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {permit.status === 'APPROVED' ? (
              <CheckCircle size={24} style={{ color: '#16a34a' }} />
            ) : permit.status === 'REJECTED' ? (
              <XCircle size={24} style={{ color: '#dc2626' }} />
            ) : (
              <Clock size={24} style={{ color: '#0284c7' }} />
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Official RCAA Government Decision & Response
            </h2>
          </div>

          {permit.issued_permit_code && (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #86efac',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Award size={16} /> PERMIT #: {permit.issued_permit_code}
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5', margin: '0.5rem 0' }}>
          {permit.response_notes || 'Clearance application successfully submitted. Awaiting RCAA authority review.'}
        </p>

        {permit.attached_document_name && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#0284c7' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                  {permit.attached_document_name}
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Official RCAA Clearance Document File</span>
              </div>
            </div>

            {permit.attached_document_url && (
              <a
                href={permit.attached_document_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 16px',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                View / Open Document <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Applied Flight Request Information Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Card 1: Flight & Aircraft Info */}
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plane size={18} style={{ color: '#0284c7' }} /> Applied Flight & Aircraft Details
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

        {/* Card 2: Route & Special Capabilities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: '#0284c7' }} /> Route Schedule & FIR Waypoints
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
        </div>
      </div>
    </div>
  );
};
