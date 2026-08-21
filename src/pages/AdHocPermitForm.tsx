import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { ClearanceFormData, ClearanceRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  CheckCircle,
  Code,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  FileText,
  CreditCard,
  MapPin,
  Users,
  Calendar,
  Compass,
  Navigation,
  UploadCloud,
  Send,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';

interface FormSection {
  id: string;
  title: string;
}

const FORM_SECTIONS: FormSection[] = [
  { id: 'clearance-request', title: 'Clearance Request' },
  { id: 'payment-mode', title: 'Payment Mode' },
  { id: 'payment-billing-address', title: 'Payment Billing Address' },
  { id: 'passenger', title: 'Passenger' },
  { id: 'flight-schedule', title: 'Flight Schedule' },
  { id: 'stop-over', title: 'Stop Over' },
  { id: 'airspace-entry-exit', title: 'Airspace Entry & Exit' },
  { id: 'uploadables', title: 'Uploadables' }
];

export const AdHocPermitForm: React.FC = () => {
  const [formData, setFormData] = useState<ClearanceFormData>({
    airline_operator: '',
    aircraft_registration: '',
    has_electronic_warfare: false,
    electronic_warfare_details: '',
    has_aircraft_modifications: false,
    aircraft_modifications_details: '',
    clearance_category: 'Overflight',
    clearance_type: 'Diplomatic',
    purpose_of_flight: '',
    aircraft_callsign: '',
    pilot_in_command: '',
    first_officer: '',
    entry_point: '',
    exit_point: '',
    flight_date: '',
    passengers_count: 0,
    cargo_details: '',
    // Extended section defaults
    payment_mode: 'Credit Card',
    payment_account_ref: '',
    billing_name: '',
    billing_address: '',
    billing_city_country: '',
    billing_email: '',
    billing_tax_id: '',
    passenger_manifest_summary: '',
    departure_airport: '',
    arrival_airport: '',
    stopover_airport: '',
    stopover_purpose: '',
    airway_routes: '',
    uploaded_airworthiness_cert: '',
    uploaded_aoc_cert: '',
    uploaded_insurance_cert: ''
  });

  const [activeSectionId, setActiveSectionId] = useState<string>('clearance-request');
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ClearanceRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active section scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const allSectionIds = [...FORM_SECTIONS.map(s => s.id), 'submit-section'];
      const scrollPosition = window.scrollY + 140;

      for (let i = allSectionIds.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(allSectionIds[i]);
        if (sectionEl && sectionEl.offsetTop <= scrollPosition) {
          setActiveSectionId(allSectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      clearance_category: 'Overflight',
      clearance_type: 'Diplomatic',
      purpose_of_flight: '',
      aircraft_callsign: '',
      pilot_in_command: '',
      first_officer: '',
      entry_point: '',
      exit_point: '',
      flight_date: '',
      passengers_count: 0,
      cargo_details: '',
      payment_mode: 'Credit Card',
      payment_account_ref: '',
      billing_name: '',
      billing_address: '',
      billing_city_country: '',
      billing_email: '',
      billing_tax_id: '',
      passenger_manifest_summary: '',
      departure_airport: '',
      arrival_airport: '',
      stopover_airport: '',
      stopover_purpose: '',
      airway_routes: '',
      uploaded_airworthiness_cert: '',
      uploaded_aoc_cert: '',
      uploaded_insurance_cert: ''
    });
    scrollToSection('clearance-request');
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
      {/* Top action toolbar */}
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

      {/* Main Form Layout with Sidebar Navigation */}
      <div className="rcaa-form-layout">
        {/* Left Sticky Sidebar Navigation matching user screenshot */}
        <aside className="rcaa-sidebar">
          <div className="rcaa-sidebar-header">
            <span>Ad hoc Permit</span>
            <ChevronDown size={16} />
          </div>

          <div className="rcaa-sidebar-nav">
            {FORM_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`rcaa-sidebar-link ${activeSectionId === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                <span>{section.title}</span>
              </button>
            ))}

            <button
              type="button"
              className={`rcaa-sidebar-submit-btn ${activeSectionId === 'submit-section' ? 'active' : ''}`}
              onClick={() => scrollToSection('submit-section')}
            >
              <CornerDownRight size={16} /> SUBMIT
            </button>
          </div>
        </aside>

        {/* Right Main Scrollable Form Content */}
        <div className="rcaa-form-main-content">
          <form onSubmit={handleSubmit}>

            {/* SECTION 1: CLEARANCE REQUEST */}
            <div id="clearance-request" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><FileText size={20} /></div>
                  <h3 className="rcaa-section-title">Clearance Request</h3>
                </div>
                <span className="rcaa-section-badge">Section 1 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Clearance Category</label>
                    <select
                      name="clearance_category"
                      className="form-select"
                      value={formData.clearance_category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Overflight">Overflight</option>
                      <option value="Landing & Takeoff">Landing & Takeoff</option>
                      <option value="Technical Stop">Technical Stop</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clearance type</label>
                    <select
                      name="clearance_type"
                      className="form-select"
                      value={formData.clearance_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Diplomatic">Diplomatic</option>
                      <option value="Cargo">Cargo</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Private">Private</option>
                      <option value="Military">Military</option>
                    </select>
                  </div>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Aircraft Callsign</label>
                    <input
                      type="text"
                      name="aircraft_callsign"
                      className="form-input"
                      placeholder="e.g. RWB302, ETH884..."
                      value={formData.aircraft_callsign}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pilot in Command</label>
                    <input
                      type="text"
                      name="pilot_in_command"
                      className="form-input"
                      placeholder="Pilot Name..."
                      value={formData.pilot_in_command}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">First Officer</label>
                    <input
                      type="text"
                      name="first_officer"
                      className="form-input"
                      placeholder="First Officer Name..."
                      value={formData.first_officer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="section-flow-footer">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Start of application</span>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('payment-mode')}
                >
                  Next: Payment Mode <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 2: PAYMENT MODE */}
            <div id="payment-mode" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><CreditCard size={20} /></div>
                  <h3 className="rcaa-section-title">Payment Mode</h3>
                </div>
                <span className="rcaa-section-badge">Section 2 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Preferred Payment Mode / Channel</label>
                  <select
                    name="payment_mode"
                    className="form-select"
                    value={formData.payment_mode || 'Credit Card'}
                    onChange={handleInputChange}
                  >
                    <option value="Credit Card">Credit Card / VISA / MasterCard</option>
                    <option value="Bank Transfer">Direct Bank Wire Transfer (RCAA Account)</option>
                    <option value="RCAA Deposit Account">Pre-paid RCAA Client Deposit Account</option>
                    <option value="Mobile Money">Rwandan IREMBO / Mobile Money</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Account / Billing Reference Number</label>
                  <input
                    type="text"
                    name="payment_account_ref"
                    className="form-input"
                    placeholder="e.g. ACC-2026-8891 or Wire Receipt Ref Code..."
                    value={formData.payment_account_ref || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', fontSize: '0.88rem', color: '#475569' }}>
                  ℹ️ <strong>RCAA Clearance Fee Policy:</strong> Statutory permit verification fees apply based on aircraft MTOW and flight category. Electronic payment receipts are generated automatically upon verification.
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('clearance-request')}
                >
                  <ArrowLeft size={14} /> Previous: Clearance Request
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('payment-billing-address')}
                >
                  Next: Payment Billing Address <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 3: PAYMENT BILLING ADDRESS */}
            <div id="payment-billing-address" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><MapPin size={20} /></div>
                  <h3 className="rcaa-section-title">Payment Billing Address</h3>
                </div>
                <span className="rcaa-section-badge">Section 3 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Billing Entity / Contact Person Name</label>
                    <input
                      type="text"
                      name="billing_name"
                      className="form-input"
                      placeholder="e.g. RwandAir Finance Dept / John Doe"
                      value={formData.billing_name || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Billing Email Address</label>
                    <input
                      type="email"
                      name="billing_email"
                      className="form-input"
                      placeholder="e.g. billing@operator.aero"
                      value={formData.billing_email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Physical Billing Address / Street</label>
                    <input
                      type="text"
                      name="billing_address"
                      className="form-input"
                      placeholder="e.g. KN 5 Rd, Kigali International Airport Area"
                      value={formData.billing_address || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City & Country</label>
                    <input
                      type="text"
                      name="billing_city_country"
                      className="form-input"
                      placeholder="e.g. Kigali, Rwanda"
                      value={formData.billing_city_country || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Identification / VAT Registration (TIN)</label>
                  <input
                    type="text"
                    name="billing_tax_id"
                    className="form-input"
                    placeholder="e.g. TIN 100982341"
                    value={formData.billing_tax_id || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('payment-mode')}
                >
                  <ArrowLeft size={14} /> Previous: Payment Mode
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('passenger')}
                >
                  Next: Passenger <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 4: PASSENGER */}
            <div id="passenger" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><Users size={20} /></div>
                  <h3 className="rcaa-section-title">Passenger</h3>
                </div>
                <span className="rcaa-section-badge">Section 4 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Passenger Count</label>
                  <input
                    type="number"
                    name="passengers_count"
                    className="form-input"
                    style={{ maxWidth: '200px' }}
                    value={formData.passengers_count}
                    onChange={handleInputChange}
                    min={0}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Passenger Manifest Summary & VIP / Crew Breakdown</label>
                  <textarea
                    name="passenger_manifest_summary"
                    className="form-textarea"
                    rows={3}
                    placeholder="List VIP passengers, key delegation members, or general crew vs passenger count details..."
                    value={formData.passenger_manifest_summary || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('payment-billing-address')}
                >
                  <ArrowLeft size={14} /> Previous: Payment Billing Address
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('flight-schedule')}
                >
                  Next: Flight Schedule <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 5: FLIGHT SCHEDULE */}
            <div id="flight-schedule" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><Calendar size={20} /></div>
                  <h3 className="rcaa-section-title">Flight Schedule</h3>
                </div>
                <span className="rcaa-section-badge">Section 5 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                    <label className="form-label">Departure Airport (ICAO/IATA)</label>
                    <input
                      type="text"
                      name="departure_airport"
                      className="form-input"
                      placeholder="e.g. HRYR / KGL or HKJK / NBO"
                      value={formData.departure_airport || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Airport (ICAO/IATA)</label>
                    <input
                      type="text"
                      name="arrival_airport"
                      className="form-input"
                      placeholder="e.g. FKKD / DLA or EGLL / LHR"
                      value={formData.arrival_airport || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cargo Details / Payload Summary</label>
                  <input
                    type="text"
                    name="cargo_details"
                    className="form-input"
                    placeholder="e.g. 15 Tons Medical Relief Supplies, Dangerous Goods Class 9, None..."
                    value={formData.cargo_details}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('passenger')}
                >
                  <ArrowLeft size={14} /> Previous: Passenger
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('stop-over')}
                >
                  Next: Stop Over <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 6: STOP OVER */}
            <div id="stop-over" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><Compass size={20} /></div>
                  <h3 className="rcaa-section-title">Stop Over</h3>
                </div>
                <span className="rcaa-section-badge">Section 6 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Stop Over Airport (ICAO/IATA Code)</label>
                  <input
                    type="text"
                    name="stopover_airport"
                    className="form-input"
                    placeholder="e.g. HRYR (Kigali Int'l Airport) / None if direct overflight"
                    value={formData.stopover_airport || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stop Over Purpose & Ground Handling Requirements</label>
                  <textarea
                    name="stopover_purpose"
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Refueling, Crew Change, Technical Maintenance, Passenger Disembarkation..."
                    value={formData.stopover_purpose || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('flight-schedule')}
                >
                  <ArrowLeft size={14} /> Previous: Flight Schedule
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('airspace-entry-exit')}
                >
                  Next: Airspace Entry & Exit <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 7: AIRSPACE ENTRY & EXIT */}
            <div id="airspace-entry-exit" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><Navigation size={20} /></div>
                  <h3 className="rcaa-section-title">Airspace Entry & Exit</h3>
                </div>
                <span className="rcaa-section-badge">Section 7 of 8</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Airspace Entry Point (FIR Fix / Waypoint)</label>
                    <input
                      type="text"
                      name="entry_point"
                      className="form-input"
                      placeholder="e.g. OKIMO, BUJ, KGL..."
                      value={formData.entry_point}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Airspace Exit Point (FIR Fix / Waypoint)</label>
                    <input
                      type="text"
                      name="exit_point"
                      className="form-input"
                      placeholder="e.g. VAKIS, NBO, EBB..."
                      value={formData.exit_point}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ATS Route & Intermediate FIR Waypoints</label>
                  <input
                    type="text"
                    name="airway_routes"
                    className="form-input"
                    placeholder="e.g. UG656 OKIMO DCT KGL UG655 VAKIS"
                    value={formData.airway_routes || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('stop-over')}
                >
                  <ArrowLeft size={14} /> Previous: Stop Over
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  onClick={() => scrollToSection('uploadables')}
                >
                  Next: Uploadables <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 8: UPLOADABLES */}
            <div id="uploadables" className="rcaa-form-section">
              <div className="rcaa-section-header">
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon"><UploadCloud size={20} /></div>
                  <h3 className="rcaa-section-title">Uploadables</h3>
                </div>
                <span className="rcaa-section-badge">Section 8 of 8</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="file-upload-box">
                  <UploadCloud size={24} style={{ color: '#0284c7', marginBottom: '0.4rem' }} />
                  <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>Certificate of Airworthiness</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF or JPG (Max 5MB)</span>
                  <input
                    type="text"
                    name="uploaded_airworthiness_cert"
                    className="form-input"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                    placeholder="Doc reference / Filename..."
                    value={formData.uploaded_airworthiness_cert || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="file-upload-box">
                  <UploadCloud size={24} style={{ color: '#0284c7', marginBottom: '0.4rem' }} />
                  <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>Air Operator Certificate (AOC)</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF or JPG (Max 5MB)</span>
                  <input
                    type="text"
                    name="uploaded_aoc_cert"
                    className="form-input"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                    placeholder="Doc reference / Filename..."
                    value={formData.uploaded_aoc_cert || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="file-upload-box">
                  <UploadCloud size={24} style={{ color: '#0284c7', marginBottom: '0.4rem' }} />
                  <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>Insurance Certificate</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF or JPG (Max 5MB)</span>
                  <input
                    type="text"
                    name="uploaded_insurance_cert"
                    className="form-input"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                    placeholder="Doc reference / Filename..."
                    value={formData.uploaded_insurance_cert || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="section-flow-footer">
                <button
                  type="button"
                  className="btn-flow-prev"
                  onClick={() => scrollToSection('airspace-entry-exit')}
                >
                  <ArrowLeft size={14} /> Previous: Airspace Entry & Exit
                </button>
                <button
                  type="button"
                  className="btn-flow-next"
                  style={{ background: '#10b981' }}
                  onClick={() => scrollToSection('submit-section')}
                >
                  Proceed to Final Submit <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* SECTION 9: SUBMIT SECTION */}
            <div id="submit-section" className="rcaa-form-section" style={{ border: '2px solid #38bdf8', background: '#f0f9ff' }}>
              <div className="rcaa-section-header" style={{ borderBottomColor: '#bae6fd' }}>
                <div className="rcaa-section-title-box">
                  <div className="rcaa-section-icon" style={{ color: '#0284c7' }}><ShieldCheck size={24} /></div>
                  <h3 className="rcaa-section-title">Application Verification & Submit</h3>
                </div>
                <span className="rcaa-section-badge" style={{ background: '#0284c7', color: '#ffffff' }}>Final Step</span>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p>
                  Please review your entries across all form sections (Clearance Request, Payment Mode, Billing, Passengers, Flight Schedule, Stopover, Airspace Entry/Exit, Uploadables) before transmitting to the Rwanda Civil Aviation Authority.
                </p>
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Operator:</strong> {formData.airline_operator || 'Not set'}</div>
                  <div><strong>Aircraft Reg:</strong> {formData.aircraft_registration || 'Not set'}</div>
                  <div><strong>Category:</strong> {formData.clearance_category} ({formData.clearance_type})</div>
                  <div><strong>Payment Mode:</strong> {formData.payment_mode}</div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn-primary-rcaa"
                  style={{ width: '100%', maxWidth: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={loading}
                >
                  <Send size={18} />
                  {loading ? 'Transmitting Application to RCAA Backend...' : 'Submit Permit Application'}
                </button>
              </div>
            </div>

          </form>
        </div>
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

