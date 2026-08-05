import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import { User, Camera, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Dropzone from '../components/Dropzone.jsx';

export default function Settings({ auth, updateProfilePic }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const handleProfilePicUpload = async (fileObj) => {
    setMessage('');
    setError('');
    setUploadingPic(true);

    try {
      const formData = new FormData();
      formData.append('file', fileObj);

      const res = await fetch(`${API_BASE_URL}/api/activities/upload/profile-pic`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload profile picture');

      if (typeof updateProfilePic === 'function') {
        updateProfilePic(data.file);
      }
      setMessage('Profile picture updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPic(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const profilePicUrl = auth?.profilePic 
    ? `${API_BASE_URL}/uploads/upload/${auth.profilePic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}`
    : null;

  return (
    <div>
      <Navbar title="Settings & Security" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {message && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--success), 0.15)', border: '1px solid hsla(var(--success), 0.3)', color: 'hsl(var(--success))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--danger), 0.15)', border: '1px solid hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Profile Picture Management */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} style={{ color: 'hsl(var(--primary))' }} />
            Profile Picture Management
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid hsl(var(--primary))', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
              {profilePicUrl ? (
                <img src={profilePicUrl} alt={auth.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={64} style={{ color: '#94a3b8' }} />
              )}
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>{auth.name}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Staff ID: {auth.staffId}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>
              Upload New Profile Picture (JPG / PNG)
            </label>
            <Dropzone 
              onFileSelect={handleProfilePicUpload} 
              accept=".jpg,.jpeg,.png"
            />
            {uploadingPic && (
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 600, marginTop: '8px', textAlign: 'center' }}>
                Uploading profile picture...
              </p>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
            Change Account Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter current password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
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
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
