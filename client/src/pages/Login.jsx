import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login({ setAuth }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('faculty');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotRole, setForgotRole] = useState('faculty');
  const [forgotStaffId, setForgotStaffId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: forgotStaffId,
          email: forgotEmail,
          role: forgotRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP code');

      setForgotMessage(data.otp ? `${data.message} (Your OTP: ${data.otp})` : data.message);
      if (data.otp) {
        setOtpCode(data.otp);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (newPassword !== confirmPassword) {
      setForgotError('New passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: forgotStaffId,
          otp: otpCode,
          newPassword,
          role: forgotRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      alert('Password successfully reset! You can now sign in with your new password.');
      setShowForgotModal(false);
      setUsername(forgotStaffId);
      setPassword(newPassword);
      setRole(forgotRole);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    const errs = {};
    if (!username || !username.trim()) errs.username = 'Staff User ID is required';
    if (!password) errs.password = 'Password is required';
    
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || 'Authentication failed';
        setFieldErrors({ username: msg, password: msg });
        throw new Error(msg);
      }

      // Save to localStorage
      localStorage.setItem('srec_token', data.token);
      localStorage.setItem('srec_role', data.role);
      localStorage.setItem('srec_staffId', data.staffId);
      localStorage.setItem('srec_name', data.name || data.staffId);
      if (data.file) {
        localStorage.setItem('srec_profilePic', data.file);
      } else {
        localStorage.removeItem('srec_profilePic');
      }
      if (data.department) {
        localStorage.setItem('srec_dept', data.department);
      }
      if (data.designation) {
        localStorage.setItem('srec_designation', data.designation);
      }
      if (data.isHod !== undefined) {
        localStorage.setItem('srec_isHod', data.isHod ? 'true' : 'false');
      }
      if (data.isInstitutionalAdmin !== undefined) {
        localStorage.setItem('srec_isInst', data.isInstitutionalAdmin ? 'true' : 'false');
      }
      if (data.isSupervisorEligible !== undefined) {
        localStorage.setItem('srec_isSupervisorEligible', data.isSupervisorEligible ? 'true' : 'false');
      }
      if (data.isClubCoordinator !== undefined) {
        localStorage.setItem('srec_isClubCoord', data.isClubCoordinator ? 'true' : 'false');
        localStorage.setItem('srec_myClubs', JSON.stringify(data.myClubs || []));
      }

      setAuth({
        token: data.token,
        role: data.role,
        staffId: data.staffId,
        name: data.name || data.staffId,
        profilePic: data.file,
        department: data.department,
        designation: data.designation,
        isHod: !!data.isHod,
        isInstitutionalAdmin: !!data.isInstitutionalAdmin,
        isSupervisorEligible: !!data.isSupervisorEligible,
        isClubCoordinator: !!data.isClubCoordinator,
        myClubs: data.myClubs || []
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      backgroundImage: `linear-gradient(rgba(15, 35, 20, 0.4), rgba(15, 35, 20, 0.4)), url('/login-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        color: '#0f331f'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/logo.png" 
            alt="SREC Logo" 
            style={{ height: '70px', marginBottom: '16px', objectFit: 'contain' }}
          />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f331f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            SREC FIS <span className="version-badge-anim" style={{ fontSize: '0.85rem' }}>V3.0</span>
          </h2>
          <p style={{ color: '#4a5d52', marginTop: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
            Faculty Information System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'hsla(var(--danger), 0.15)',
            border: '1px solid hsla(var(--danger), 0.3)',
            color: 'hsl(var(--danger))',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#0f331f', fontWeight: 700 }}>Select Portal / Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ fontWeight: 600, background: '#ffffff', color: '#0f331f', borderColor: '#b5cebf' }}
            >
              <option value="faculty">Faculty Member</option>
              <option value="dept_admin">Department Admin</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#0f331f', fontWeight: 700 }}>Staff User ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Staff ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '44px', background: '#ffffff', color: '#0f331f', borderColor: fieldErrors.username ? '#dc2626' : '#b5cebf', fontWeight: 600 }}
                required
                autoFocus
              />
              <User size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#15583b'
              }} />
            </div>
            {fieldErrors.username && (
              <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                {fieldErrors.username}
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ color: '#0f331f', fontWeight: 700, margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotStaffId(username || '');
                  setForgotEmail('');
                  setOtpCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setForgotMessage('');
                  setForgotError('');
                }}
                style={{ background: 'none', border: 'none', color: '#15583b', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px', background: '#ffffff', color: '#0f331f', borderColor: fieldErrors.password ? '#dc2626' : '#b5cebf', fontWeight: 600 }}
                required
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#15583b'
              }} />
            </div>
            {fieldErrors.password && (
              <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', fontWeight: 700, marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', background: '#ffffff', color: '#0f331f' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', color: '#0f331f' }}>
              {forgotStep === 1 ? 'Reset Account Password' : 'Verify OTP & Set New Password'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4a5d52', marginBottom: '20px' }}>
              {forgotStep === 1 
                ? 'Enter your Staff ID and registered email address to receive a 6-digit OTP code.' 
                : `Verification code sent for ${forgotStaffId}. Enter the 6-digit OTP code to reset your password.`}
            </p>

            {forgotMessage && (
              <div style={{ padding: '10px 14px', background: 'hsla(var(--success), 0.15)', border: '1px solid hsla(var(--success), 0.3)', color: 'hsl(var(--success))', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div style={{ padding: '10px 14px', background: 'hsla(var(--danger), 0.15)', border: '1px solid hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Portal / Role</label>
                  <select
                    className="form-control"
                    value={forgotRole}
                    onChange={(e) => setForgotRole(e.target.value)}
                  >
                    <option value="faculty">Faculty Member</option>
                    <option value="dept_admin">Department Admin</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Staff User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SREC1024 or TE2273"
                    value={forgotStaffId}
                    onChange={(e) => setForgotStaffId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Registered Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. user@srec.ac.in"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>6-Digit OTP Verification Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? 'Resetting Password...' : 'Reset & Save Password'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setForgotStep(1)}>
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
