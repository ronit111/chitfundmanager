// src/components/AuthForm.js
// This component handles user login and signup

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

/**
 * AuthForm Component
 * Handles login and signup using Firebase Auth
 * Shows basic error messages and toggles between login/signup modes
 */
export default function AuthForm({ onAuth }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handles login or signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth(); // Notify parent on successful auth
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: 'auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, marginTop: 60 }}>
      <h2 style={{ textAlign: 'center' }}>{isSignup ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: 4 }}>
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button onClick={() => setIsSignup(!isSignup)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
