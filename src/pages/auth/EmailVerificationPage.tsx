import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, AlertCircle, Loader } from 'lucide-react';
import { auth } from '@/src/firebase/firebase';
import { applyActionCode, ActionCodeSettings } from 'firebase/auth';

export function EmailVerificationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get the email verification code from URL
                const oobCode = searchParams.get('oobCode');
                const mode = searchParams.get('mode');

                if (!oobCode || mode !== 'verifyEmail') {
                    setVerificationStatus('error');
                    setErrorMessage('Invalid verification link. Please try again or contact support.');
                    return;
                }

                // Verify the email using the code
                await applyActionCode(auth, oobCode);

                setVerificationStatus('success');
                console.log('Email verified successfully');

                // Countdown before redirect
                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            navigate('/login');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(interval);
            } catch (error: any) {
                console.error('Email verification error:', error);
                setVerificationStatus('error');

                // Handle specific Firebase error codes
                if (error.code === 'auth/invalid-action-code') {
                    setErrorMessage('Verification link is invalid or has expired.');
                } else if (error.code === 'auth/user-disabled') {
                    setErrorMessage('This account has been disabled.');
                } else {
                    setErrorMessage(error.message || 'Failed to verify email. Please try again.');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md w-full">
                {verificationStatus === 'loading' && (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6 animate-pulse">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 mb-3">Verifying Email</h1>
                        <p className="text-slate-600">
                            Please wait while we verify your email address...
                        </p>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 mb-3">Email Verified!</h1>
                        <p className="text-slate-600 mb-8">
                            Your email has been successfully verified. You can now sign in to your account.
                        </p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800 font-semibold">
                                ✓ Account is now active and ready to use!
                            </p>
                        </div>

                        <p className="text-slate-600 text-sm mb-4">
                            Redirecting to login in <span className="font-bold text-slate-900">{countdown}</span> seconds...
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                        >
                            Sign In Now
                        </button>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 mb-3">Verification Failed</h1>
                        <p className="text-slate-600 mb-6">
                            {errorMessage}
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-red-800 font-semibold">
                                ✗ Unable to verify your email
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 px-4 rounded-lg transition"
                            >
                                Go to Login
                            </button>
                        </div>

                        <p className="text-slate-600 text-xs mt-6">
                            If you continue to experience issues, please contact support.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
