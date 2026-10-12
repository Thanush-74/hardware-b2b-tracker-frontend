// Login.jsx — The login page
// Handles email + password submission and stores the session

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form field state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    // Prevent the form from reloading the page
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call POST /api/auth/login
      const result = await loginUser(email, password);

      // result.data contains: { token, user, permissions, screens }
      login(result.data);

      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Show the error message from the backend (e.g. "Invalid email or password")
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand logo */}
        <div className="login-logo">
          <h1>Titan<span>Core</span></h1>
          <p>Hardware B2B Supply Tracker</p>
        </div>

        <h2>Sign in to your account</h2>

        {/* Show error message if login failed */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          TitanCore &copy; {new Date().getFullYear()} — All rights reserved
        </div>
      </div>
    </div>
  );
}

export default Login;
