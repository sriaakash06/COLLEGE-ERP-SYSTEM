import React, { useState } from 'react';
import { signInWithGoogle, loginWithEmail, signUpWithEmail } from '../firebase';

export default function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    // Front-end Validation before hitting Firebase
    if (!isLogin && username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, username.trim());
      }
      // On success, App.jsx's onAuthStateChanged will handle navigation
    } catch (err) {
      console.error("Auth Error: ", err);
      let errorMessage = "An error occurred. Please try again.";
      
      // Map Firebase errors to user-friendly messages to provide the "crt responce"
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else {
        errorMessage = err.message || `Failed to ${isLogin ? 'login' : 'sign up'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google Auth Error: ", err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f18] flex items-center justify-center relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0f1117]/80 backdrop-blur-xl border border-white/5 shadow-2xl z-10 mx-4">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-[#7c5cbf] to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1 text-center">
            {isLogin ? 'Enter your credentials to access the system' : 'Register a new account to join EduCloud'}
          </p>
        </div>

        {/* Tab switch for Sign In / Sign Up */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-[#7c5cbf] text-white shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-[#7c5cbf] text-white shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-lg mt-0.5">error</span>
            <span className="flex-1 leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2 transition-all duration-300">
              <label className="text-white/60 text-xs uppercase tracking-widest font-semibold ml-1">Username</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-white/30 text-xl pointer-events-none">person</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required={!isLogin}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium text-sm"
                />
              </div>
            </div>
          )}

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
                <span>{isLogin ? 'Sign in to account' : 'Register account'}</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-white/30 text-xs uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

