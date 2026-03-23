import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent, useEffect } from 'react';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { checkUsernameExists } from '@/src/firebase/auth';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  width: string;
}

interface UsernameValidation {
  isValid: boolean;
  message: string;
  suggestions?: string[];
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginGoogle, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Debounced username validation - triggers 800ms after user stops typing
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Don't validate if empty
    if (!username || username.length === 0) {
      setUsernameValidation(null);
      return;
    }

    // Set new timer for validation
    const timer = setTimeout(async () => {
      const validation = await validateUsername(username);
      setUsernameValidation(validation);
    }, 800); // Wait 800ms after user stops typing

    setDebounceTimer(timer);

    // Cleanup on unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [username]);

  // Validate username format and provide suggestions
  const validateUsername = async (value: string): Promise<UsernameValidation> => {
    // Check length
    if (value.length < 3) {
      return {
        isValid: false,
        message: 'Username must be at least 3 characters'
      };
    }

    if (value.length > 20) {
      return {
        isValid: false,
        message: 'Username must be 20 characters or less'
      };
    }

    // Check starting character (must be alphanumeric)
    if (!/^[a-zA-Z0-9]/.test(value)) {
      return {
        isValid: false,
        message: 'Username must start with a letter or number'
      };
    }

    // Check ending character (cannot be special chars)
    if (/[.@!#$%^&*()_+=\-[\]{};':"\\|,<>/?]$/.test(value)) {
      return {
        isValid: false,
        message: 'Username cannot end with special characters (., @, !, #, $, %, etc.)',
        suggestions: [value.slice(0, -1), value + '123', value + '_pro']
      };
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
      return {
        isValid: false,
        message: 'Username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)'
      };
    }

    // Check if username already exists
    try {
      const exists = await checkUsernameExists(value);

      if (exists) {
        // Generate suggestions
        const suggestions = generateUsernamesuggestions(value);
        return {
          isValid: false,
          message: 'Username already taken. Try one of these suggestions:',
          suggestions
        };
      }

      return {
        isValid: true,
        message: ' Username is available!'
      };
    } catch (error) {

      // Return a warning state instead of blocking the user
      return {
        isValid: true,
        message: '⚠️ Could not verify username availability, but you can proceed. We\'ll check during signup.'
      };
    }
  };

  // Generate username suggestions
  const generateUsernamesuggestions = (baseUsername: string): string[] => {
    const suggestions: string[] = [];
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const symbols = ['_', '.', '-'];

    // Add number variations
    suggestions.push(`${baseUsername}${randomNum}`);

    // Add symbol variations
    for (let symbol of symbols) {
      suggestions.push(`${baseUsername}${symbol}${randomNum.toString().slice(0, 2)}`);
    }

    // Add pro/official variations
    suggestions.push(`${baseUsername}_official`);
    suggestions.push(`${baseUsername}pro`);

    return suggestions;
  };

  // Password strength checker
  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;

    // Length check
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;

    // Character variety checks
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;

    // Cap score at 4
    score = Math.min(score, 4);

    const strengthMap: Record<number, PasswordStrength> = {
      0: {
        score: 0,
        label: 'Very Weak',
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        width: 'w-1/4'
      },
      1: {
        score: 1,
        label: 'Weak',
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
        width: 'w-1/2'
      },
      2: {
        score: 2,
        label: 'Fair',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        width: 'w-2/3'
      },
      3: {
        score: 3,
        label: 'Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        width: 'w-3/4'
      },
      4: {
        score: 4,
        label: 'Strong',
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        width: 'w-full'
      }
    };

    return strengthMap[score];
  };

  const passwordStrength = password ? checkPasswordStrength(password) : null;

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError('');
    setSelectedSuggestion(null);
    // Validation will trigger via useEffect with debouncing
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setUsername(suggestion);
    setSelectedSuggestion(suggestion);
    // Validation will trigger via useEffect after 800ms
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setUsernameError('');

    if (!email || !username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Final validation check
    const validation = await validateUsername(username);
    if (!validation.isValid) {
      setUsernameError(validation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(email, password, username);
      setVerificationEmail(email);
      // Redirect to onboarding instead of showing success message
      setTimeout(() => {
        navigate('/onboarding');
      }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMsg);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      await loginGoogle();
      navigate('/user');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google signup failed. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <>
      {/* Email Verification Success Message */}
      {signupSuccess && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            {/* Success Animation */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-3">Account Created!</h1>
              <p className="text-slate-600 mb-6">
                A verification link has been sent to <span className="font-semibold text-slate-900">{verificationEmail}</span>
              </p>

              {/* Verification Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3 text-sm">Next Steps:</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">1.</span>
                    <span>Check your email inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">2.</span>
                    <span>Click the verification link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">3.</span>
                    <span>You'll be redirected to login</span>
                  </li>
                </ol>
              </div>

              {/* Check Email Button */}
              <button
                onClick={() => window.location.href = 'https://mail.google.com'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
              >
                Open Gmail
              </button>

              {/* Resend Email Option */}
              <p className="text-slate-600 text-sm mb-4">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSignupSuccess(false)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                  try again
                </button>
              </p>

              {/* Back to Login */}
              <Link
                to="/login"
                className="block text-slate-600 hover:text-slate-900 font-semibold transition"
              >
                Already verified? Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Signup Form (Hidden if success) */}
      {!signupSuccess && (
        <>
          {/* Welcome Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-3">Join Studiy</h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Create your account to get started
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
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Username {username && !usernameValidation && <span className="text-xs text-slate-500 animate-pulse">(checking...)</span>}
              </label>
              <input
                type="text"
                placeholder="Choose a unique username (3-20 chars)"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition outline-none text-slate-900 bg-white placeholder-slate-400 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${usernameValidation?.isValid
                  ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  : usernameValidation?.isValid === false
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    : 'border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent'
                  }`}
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={loading || checkingUsername}
                required
                minLength={3}
                maxLength={20}
              />

              {/* Username Validation Message */}
              {usernameValidation && (
                <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${usernameValidation.message.includes('⚠️')
                  ? 'bg-yellow-50 border border-yellow-200'
                  : usernameValidation.isValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                  }`}>
                  {usernameValidation.message.includes('⚠️') ? (
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : usernameValidation.isValid ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${usernameValidation.message.includes('⚠️')
                      ? 'text-yellow-700'
                      : usernameValidation.isValid ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {usernameValidation.message}
                    </p>

                    {/* Username Suggestions */}
                    {usernameValidation.suggestions && usernameValidation.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-red-600 font-semibold">Try these instead:</p>
                        <div className="flex flex-wrap gap-2">
                          {usernameValidation.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2">
                • Must start with letter or number • Cannot end with special characters
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  disabled={loading}
                >
                  {showPasswords ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Password strength:</span>
                    <span className={`text-xs font-semibold ${passwordStrength?.color}`}>
                      {passwordStrength?.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength?.bgColor} transition-all duration-300 ${passwordStrength?.width}`}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 mt-2">
                    <p className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      At least 8 characters
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      Uppercase and lowercase letters
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      At least one number
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      Special character (!@#$%^&* etc)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  disabled={loading}
                >
                  {showPasswords ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </button>
              </div>
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
              {loading ? 'Loading...' : 'Create Account'}
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
            onClick={handleGoogleSignup}
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

          {/* Toggle to Login */}
          <p className="text-center text-slate-600 text-xs sm:text-sm mt-4 sm:mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-black hover:text-slate-700 transition"
            >
              Sign In
            </Link>
          </p>

          {/* Footer Text */}
          <p className="text-center text-xs text-slate-500 mt-6 sm:mt-8">
            By signing up, you agree to our <br />
            <Link to="/terms-of-service" className="text-slate-600 hover:text-slate-800 transition-colors">Terms of Service</Link> and{' '}
            <Link to="/privacy-policy" className="text-slate-600 hover:text-slate-800 transition-colors">Privacy Policy</Link>
          </p>
        </>
      )}
    </>
  );
}
