import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginGoogle, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      await login(email, password);
      navigate('/user');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMsg);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginGoogle();
      navigate('/user');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <>
      {/* Welcome Heading */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-3">Welcome Back</h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Enter your email and password to access your account
        </p>
      </div>

      {/* Error Message */}
      {(error || authError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error || authError}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mb-4 sm:mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-black hover:text-slate-700 font-semibold transition"
          >
            Forgot Password
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base mb-4 ${loading
            ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
            : 'bg-black text-white hover:bg-slate-900'
            }`}
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2 sm:gap-3 my-4 sm:my-6">
        <div className="flex-grow h-px bg-slate-200"></div>
        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Or continue with</span>
        <div className="flex-grow h-px bg-slate-200"></div>
      </div>

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm sm:text-base"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
        </svg>
        Google
      </button>

      {/* Toggle to Sign Up */}
      <p className="text-center text-slate-600 text-xs sm:text-sm mt-4 sm:mt-6">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-black hover:text-slate-700 transition"
        >
          Sign Up
        </Link>
      </p>

      {/* Footer Text */}
      <p className="text-center text-xs text-slate-500 mt-6 sm:mt-8">
        By signing in, you agree to our <br />
        <Link to="/terms-of-service" className="text-slate-600 hover:text-slate-800 transition-colors">Terms of Service</Link> and{' '}
        <Link to="/privacy-policy" className="text-slate-600 hover:text-slate-800 transition-colors">Privacy Policy</Link>
      </p>
    </>
  );
}
