import React, { useState } from 'react';
import { ShieldCheck, Terminal, Copy, Check, Play, Server } from 'lucide-react';

export const ApiInspector: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const snippets = [
    {
      title: 'Python (requests) - Submit Permit Request',
      code: `import requests

url = "https://clever-playfulness-production-06cd.up.railway.app/api/permits/"
payload = {
    "airline_operator": "TANZANIA GOVERNMENT FLIGHT AGENCY.",
    "aircraft_registration": "5HONE",
    "has_electronic_warfare": False,
    "has_aircraft_modifications": False,
    "clearance_category": "Overflight",
    "clearance_type": "Ad-Hoc",
    "purpose_of_flight": "Automated Verification Test Flight",
    "aircraft_callsign": "TGFA01",
    "pilot_in_command": "Capt. Joseph Mukasa",
    "first_officer": "F/O Sarah Hassan",
    "entry_point": "OKIMO",
    "exit_point": "VAKIS",
    "passengers_count": 10
}

response = requests.post(url, json=payload)
data = response.json()
print("Submitted Ref:", data["reference_number"])
print("Status:", data["status"])`
    },
    {
      title: 'Python (requests) - Check Response Status by Reference Code',
      code: `import requests

reference_code = "RCAA-2026-149634"
url = f"https://clever-playfulness-production-06cd.up.railway.app/api/permits/?search={reference_code}"

res = requests.get(url).json()
if res:
    permit = res[0]
    print(f"Permit {permit['reference_number']} Status: {permit['status']}")
    print("Response Notes:", permit["response_notes"])`
    },
    {
      title: 'Playwright / Selenium Automation Selectors',
      code: `// Key Automation IDs & Form Selectors:
// Airline Operator Input:  input[name="airline_operator"]
// Tail Number Select:       select[name="aircraft_registration"]
// EW Capabilities Radio:   input[name="ew_radio"][value="Yes"]
// Clearance Category:     select[name="clearance_category"]
// Purpose of Flight:        input[name="purpose_of_flight"]
// Callsign Input:           input[name="aircraft_callsign"]
// Pilot in Command Input:   input[name="pilot_in_command"]
// Submit Button:            button[type="submit"]`
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunLiveTest = async (endpoint: string) => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`https://clever-playfulness-production-06cd.up.railway.app/api/${endpoint}`);
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(`Error reaching Django API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={28} style={{ color: '#0284c7' }} /> Automation API Console & Cheat Sheet
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Integrate your Python, Playwright, or REST scripts directly with the RCAA testing portal
        </p>
      </div>

      {/* Live API Tester Panel */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} style={{ color: '#0284c7' }} /> Live REST API Health & Endpoint Tester
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => handleRunLiveTest('permits/')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={loading}
          >
            <Play size={14} /> {loading ? 'Testing...' : 'Test GET /api/permits/'}
          </button>
          <button
            onClick={() => handleRunLiveTest('stats/')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={loading}
          >
            <Play size={14} /> {loading ? 'Testing...' : 'Test GET /api/stats/'}
          </button>
          <button
            onClick={() => handleRunLiveTest('auth/me/')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={loading}
          >
            <Play size={14} /> {loading ? 'Testing...' : 'Test GET /api/auth/me/'}
          </button>
        </div>

        {testResult && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Response Output:</div>
            <div className="json-inspector-box" style={{ maxHeight: '250px' }}>
              {testResult}
            </div>
          </div>
        )}
      </div>

      {/* Snippets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {snippets.map((snip, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={16} style={{ color: '#0284c7' }} /> {snip.title}
              </span>
              <button
                onClick={() => handleCopy(snip.code, idx)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#334155'
                }}
              >
                {copiedIndex === idx ? <Check size={14} style={{ color: '#047857' }} /> : <Copy size={14} />}
                {copiedIndex === idx ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div className="json-inspector-box">
              {snip.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
