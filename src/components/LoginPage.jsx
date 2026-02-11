/**
 * LoginPage - N4S Platform Entry Gate
 *
 * Full-page login with branded background image.
 * Form positioned to overlay the blue sign-in area in the background graphic.
 */

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, loginError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    await login(username.trim(), password);
    setSubmitting(false);
  };

  return (
    <div className="login-page">
      {/* Background image */}
      <div
        className="login-page__bg"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login-bg.png)` }}
      />

      {/* Login form card - positioned over the blue box area */}
      <div className="login-page__form-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-form__title">Sign In</h1>

          {loginError && (
            <div className="login-form__error">
              {loginError}
            </div>
          )}

          <div className="login-form__field">
            <label className="login-form__label">Username</label>
            <div className="login-form__input-wrap">
              <User size={16} className="login-form__input-icon" />
              <input
                type="text"
                className="login-form__input"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={submitting}
              />
            </div>
          </div>

          <div className="login-form__field">
            <label className="login-form__label">Password</label>
            <div className="login-form__input-wrap">
              <Lock size={16} className="login-form__input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-form__input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="login-form__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-form__submit"
            disabled={submitting || !username.trim() || !password}
          >
            {submitting ? 'Signing in…' : 'LOGIN'}
          </button>

          <div className="login-form__footer">
            <span className="login-form__brand">N4S — Not4Sale Advisory Platform</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
