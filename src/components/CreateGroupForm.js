// src/components/CreateGroupForm.js
// Multi-field form for creating a new chit group with all necessary details

import React, { useState, useEffect } from 'react';

// Added 'initial' prop to allow initializing from a duplicated group or for edit/create
export default function CreateGroupForm({ onCreate, onCancel, initial = null }) {
  // --- New State for Chit Type and Commission ---
  // BUGFIX: We no longer use a copy of the initial object to avoid reference issues
  // Instead, we extract primitive values directly in the useEffect
  
  // Initialize state with defaults (will be updated in useEffect if initial prop exists)
  const [chitType, setChitType] = useState('constant');
  const [commissionPercent, setCommissionPercent] = useState(5);
  const [lumpsum, setLumpsum] = useState('');
  const [months, setMonths] = useState(12);
  // Manual schedules: always reflect current months value, start empty for duplicates
  const [manualPayinSchedule, setManualPayinSchedule] = useState([]);
  const [manualPayoutSchedule, setManualPayoutSchedule] = useState([]);
  
  // Payment buckets for variable chit type
  const [beforeWinning, setBeforeWinning] = useState('');
  const [winningMonth, setWinningMonth] = useState('');
  const [afterWinning, setAfterWinning] = useState('');

  // --- Form fields ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startMonth, setStartMonth] = useState(''); // YYYY-MM
  const [dueDay, setDueDay] = useState(''); // 1-28 (day of month)
  const [error, setError] = useState('');

  // --- Robust state initialization and syncing for all flows (create, edit, duplicate) ---
  // This single effect ensures all state is always in sync, with no race conditions.
  useEffect(() => {
    if (!initial) return; // Only run on initial prop change or first mount with initial
    
    // CRITICAL BUGFIX: Don't use the safeInitial object at all - it might still maintain references
    // Instead, extract only the primitive values we need directly from the initial prop
    // This completely isolates the form state from the original object
    
    // Extract primitive values directly (no references)
    const extractedChitType = String(initial.chitType || 'constant');
    const extractedMonths = Number(initial.months || 12);
    const extractedLumpsum = String(initial.lumpsum || '');
    const extractedDescription = String(initial.description || '');
    const extractedStartMonth = String(initial.startMonth || '');
    const extractedDueDay = String(initial.dueDay || '');
    const extractedCommissionPercent = Number(initial.commissionPercent || 5);
    
    // For name, we need to be extra careful - never modify the original
    // The duplicate will already have (Copy) suffix from GroupDetails.handleDuplicate
    const extractedName = String(initial.name || '').trim();
    
    // Set all form fields using our extracted primitive values
    setChitType(extractedChitType);
    setCommissionPercent(extractedCommissionPercent);
    setLumpsum(extractedLumpsum);
    setMonths(extractedMonths);
    setName(extractedName);
    setDescription(extractedDescription);
    setStartMonth(extractedStartMonth);
    setDueDay(extractedDueDay);
    
    // For nested objects like payment buckets, extract primitive values only
    if (initial.paymentBuckets) {
      // Extract as primitives, not as references
      const beforeWinningValue = String(initial.paymentBuckets.beforeWinning || '');
      const winningMonthValue = String(initial.paymentBuckets.winningMonth || beforeWinningValue || '');
      const afterWinningValue = String(initial.paymentBuckets.afterWinning || beforeWinningValue || '');
      
      // Set state with these primitive values
      setBeforeWinning(beforeWinningValue);
      setWinningMonth(winningMonthValue);
      setAfterWinning(afterWinningValue);
    } else {
      // Reset to defaults if no payment buckets
      setBeforeWinning('');
      setWinningMonth('');
      setAfterWinning('');
    }
  }, [initial]);
  
  // Separate effect to handle manual schedules when months or chitType changes
  useEffect(() => {
    if (chitType !== 'constant') return;
    const mm = Number(months) || 12;
    const ls = String(lumpsum) || '0';

    // Initialize manual payout schedule: use initial values or default lumpsum
    const initPayout = initial?.manualPayoutSchedule?.map(String) || [];
    const payoutSchedule = Array.from({ length: mm }, (_, i) => initPayout[i] || ls);
    setManualPayoutSchedule(payoutSchedule);

    // Initialize manual pay-in schedule: use initial values or blank
    const initPayin = initial?.manualPayinSchedule?.map(String) || [];
    const payinSchedule = Array.from({ length: mm }, (_, i) => initPayin[i] || '');
    setManualPayinSchedule(payinSchedule);
  }, [chitType, initial, months]);
  
  // Update payout schedule when lumpsum changes to keep them in sync
  // This is a controlled re-render to ensure the UI shows the current lumpsum value
  useEffect(() => {
    if (chitType !== 'constant') return;
    
    const ls = String(lumpsum) || '0';
    // Lumpsum changed, updating payout values
    
    // Force a re-render by creating a new array with the same values
    // This triggers the render to use the current lumpsum value for empty fields
    setManualPayoutSchedule(prev => [...prev]);
  }, [lumpsum, chitType]);
  
  // Initialize payout values as soon as the form loads
  // This ensures we don't need to reselect the constant option to see values
  useEffect(() => {
    if (chitType === 'constant' && !initial) {
      const mm = Number(months) || 12;
      const ls = String(lumpsum) || '0';
      
      // Initialize with empty strings to display lumpsum value
      setManualPayoutSchedule(Array.from({ length: mm }, () => ''));
    }
  }, []);

  // --- Keep payment bucket fields in sync if chitType changes (for variable chits) ---
  useEffect(() => {
    if (chitType !== 'variable') return;
    // Ensure payment buckets are not out of sync
    if (!winningMonth && beforeWinning) setWinningMonth(beforeWinning);
    if (!afterWinning && beforeWinning) setAfterWinning(beforeWinning);
  }, [chitType, beforeWinning, winningMonth, afterWinning]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Basic validation checks
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    
    const numMonths = Number(months) || 0;
    if (!numMonths || numMonths < 2) {
      setError('Number of months must be at least 2.');
      return;
    }
    
    const numLumpsum = Number(lumpsum);
    if (isNaN(numLumpsum) || numLumpsum <= 0) {
      setError('Lumpsum value must be a positive number.');
      return;
    }
    
    if (!startMonth || typeof startMonth !== 'string' || !/^\d{4}-\d{2}$/.test(startMonth)) {
      setError('Start month is required and must be in YYYY-MM format.');
      return;
    }
    
    const numDueDay = Number(dueDay);
    if (isNaN(numDueDay) || numDueDay < 1 || numDueDay > 28) {
      setError('Monthly due day is required and must be a number between 1 and 28.');
      return;
    }
    
    // --- Chit type specific validations ---
    const maxAmount = 1e8; // ₹1,00,00,000
    
    // For constant chit type - validate manual schedules
    let safeManualPayinSchedule;
    let safeManualPayoutSchedule;
    let safePaymentBuckets;
    
    if (chitType === 'constant') {
      // FIXED: Make sure manualPayinSchedule and manualPayoutSchedule are arrays
      const currentPayinSchedule = Array.isArray(manualPayinSchedule) ? manualPayinSchedule : [];
      const currentPayoutSchedule = Array.isArray(manualPayoutSchedule) ? manualPayoutSchedule : [];
      
      // Only validate the first [months] entries
      for (let i = 0; i < numMonths; i++) {
        // Make sure we have a valid pay-in amount for each month
        if (!currentPayinSchedule[i] || currentPayinSchedule[i] === '' || isNaN(Number(currentPayinSchedule[i]))) {
          setError(`Please enter a valid pay-in amount for month ${i+1}.`);
          return;
        }
        
        // Check pay-in amount ranges
        const payinAmount = Number(currentPayinSchedule[i]);
        if (payinAmount < 1 || payinAmount > maxAmount) {
          setError(`Pay-in amount for month ${i+1} must be between ₹1 and ₹1,00,00,000.`);
          return;
        }
        
        // Make sure we have a valid payout amount for each month
        if (!currentPayoutSchedule[i] || currentPayoutSchedule[i] === '' || isNaN(Number(currentPayoutSchedule[i]))) {
          // Default to lumpsum if not valid
          currentPayoutSchedule[i] = String(numLumpsum);
        }
        
        // Check payout amount ranges
        // If the value is empty or 0, use lumpsum instead
        let payoutValue = currentPayoutSchedule[i]; // Use let instead of var to avoid redeclaration
        if (!payoutValue || payoutValue === '' || payoutValue === '0') {
          payoutValue = String(numLumpsum);
          // Also update the array so it's consistent
          currentPayoutSchedule[i] = payoutValue;
        }

        // Processing payout schedule
        const payoutAmount = Number(String(payoutValue).replace(/,/g, '').trim());
        if (payoutAmount < 1 || payoutAmount > maxAmount) {
          setError(`Payout amount for month ${i+1} must be between ₹1 and ₹1,00,00,000.`);
          return;
        }
      }
      
      // Create safe versions with proper type conversion
      safeManualPayinSchedule = currentPayinSchedule.slice(0, numMonths).map(val => Number(val) || 0);
      safeManualPayoutSchedule = currentPayoutSchedule.slice(0, numMonths).map(val => {
        return (val !== undefined && val !== '' && !isNaN(Number(val))) ? Number(val) : numLumpsum;
      });
      
      // For constant type, only include afterWinning in payment buckets if it's a valid number
      safePaymentBuckets = {};
      if (afterWinning && !isNaN(Number(afterWinning))) {
        safePaymentBuckets.afterWinning = Number(afterWinning);
      }
    } else {
      // For variable chit type - validate commission and payment buckets
      const numCommission = Number(commissionPercent);
      if (isNaN(numCommission) || numCommission < 0 || numCommission > 100) {
        setError('Commission percent must be between 0 and 100.');
        return;
      }
      
      // Create safe payment buckets for variable type
      safePaymentBuckets = {};
      if (beforeWinning && !isNaN(Number(beforeWinning))) {
        safePaymentBuckets.beforeWinning = Number(beforeWinning);
      } else {
        safePaymentBuckets.beforeWinning = numLumpsum;
      }
      
      if (winningMonth && !isNaN(Number(winningMonth))) {
        safePaymentBuckets.winningMonth = Number(winningMonth);
      } else {
        safePaymentBuckets.winningMonth = safePaymentBuckets.beforeWinning;
      }
      
      if (afterWinning && !isNaN(Number(afterWinning))) {
        safePaymentBuckets.afterWinning = Number(afterWinning);
      }
    }
    
    // --- Create the final group object ---
    const newGroup = {
      name: name.trim(),
      description: description.trim(),
      months: numMonths,
      lumpsum: numLumpsum,
      startMonth,
      dueDay: numDueDay,
      chitType,
      paymentBuckets: safePaymentBuckets,
    };
    
    // Add type-specific properties
    if (chitType === 'constant') {
      newGroup.manualPayinSchedule = safeManualPayinSchedule;
      newGroup.manualPayoutSchedule = safeManualPayoutSchedule;
    } else {
      newGroup.commissionPercent = Number(commissionPercent);
    }
    
    // Call parent handler with the new group
    onCreate(newGroup);
  }

  return (
    <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8, background: '#fafcff', maxWidth: 400, margin: 'auto' }}>
      <h2>Create New Chit Group</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Group Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Number of Months:</label><br />
          <input type="number" value={months} min={2} max={60} onChange={e => setMonths(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Lumpsum Value (₹):</label><br />
          <input type="number" value={lumpsum} onChange={e => setLumpsum(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Start Month (Month name, Year):</label><br />
          {/* Use month picker for clarity. Value is always YYYY-MM, but label clarifies display format. */}
          <input
            type="month"
            value={startMonth}
            onChange={e => setStartMonth(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Monthly Due Day:</label><br />
          {/* Dropdown for due day (1-28) */}
          <select value={dueDay} onChange={e => setDueDay(e.target.value)} style={{ width: '100%', padding: 8 }} required>
            <option value="">Select Day</option>
            {[...Array(28)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
        {/* Payment Buckets Section: New fields for member payment rules */}

        {/* Chit Type Selector and Schedules - moved here */}
        <div style={{ marginBottom: 12 }}>
          <label><strong>Chit Type:</strong></label><br />
          <select value={chitType} onChange={e => setChitType(e.target.value)} style={{ width: '100%', padding: 8 }}>
            <option value="constant">Constant Payout</option>
            <option value="variable">Variable Payout</option>
          </select>
          <div style={{ fontSize: '0.92em', color: '#555', marginTop: 4 }}>
            <em>
              <b>Constant:</b> Winner gets the same amount every month. Pay-in schedule must be entered manually.<br />
              <b>Variable:</b> Winner payout increases by 1% each month (commission applies).
            </em>
          </div>
        </div>
        
        {/* Variable Payout: Show all payment bucket fields */}
        {chitType === 'variable' && (
          <div style={{ marginBottom: 12, padding: '10px', background: '#f9f9f9', borderRadius: 6 }}>
            <label><strong>Member Payment Amounts (per month)</strong></label>
            <div style={{ marginTop: 8 }}>
              <label>Before Winning Month:</label><br />
              <input
                type="number"
                value={beforeWinning}
                onChange={e => setBeforeWinning(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                placeholder="e.g. 1000"
                required
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <label>In Winning Month:</label><br />
              <input
                type="number"
                value={winningMonth}
                onChange={e => setWinningMonth(e.target.value)}
                style={{ width: '100%', padding: 8 }}
                placeholder="e.g. 1000"
              />
            </div>
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

        {/* After Winning Month field for Constant Payout Type */}
        {chitType === 'constant' && (
          <div style={{ marginBottom: 12, padding: '10px', background: '#f9f9f9', borderRadius: 6 }}>
            <label><strong>Member Payment After Winning</strong></label>
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

        {/* Manual Pay-in and Payout Schedule for Constant Chit Type */}
        {chitType === 'constant' && (
          <div style={{ marginBottom: 16, padding: '10px', background: '#f9f9f9', borderRadius: 6 }}>
            <label><strong>Manual Pay-in & Payout Schedule</strong></label>
            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: 4 }}>Month</th>
                  <th style={{ border: '1px solid #ccc', padding: 4 }}>Pay-in Amount (₹)</th>
                  <th style={{ border: '1px solid #ccc', padding: 4 }}>Payout Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length: Number(months) || 12}, (_, idx) => idx).map(idx => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: 4 }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: 4 }}>
                      <input
                        type="number"
                        value={manualPayinSchedule[idx] || ''}
                        onChange={e => {
                          const updated = [...manualPayinSchedule];
                          while (updated.length <= idx) {
                            updated.push('');
                          }
                          updated[idx] = e.target.value;
                          setManualPayinSchedule(updated);
                        }}
                        style={{ width: '100%', padding: 6 }}
                        required
                      />
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 4 }}>
                      <input
                        type="number"
                        value={manualPayoutSchedule[idx] && manualPayoutSchedule[idx] !== '' ? manualPayoutSchedule[idx] : String(lumpsum)}
                        onChange={e => {
                          const updated = [...manualPayoutSchedule];
                          // Ensure array is long enough
                          while (updated.length <= idx) updated.push('');
                          // Only store non-empty values that differ from lumpsum
                          const newValue = e.target.value;
                          updated[idx] = newValue === String(lumpsum) ? '' : newValue;
                          setManualPayoutSchedule(updated);
                        }}
                        style={{ width: '100%', padding: 6 }}
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '0.92em', color: '#555', marginTop: 6 }}>
              <em>Enter the pay-in (what each member pays) and payout (what the winner receives) for each month. These will be used as the schedule for this group.</em>
            </div>
          </div>
        )}

        {/* End moved section */}

        <div style={{ marginBottom: 12 }}>
          <label>Description (optional):</label><br />
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

        <button type="submit" style={{ padding: '8px 16px', marginRight: 8 }}>Create</button>
        <button type="button" onClick={onCancel} style={{ padding: '8px 16px' }}>Cancel</button>
      </form>
    </div>
  );
}
