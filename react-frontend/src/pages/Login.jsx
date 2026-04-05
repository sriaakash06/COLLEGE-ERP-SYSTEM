import React, { useState } from 'react';
import { signInWithGoogle, loginWithEmail } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0f18] flex items-center justify-center relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0f1117]/80 backdrop-blur-xl border border-white/5 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-[#7c5cbf] to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">EduCloud</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Command Center Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-widest font-semibold ml-1">Email</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-white/30 text-xl pointer-events-none">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="administrator@educloud.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-widest font-semibold ml-1">Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-white/30 text-xl pointer-events-none">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span>Secure Login</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-white/30 text-xs uppercase tracking-widest font-semibold">Or Override With</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google Verification</span>
        </button>
      </div>
    </div>
  );
}
