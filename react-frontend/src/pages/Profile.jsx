import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Key, 
  Edit3, 
  Camera, 
  CheckCircle, 
  AtSign,
  IdCard,
  CreditCard,
  Briefcase,
  Calendar,
  Lock,
  LogOut
} from 'lucide-react';

const Profile = ({ currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile/data', {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          setProfile(response.data.profile);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile details. Please try again.');
        // Fallback to basic current user
        setProfile({
          name: currentUser?.name || 'User',
          email: currentUser?.email || 'user@college.edu',
          role: currentUser?.role || 'Guest'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-glow"></div>
      </div>
    );
  }

  return (
    <div className="profile-container fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="display-5 fw-bold text-gradient-primary mb-2">Identity Hub</h1>
        <p className="text-secondary mb-0">Securely manage your academic and personal credentials</p>
      </div>

      <div className="row g-4">
        {/* Sidebar - Profile Card */}
        <div className="col-lg-4">
          <div className="glass-card p-5 text-center sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <div className="position-relative d-inline-block mb-4">
              <div className="avatar-preview-container p-2 rounded-circle glass-border">
                <img 
                  src={`https://ui-avatars.com/api/?name=${profile?.name}&size=256&background=6366f1&color=fff&bold=true`} 
                  className="rounded-circle shadow-lg" 
                  style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                  alt="Profile" 
                />
              </div>
              <button className="btn-icon-floating">
                <Camera size={14} />
              </button>
            </div>
            
            <h3 className="fw-bold text-white mb-1">{profile?.name}</h3>
            <div className="d-flex justify-content-center mb-4">
              <span className={`badge-premium text-uppercase ${profile?.role === 'admin' ? 'bg-indigo-soft text-indigo' : 'bg-purple-soft text-purple'}`}>
                <Shield size={12} className="me-1" />
                {profile?.role}
              </span>
            </div>
            
            <div className="glass-stats-grid row g-0 mb-4">
              <div className="col-6 border-end glass-border py-2">
                <p className="small text-secondary mb-0">Status</p>
                <p className="text-emerald fw-bold mb-0">Active</p>
              </div>
              <div className="col-6 py-2">
                <p className="small text-secondary mb-0">Joined</p>
                <p className="text-white fw-bold mb-0">2023</p>
              </div>
            </div>

            <button className="btn-premium w-100 py-3 mb-3">
              <Edit3 size={18} className="me-2" />
              Update Profile
            </button>
            <button className="btn-glass w-100 py-3 text-danger-soft">
              <LogOut size={18} className="me-2" />
              Logout Session
            </button>
          </div>
        </div>

        {/* Form - Details Section */}
        <div className="col-lg-8">
          {/* Personal Info */}
          <div className="glass-card p-5 mb-4">
            <div className="d-flex align-items-center mb-5">
              <div className="icon-box-sm bg-primary-soft me-3">
                <User size={20} className="text-primary" />
              </div>
              <h4 className="fw-bold text-white mb-0">Personnel Dossier</h4>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="premium-label">Full Legal Name</label>
                <div className="input-group-glass readonly">
                  <User size={18} />
                  <input value={profile?.name || ''} readOnly />
                </div>
              </div>
              <div className="col-md-6">
                <label className="premium-label">Official Email Address</label>
                <div className="input-group-glass readonly">
                  <Mail size={18} />
                  <input value={profile?.email || ''} readOnly />
                </div>
              </div>

              {profile?.role === 'student' && (
                <>
                  <div className="col-md-6">
                    <label className="premium-label">Registration Identifier</label>
                    <div className="input-group-glass readonly">
                      <IdCard size={18} />
                      <input value={profile?.reg_no || 'SYSTEM-PENDING-01'} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Secure Contact Node</label>
                    <div className="input-group-glass">
                      <Phone size={18} />
                      <input value={profile?.phone || ''} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="premium-label">Residential Coordinates</label>
                    <div className="input-group-glass h-auto">
                      <MapPin size={18} className="mt-3" />
                      <textarea 
                        className="p-3" 
                        value={profile?.address || ''} 
                        placeholder="Current residential address..."
                        rows={2}
                      />
                    </div>
                  </div>
                </>
              )}

              {profile?.role === 'staff' && (
                <>
                  <div className="col-md-6">
                    <label className="premium-label">Department Allocation</label>
                    <div className="input-group-glass readonly">
                      <Briefcase size={18} />
                      <input value={profile?.department || 'Faculty of Engineering'} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="premium-label">Joining Date</label>
                    <div className="input-group-glass readonly">
                      <Calendar size={18} />
                      <input value={profile?.joining_date || '2023-01-15'} readOnly />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security Config */}
          <div className="glass-card p-5">
            <div className="d-flex align-items-center mb-5">
              <div className="icon-box-sm bg-warning-soft me-3">
                <Shield size={20} className="text-warning" />
              </div>
              <h4 className="fw-bold text-white mb-0">Security Protocols</h4>
            </div>

            <div className="security-stacked-list">
              <div className="security-item p-4 mb-3 border-hover">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="icon-box-xs bg-success-soft me-3">
                      <CheckCircle size={16} className="text-success" />
                    </div>
                    <div>
                      <h6 className="text-white fw-bold mb-0">System Integrity</h6>
                      <p className="text-secondary extra-small mb-0">Account synced with Firestore Secure Cloud</p>
                    </div>
                  </div>
                  <span className="badge-premium bg-success-soft text-success">Verified</span>
                </div>
              </div>

              <div className="security-item p-4 mb-3 border-hover">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="icon-box-xs bg-indigo-soft me-3">
                      <Key size={16} className="text-indigo" />
                    </div>
                    <div>
                      <h6 className="text-white fw-bold mb-0">Access Key</h6>
                      <p className="text-secondary extra-small mb-0">Rotate encryption keys for account recovery</p>
                    </div>
                  </div>
                  <button className="btn-glass py-2 px-3 small">Update Key</button>
                </div>
              </div>

              <div className="security-item p-4 border-hover">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="icon-box-xs bg-amber-soft me-3">
                      <Lock size={16} className="text-amber" />
                    </div>
                    <div>
                      <h6 className="text-white fw-bold mb-0">Two-Factor Passcode</h6>
                      <p className="text-secondary extra-small mb-0">Add an extra layer of authentication</p>
                    </div>
                  </div>
                  <div className="form-toggle-glass">
                    <input type="checkbox" id="2fa-toggle" />
                    <label htmlFor="2fa-toggle"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

