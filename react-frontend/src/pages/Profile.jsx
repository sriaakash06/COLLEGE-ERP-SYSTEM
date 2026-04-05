import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  CreditCard,
  Briefcase,
  Calendar,
  Lock,
  LogOut
} from 'lucide-react';

const Profile = ({ currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Priority: Try Firestore first for modern ERP data
        if (currentUser?.uid) {
           const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
           if (userDoc.exists()) {
              setProfile(userDoc.data());
              setLoading(false);
              return;
           }
        }

        // Fallback: Legacy API
        const response = await axios.get('/api/profile/data', {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          setProfile(response.data.profile);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Final fallback to Current User prop
        setProfile({
          name: currentUser?.name || 'User',
          email: currentUser?.email || 'user@college.edu',
          role: currentUser?.role || 'Guest',
          phone: '',
          address: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleUpdate = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      if (currentUser?.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          name: profile.name,
          phone: profile.phone || '',
          address: profile.address || '',
          lastUpdated: serverTimestamp()
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Unauthorized session');
      }
    } catch (err) {
      console.error('Update failed:', err);
      setError('Neural link synchronization failed. System write-back aborted.');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="uiverse-card w-full h-auto min-h-[450px] flex flex-col items-center justify-center gap-6 p-8 relative overflow-hidden">
            <div className="position-relative d-inline-block mb-2 z-10">
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
            
            <div className="text-center z-10 w-full">
              <h3 className="fw-bold text-white mb-2">{profile?.name}</h3>
              <p className="heading uppercase mb-4 tracking-widest">{profile?.role}</p>
              
              <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="text-left">
                  <p className="small text-secondary mb-0 uppercase text-[8px] font-black tracking-tighter">Status</p>
                  <p className="text-emerald fw-bold mb-0 text-sm">Optimal</p>
                </div>
                <div className="text-right">
                  <p className="small text-secondary mb-0 uppercase text-[8px] font-black tracking-tighter">Verified</p>
                  <p className="text-white fw-bold mb-0 text-sm">Protocol A</p>
                </div>
              </div>

              <button 
                onClick={handleUpdate}
                disabled={saving}
                className={`btn-premium w-full py-4 flex items-center justify-center gap-3 transition-all ${success ? 'bg-emerald-600' : ''}`}
              >
                {saving ? <div className="spinner-border spinner-border-sm" /> : (success ? <CheckCircle size={20} /> : <Edit3 size={18} />)}
                <span className="font-bold">{saving ? 'SYNCING...' : (success ? 'SYNC COMPLETE' : 'COMMIT UPDATES')}</span>
              </button>
            </div>
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
                      <input 
                        value={profile?.phone || ''} 
                        placeholder="+1 (555) 000-0000" 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
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
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
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

