import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { updateUserOnboardingStatus } from '@/src/firebase/auth';
import { OnboardingData } from '@/src/types';

const TOTAL_STEPS = 3;

export function OnboardingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        name: user?.displayName || user?.username || '',
        useCase: null,
        usageMode: null,
    });

    // Redirect if user is not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleInputChange = (field: keyof OnboardingData, value: any) => {
        setData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNext = async () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            await completeOnboarding();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = async () => {
        if (user) {
            await updateUserOnboardingStatus(user.id, true, data);
            navigate('/user');
        }
    };

    const completeOnboarding = async () => {
        if (user) {
            try {
                await updateUserOnboardingStatus(user.id, true, data);
                navigate('/user');
            } catch (error) {
                console.error('Error completing onboarding:', error);
            }
        }
    };

    const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

    return (
        <div className="h-screen bg-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Skip Button at Top */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
            >
                Skip for now
            </button>

            <div className="w-full max-w-md">

                <div className="bg-white">
                    {/* Step 1: Name & Newsletter */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                                    How can we call you?
                                </h2>
                                <p className="text-slate-600 text-xs">
                                    We'll use this to personalize your experience
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={data.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-slate-900 bg-white placeholder-slate-400 transition"
                                    />
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition text-sm"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!data.name.trim()}
                                    className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
                                >
                                    Next <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Use Case */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                                    What will you use Studiy for?
                                </h2>
                                <p className="text-slate-600 text-xs">
                                    Choose the option that best fits your needs
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { value: 'education' as const, label: 'Education', desc: 'For studying and learning' },
                                    { value: 'work' as const, label: 'Work', desc: 'For professional purposes' },
                                    { value: 'hobby' as const, label: 'Hobby', desc: 'For personal interest' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleInputChange('useCase', option.value)}
                                        className={`w-full p-3 rounded-lg border-2 text-left transition ${data.useCase === option.value
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-slate-900 text-sm">{option.label}</div>
                                        <div className="text-xs text-slate-600">{option.desc}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2 text-sm"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!data.useCase}
                                    className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
                                >
                                    Next <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Usage Mode */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                                    How will you use Studiy?
                                </h2>
                                <p className="text-slate-600 text-xs">
                                    Choose your preferred collaboration style
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { value: 'solo' as const, label: 'By Myself', desc: 'Personal workspace', icon: User },
                                    { value: 'team' as const, label: 'With Team', desc: 'Collaborative workspace', icon: Users },
                                ].map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleInputChange('usageMode', option.value)}
                                            className={`p-4 rounded-lg border-2 text-center transition flex flex-col items-center gap-2 ${data.usageMode === option.value
                                                    ? 'border-slate-900 bg-slate-50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon
                                                size={28}
                                                className={data.usageMode === option.value ? 'text-slate-900' : 'text-slate-600'}
                                            />
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">{option.label}</div>
                                                <div className="text-xs text-slate-600 mt-0.5">{option.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2 text-sm"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    onClick={completeOnboarding}
                                    className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2 text-sm"
                                >
                                    Complete <Check size={16} />
                                </button>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
