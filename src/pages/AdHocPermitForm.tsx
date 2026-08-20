import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceFormData, ClearanceRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle, Code, ArrowRight } from 'lucide-react';

export const AdHocPermitForm: React.FC = () => {
  const [formData, setFormData] = useState<ClearanceFormData>({
    airline_operator: '',
    aircraft_registration: '',
    has_electronic_warfare: false,
    electronic_warfare_details: '',
    has_aircraft_modifications: false,
    aircraft_modifications_details: '',
    clearance_category: '',
    clearance_type: '',
    purpose_of_flight: '',
    aircraft_callsign: '',
    pilot_in_command: '',
    first_officer: '',
    entry_point: '',
    exit_point: '',
    flight_date: '',
    passengers_count: 0,
    cargo_details: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ClearanceRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'has_electronic_warfare' | 'has_aircraft_modifications', checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleResetForm = () => {
    setFormData({
      airline_operator: '',
      aircraft_registration: '',
      has_electronic_warfare: false,
      electronic_warfare_details: '',
      has_aircraft_modifications: false,
      aircraft_modifications_details: '',
      clearance_category: '',
      clearance_type: '',
      purpose_of_flight: '',
      aircraft_callsign: '',
      pilot_in_command: '',
      first_officer: '',
      entry_point: '',
      exit_point: '',
      flight_date: '',
      passengers_count: 0,
      cargo_details: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiService.submitPermit(formData);
      setSubmittedRequest(response);
      setShowResponseModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Form Action Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '6px',
        padding: '0.75rem 1.25rem',
        marginBottom: '1.5rem',
        border: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.88rem' }}>
          <span>Enter details below to submit a new clearance application</span>
        </div>
        <button
          type="button"
          onClick={handleResetForm}
          style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          Clear Form
        </button>
      </div>

      {errorMessage && (
        <div style={{
          background: '#ffe4e6',
          color: '#be123c',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid #fecdd3',
          fontWeight: 500
        }}>
          {errorMessage}
        </div>
      )}

      {/* Main RCAA Form Card */}
      <div className="rcaa-form-card">
        <div className="rcaa-form-header-bar">
          AD HOC PERMIT - CLEARANCE REQUEST FORM
        </div>

        <form onSubmit={handleSubmit} className="rcaa-form-body">
          {/* Airline / Operator Name */}
          <div className="form-group">
            <label className="form-label">Airline/Operator(Clients) Name/ Type</label>
            <input
              type="text"
              name="airline_operator"
              className="form-input"
              placeholder="e.g. RwandAir, Qatar Airways, Ethiopian Cargo..."
              value={formData.airline_operator}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Aircraft Registration Number */}
          <div className="form-group">
            <label className="form-label highlight-green">Aircraft Registration Number</label>
            <input
              type="text"
              name="aircraft_registration"
              className="form-input"
              placeholder="Enter aircraft tail number (e.g. 9XR-WN, 5H-ONE, ET-AVT...)"
              value={formData.aircraft_registration}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Electronic Warfare Question */}
          <div className="form-group">
            <label className="form-label">
              Does the aircraft have electronic warfare capabilities? (If Yes, kindly specify.)
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="ew_radio"
                  checked={!formData.has_electronic_warfare}
                  onChange={() => handleCheckboxChange('has_electronic_warfare', false)}
                /> No
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="ew_radio"
                  checked={formData.has_electronic_warfare}
                  onChange={() => handleCheckboxChange('has_electronic_warfare', true)}
                /> Yes
              </label>
            </div>
            <input
              type="text"
              name="electronic_warfare_details"
              className="form-input"
              placeholder="Specify EW equipment if applicable..."
              value={formData.electronic_warfare_details || ''}
              onChange={handleInputChange}
              disabled={!formData.has_electronic_warfare}
            />
          </div>

          {/* Aircraft Modifications Question */}
          <div className="form-group">
            <label className="form-label">
              Have any modifications been made on the aircraft (such as Cameras, etc) ?(If Yes,kindly specify)
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mod_radio"
                  checked={!formData.has_aircraft_modifications}
                  onChange={() => handleCheckboxChange('has_aircraft_modifications', false)}
                /> No
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mod_radio"
                  checked={formData.has_aircraft_modifications}
                  onChange={() => handleCheckboxChange('has_aircraft_modifications', true)}
                /> Yes
              </label>
            </div>
            <input
              type="text"
              name="aircraft_modifications_details"
              className="form-input"
              placeholder="Specify modifications if applicable..."
              value={formData.aircraft_modifications_details || ''}
              onChange={handleInputChange}
              disabled={!formData.has_aircraft_modifications}
            />
          </div>

          {/* Clearance Category */}
          <div className="form-group">
            <label className="form-label">Clearance Category</label>
            <select
              name="clearance_category"
              className="form-select"
              value={formData.clearance_category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Clearance Category...</option>
              <option value="Overflight">Overflight</option>
              <option value="Landing & Takeoff">Landing</option>
              <option value="Technical Stop">Technical Stop</option>
            </select>
          </div>

          {/* Clearance Type */}
          <div className="form-group">
            <label className="form-label">Clearance type</label>
            <select
              name="clearance_type"
              className="form-select"
              value={formData.clearance_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Clearance Type...</option>
              <option value="Diplomatic">Diplomatic</option>
              <option value="Cargo">Cargo</option>
              <option value="Commercial">Commercial</option>
              <option value="Private">Private</option>
              <option value="Military">Military</option>
            </select>
          </div>

          {/* Purpose of Flight */}
          <div className="form-group">
            <label className="form-label">Purpose of Flight</label>
            <input
              type="text"
              name="purpose_of_flight"
              className="form-input"
              placeholder="e.g. VIP Transport, Cargo Delivery, Commercial Passenger Transit..."
              value={formData.purpose_of_flight}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Aircraft Callsign */}
          <div className="form-group">
            <label className="form-label">Aircraft Callsign</label>
            <input
              type="text"
              name="aircraft_callsign"
              className="form-input"
              placeholder="e.g. RWB302, ETH884, TGFA01..."
              value={formData.aircraft_callsign}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Pilot in Command */}
          <div className="form-group">
            <label className="form-label">Pilot in command</label>
            <input
              type="text"
              name="pilot_in_command"
              className="form-input"
              placeholder="Enter Pilot in Command name..."
              value={formData.pilot_in_command}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* First Officer */}
          <div className="form-group">
            <label className="form-label">First Officer</label>
            <input
              type="text"
              name="first_officer"
              className="form-input"
              placeholder="Enter First Officer name..."
              value={formData.first_officer}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Flight Routing, Schedule & Cargo Payload */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1.25rem',
            marginTop: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div className="form-group">
              <label className="form-label">Entry Point (FIR)</label>
              <input
                type="text"
                name="entry_point"
                className="form-input"
                placeholder="e.g. OKIMO, KGL, BUJ..."
                value={formData.entry_point}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exit Point (FIR)</label>
              <input
                type="text"
                name="exit_point"
                className="form-input"
                placeholder="e.g. VAKIS, NBO, EBB..."
                value={formData.exit_point}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flight Date</label>
              <input
                type="date"
                name="flight_date"
                className="form-input"
                value={formData.flight_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passengers Count</label>
              <input
                type="number"
                name="passengers_count"
                className="form-input"
                value={formData.passengers_count}
                onChange={handleInputChange}
                min={0}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Cargo Details / Payload Summary</label>
              <input
                type="text"
                name="cargo_details"
                className="form-input"
                placeholder="e.g. Standard Passenger Baggage, 15 Tons Relief Cargo, None..."
                value={formData.cargo_details}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary-rcaa"
            disabled={loading}
          >
            {loading ? 'Transmitting Data to RCAA...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Response Modal / Automation Inspector */}
      {showResponseModal && submittedRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#047857' }}>
              <CheckCircle size={28} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Data Transmitted & Verified!</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Clearance Request successfully logged in Django backend.
                </p>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              fontSize: '0.9rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Reference Code:</span>
                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  {submittedRequest.reference_number}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Verification Status:</span>
                <StatusBadge status={submittedRequest.status} />
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Operator:</span>
                <strong>{submittedRequest.airline_operator}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>Aircraft Tail / Callsign:</span>
                <strong>{submittedRequest.aircraft_registration} ({submittedRequest.aircraft_callsign})</strong>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Code size={16} /> Automation API JSON Response Payload:
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>HTTP 201 Created</span>
              </div>
              <div className="json-inspector-box" style={{ maxHeight: '200px' }}>
                {JSON.stringify(submittedRequest, null, 2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Close & Submit Another
              </button>

              <Link
                to={`/submissions/${submittedRequest.id}`}
                className="btn-primary-rcaa"
                style={{ width: 'auto', margin: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Inspect & Respond to Data <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
