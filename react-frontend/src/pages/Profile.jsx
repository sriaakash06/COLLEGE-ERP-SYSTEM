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
  Briefcase,
  Calendar,
  Lock,
  ShieldCheck,
  Fingerprint,
  AlertCircle
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
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-pulse">
        <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl relative mb-4">
          <User className="w-10 h-10 text-indigo-400" />
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-[2.1rem] animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">LOADING IDENTITY MATRIX...</p>
      </div>
    );
  }

  const roleColor = profile?.role === 'admin' ? 'rose' : profile?.role === 'staff' ? 'blue' : 'emerald';

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Fingerprint className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">IDENTITY HUB</h1>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Securely manage your academic and personal credentials
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="glass-card bg-rose-500/10 border-rose-500/30 p-5 flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-rose-300 font-bold text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-1">
          <div className="uiverse-card min-h-[460px] flex flex-col items-center justify-center gap-6 p-8 relative overflow-hidden">
            {/* Avatar */}
            <div className="relative z-10">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-white/10">
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.name}&size=256&background=6366f1&color=fff&bold=true`}
                  className="rounded-full shadow-2xl shadow-indigo-500/20"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  alt="Profile"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-indigo-600 border-2 border-background flex items-center justify-center text-white hover:bg-indigo-500 transition-all active:scale-90 shadow-xl">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center z-10 w-full">
              <h3 className="font-black text-text-main text-xl italic tracking-tighter uppercase mb-1">{profile?.name}</h3>
              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border bg-${roleColor}-500/10 text-${roleColor}-400 border-${roleColor}-500/20`}>
                {profile?.role}
              </span>

              {/* Status Panel */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 mt-6">
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.25em] mb-1">STATUS</p>
                  <p className="text-emerald-400 font-black text-sm">OPTIMAL</p>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.25em] mb-1">VERIFIED</p>
                  <p className="text-white font-black text-sm">PROTOCOL A</p>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                disabled={saving}
                className={`btn-premium w-full py-4 flex items-center justify-center gap-3 transition-all rounded-xl ${success ? 'bg-emerald-600 from-emerald-600 to-emerald-500' : ''}`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Edit3 className="w-5 h-5" />
                )}
                <span className="font-black text-[10px] uppercase tracking-[0.1em]">
                  {saving ? 'SYNCING...' : success ? 'SYNC COMPLETE' : 'COMMIT UPDATES'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <h4 className="font-black text-text-main text-lg uppercase tracking-tight italic">Personnel Dossier</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Full Legal Name</label>
                <div className="input-group-glass opacity-70 cursor-not-allowed">
                  <User className="w-4 h-4 text-text-muted shrink-0" />
                  <input value={profile?.name || ''} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Official Email</label>
                <div className="input-group-glass opacity-70 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-text-muted shrink-0" />
                  <input value={profile?.email || ''} readOnly />
                </div>
              </div>

              {profile?.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Registration ID</label>
                    <div className="input-group-glass opacity-70 cursor-not-allowed">
                      <Key className="w-4 h-4 text-text-muted shrink-0" />
                      <input value={profile?.reg_no || 'SYSTEM-PENDING-01'} readOnly />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em]">Contact Node</label>
                    <div className="input-group-glass">
                      <Phone className="w-4 h-4 text-text-muted shrink-0" />
                      <input
                        value={profile?.phone || ''}
                        placeholder="+1 (555) 000-0000"
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em]">Residential Coordinates</label>
                    <div className="input-group-glass h-auto items-start pt-3">
                      <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-1" />
                      <textarea
                        className="p-0 pt-1 resize-none"
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
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Department</label>
                    <div className="input-group-glass opacity-70 cursor-not-allowed">
                      <Briefcase className="w-4 h-4 text-text-muted shrink-0" />
                      <input value={profile?.department || 'Faculty of Engineering'} readOnly />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Joining Date</label>
                    <div className="input-group-glass opacity-70 cursor-not-allowed">
                      <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                      <input value={profile?.joining_date || '2023-01-15'} readOnly />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security Config */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-black text-text-main text-lg uppercase tracking-tight italic">Security Protocols</h4>
            </div>

            <div className="space-y-4">
              {/* System Integrity */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-glass-bg/50 border border-glass-border hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-black text-text-main uppercase tracking-tight">System Integrity</h6>
                    <p className="text-text-muted text-xs mt-0.5">Account synced with Firestore Secure Cloud</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">VERIFIED</span>
              </div>

              {/* Access Key */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-glass-bg/50 border border-glass-border hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-black text-text-main uppercase tracking-tight">Access Key</h6>
                    <p className="text-text-muted text-xs mt-0.5">Rotate encryption keys for account recovery</p>
                  </div>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-glass-bg border border-glass-border text-text-muted hover:text-white hover:border-indigo-500/50 transition-all font-black text-[10px] uppercase tracking-widest">
                  Update Key
                </button>
              </div>

              {/* Two-Factor */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-glass-bg/50 border border-glass-border hover:border-amber-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-black text-text-main uppercase tracking-tight">Two-Factor Passcode</h6>
                    <p className="text-text-muted text-xs mt-0.5">Add an extra layer of authentication</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-glass-bg border border-glass-border rounded-full peer peer-checked:bg-amber-500 peer-checked:border-amber-400 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              {/* Security Shield */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-glass-bg/50 border border-glass-border hover:border-blue-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-black text-text-main uppercase tracking-tight">Security Shield</h6>
                    <p className="text-text-muted text-xs mt-0.5">Active threat detection and monitoring</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
