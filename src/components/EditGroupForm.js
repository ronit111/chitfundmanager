// src/components/EditGroupForm.js
// Form for editing an existing chit group, reusing CreateGroupForm logic

import React, { useState, useEffect } from 'react';

// EditGroupForm allows editing of chit group details
// If payments have started, months and lumpsum fields are disabled for data integrity
export default function EditGroupForm({ initial, onSave, onCancel, payments = [] }) {
  // Chit type state for controlled selection
  const [chitType, setChitType] = useState(
    initial.chitType
      ? initial.chitType
      : (initial.paymentBuckets ? 'variable' : 'constant')
  );
  // Defensive: Always strip any trailing ' (Copy)' from the name when editing, so the original is never mutated
  let cleanInitialName = initial.name || '';
  if (cleanInitialName.endsWith(' (Copy)')) {
    cleanInitialName = cleanInitialName.slice(0, -7);
  }
  const [name, setName] = useState(cleanInitialName);
  const [months, setMonths] = useState(initial.months || 12);
  const [lumpsum, setLumpsum] = useState(initial.lumpsum || 0);
  const [description, setDescription] = useState(initial.description || '');
  // Always store startMonth as a string in YYYY-MM format for input type="month"
  const [startMonth, setStartMonth] = useState(initial.startMonth || '');
  const [dueDay, setDueDay] = useState(initial.dueDay || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Payment buckets state, prefill from initial if present
  const [beforeWinning, setBeforeWinning] = useState(initial.paymentBuckets?.beforeWinning || '');
  const [winningMonth, setWinningMonth] = useState(initial.paymentBuckets?.winningMonth || initial.paymentBuckets?.beforeWinning || '');
  const [afterWinning, setAfterWinning] = useState(initial.paymentBuckets?.afterWinning || initial.paymentBuckets?.beforeWinning || '');
  
  // Manual pay-in and payout schedules (for constant chitType)
  const [manualPayinSchedule, setManualPayinSchedule] = useState([]);
  const [manualPayoutSchedule, setManualPayoutSchedule] = useState([]);
  
  // Initialize and update schedules when months or chitType changes
  useEffect(() => {
    if (chitType !== 'constant') return;
    const mm = Number(months) || 12;
    const ls = String(lumpsum) || '0';
    // Pay-in: initial or blank
    const initPayin = Array.isArray(initial.manualPayinSchedule)
      ? initial.manualPayinSchedule.map(String)
      : [];
    setManualPayinSchedule(Array.from({ length: mm }, (_, i) => initPayin[i] ?? ''));
    // Payout: initial or lumpsum
    const initPayout = Array.isArray(initial.manualPayoutSchedule)
      ? initial.manualPayoutSchedule.map(String)
      : [];
    setManualPayoutSchedule(Array.from({ length: mm }, (_, i) => initPayout[i] ?? ls));
  }, [chitType, initial, months]);
  
  // Update payout schedule when lumpsum changes to keep them in sync
  // This is a controlled re-render to ensure the UI shows the current lumpsum value
  // for any payout fields that don't have custom values
  useEffect(() => {
    if (chitType !== 'constant') return;
    
    const ls = String(lumpsum) || '0';
    // Lumpsum changed, updating payout values
    
    // Force a re-render by creating a new array with the same values
    // This triggers the render to use the current lumpsum value for empty fields
    setManualPayoutSchedule(prev => [...prev]);
  }, [lumpsum, chitType]);
  
  // Keep payment bucket fields in sync if chitType changes
  useEffect(() => {
    if (chitType === 'variable') {
      // Ensure payment buckets are not out of sync
      if (!winningMonth && beforeWinning) setWinningMonth(beforeWinning);
      if (!afterWinning && beforeWinning) setAfterWinning(beforeWinning);
    }
  }, [chitType, beforeWinning, winningMonth, afterWinning]);

  // If payments exist, restrict editing of certain fields
  const paymentsStarted = payments && payments.length > 0;

  // Handler for form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    // Validation: months and lumpsum must be filled
    if (!months || !lumpsum) {
      setError('Please enter both months and lumpsum to save this group.');
      setSaving(false);
      return;
    }
    try {
      if (!startMonth) {
        setError('Start month is required.');
        setSaving(false);
        return;
      }
      if (!dueDay) {
        setError('Monthly due day is required.');
        setSaving(false);
        return;
      }
      // Defensive: Check for missing entries in pay-in and payout schedules
      if (chitType === 'constant') {
        const n = Number(months) || 0;
        if (!manualPayinSchedule || manualPayinSchedule.length < n || manualPayinSchedule.slice(0, n).some(val => val === '' || isNaN(Number(val)))) {
          setError('Please enter all pay-in amounts for each month.');
          setSaving(false);
          return;
        }
        if (!manualPayoutSchedule || manualPayoutSchedule.length < n || manualPayoutSchedule.slice(0, n).some(val => val === '' || isNaN(Number(val)))) {
          setError('Please enter all payout amounts for each month.');
          setSaving(false);
          return;
        }
      }
      // Pay-in schedule is valid - convert all strings to numbers before saving
      const safeManualPayinSchedule = chitType === 'constant' && manualPayinSchedule 
        ? manualPayinSchedule.map(val => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
          })
        : undefined;

      // Payout schedule is valid - convert all strings to numbers before saving
      // undefined/empty slots default to the lumpsum value
      const safeManualPayoutSchedule = chitType === 'constant' && manualPayoutSchedule
        ? manualPayoutSchedule.map(val => {
            if (val === undefined || val === '') {
              return Number(lumpsum);
            }
            const num = Number(val);
            return isNaN(num) ? Number(lumpsum) : num;
          })
        : undefined;

      // Payment buckets handling for both variable and constant chit types
      let safePaymentBuckets;
      if (chitType === 'variable') {
        safePaymentBuckets = {};
        if (!isNaN(Number(beforeWinning))) safePaymentBuckets.beforeWinning = Number(beforeWinning);
        if (!isNaN(Number(winningMonth))) safePaymentBuckets.winningMonth = Number(winningMonth);
        if (!isNaN(Number(afterWinning))) safePaymentBuckets.afterWinning = Number(afterWinning);
      } else {
        // Constant chit type - store only afterWinning value if valid
        safePaymentBuckets = {};
        if (!isNaN(Number(afterWinning))) safePaymentBuckets.afterWinning = Number(afterWinning);
      }

      // Validate startMonth format (YYYY-MM)
      if (!startMonth || typeof startMonth !== 'string' || !/^\d{4}-\d{2}$/.test(startMonth)) {
        setError('Start month is required and must be in YYYY-MM format.');
        return;
      }
      // Prepare update payload
      const updateData = {
        name: name || '',
        months: Number(months) || 0,
        lumpsum: Number(lumpsum) || 0,
        description: description || '',
        startMonth: startMonth.trim(),
        dueDay: dueDay ? Number(dueDay) : '',
        chitType: chitType || 'constant',
        manualPayinSchedule: safeManualPayinSchedule,
        manualPayoutSchedule: safeManualPayoutSchedule,
        paymentBuckets: safePaymentBuckets
      };
      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      // Updating group in Firestore
      try {
        await onSave(updateData);
      } catch (err) {
        setError('Failed to save changes: ' + (err && err.message ? err.message : err));
        return;
      }
    } catch (err) {
      setError('Failed to save changes.');
    }
    setSaving(false);
  }

  return (
    <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8, background: '#fafcff', maxWidth: 400, margin: 'auto' }}>
      <h2>Edit Chit Group</h2>
      {/* Chit Type Selection: Only allow changing if payments have not started */}
      <div style={{ marginBottom: 12 }}>
        <label>Chit Type:</label><br />
        <select 
          value={chitType} 
          onChange={e => { if (!paymentsStarted) setChitType(e.target.value); }} 
          style={{ width: '100%', padding: 8 }} 
          disabled={paymentsStarted}
        >
          <option value="constant">Constant (same payout every month)</option>
          <option value="variable">Variable (payout changes every month)</option>
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Show restriction message if payments have started */}
        {paymentsStarted && (
          <div style={{ color: 'orange', marginBottom: 12 }}>
            <strong>Note:</strong> Payments have already started for this group. <br />
            <span>Number of Months and Lumpsum Value cannot be changed.</span>
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Group Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Number of Months:</label><br />
          <input type="number" value={months} min={2} max={60} onChange={e => setMonths(e.target.value)} style={{ width: '100%', padding: 8 }} disabled={paymentsStarted} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Lumpsum Value (₹):</label><br />
          <input type="number" value={lumpsum} onChange={e => setLumpsum(e.target.value)} style={{ width: '100%', padding: 8 }} disabled={paymentsStarted} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Start Month (Month name, Year):</label><br />
          {/* Use month picker for clarity. Value is always YYYY-MM, but label clarifies display format. */}
          <input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} style={{ width: '100%', padding: 8 }} required disabled={paymentsStarted} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Monthly Due Day:</label><br />
          {/* Dropdown for due day (1-28) */}
          <select value={dueDay} onChange={e => setDueDay(e.target.value)} style={{ width: '100%', padding: 8 }} required disabled={paymentsStarted}>
            <option value="">Select Day</option>
            {[...Array(28)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
        {/* Payment Buckets Section: Only for variable chit type */}
        {chitType === 'variable' && (
          <div style={{ marginBottom: 12, padding: '10px', background: '#f9f9f9', borderRadius: 6 }}>
            <label><strong>Member Payment Amounts</strong></label>
            <div style={{ marginTop: 8 }}>
              <label>Before Winning Month:</label><br />
              <input
                type="number"
                value={beforeWinning}
                onChange={e => setBeforeWinning(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <label>In Winning Month:</label><br />
              <input
                type="number"
                value={winningMonth}
                onChange={e => setWinningMonth(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <label>After Winning Month:</label><br />
              <input
                type="number"
                value={afterWinning}
                onChange={e => setAfterWinning(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ fontSize: '0.92em', color: '#555', marginTop: 6 }}>
              <em>These amounts determine how much each member pays before, during, and after their winning month.</em>
            </div>
          </div>
        )}
        
        {/* After Winning Payment for Constant Chit Type */}
        {chitType === 'constant' && (
          <div style={{ marginBottom: 12, padding: '10px', background: '#f9f9f9', borderRadius: 6 }}>
            <label><strong>After Winning Payment</strong></label>
            <div style={{ marginTop: 8 }}>
              <label>After Winning Month:</label><br />
              <input
                type="number"
                value={afterWinning}
                onChange={e => setAfterWinning(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                placeholder="e.g. 1000"
              />
            </div>
            <div style={{ fontSize: '0.92em', color: '#555', marginTop: 6 }}>
              <em>This amount controls how much a member pays after winning. Before winning, use the manual payment schedule below.</em>
            </div>
          </div>
        )}
        {/* Manual Pay-in/Payout Schedules: Only for constant chit type */}
        {chitType === 'constant' && (
          <div style={{ marginBottom: 12, padding: '10px', background: '#f1f7fa', borderRadius: 6 }}>
            <label><strong>Manual Pay-in & Payout Schedules (per month)</strong></label>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label>Pay-in Amounts:</label>
                {Array.from({length: Number(months) || 12}, (_, idx) => manualPayinSchedule[idx] || '').map((val, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, marginRight: 4 }}>Month {idx + 1}:</span>
                    <input
                      type="number"
                      value={val}
                      min={0}
                      onChange={e => {
                        // Create a copy that's at least as long as needed
                        const updated = [...manualPayinSchedule];
                        // Ensure the array is long enough
                        while (updated.length <= idx) {
                          updated.push('');
                        }
                        updated[idx] = e.target.value;
                        setManualPayinSchedule(updated);
                      }}
                      style={{ width: 80, padding: 4 }}
                      disabled={paymentsStarted}
                    />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <label>Payout Amounts:</label>
                {Array.from({length: Number(months) || 12}, (_, idx) => idx).map(idx => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, marginRight: 4 }}>Month {idx + 1}:</span>
                    <input
                      type="number"
                      // For constant chittype, always show the current lumpsum value
                      value={String(lumpsum)}
                      min={0}
                      readOnly={true}
                      style={{ width: 80, padding: 4, backgroundColor: '#f0f0f0' }}
                      disabled={paymentsStarted}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '0.92em', color: '#555', marginTop: 6 }}>
              <em>These amounts control how much each member pays in and receives out each month. Editing is disabled after payments start.</em>
            </div>
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Description (optional):</label><br />
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ padding: '8px 16px', marginRight: 8 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={{ padding: '8px 16px' }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
