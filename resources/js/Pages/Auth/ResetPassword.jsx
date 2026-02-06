import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setData('password', newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const getStrengthColor = () => {
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
        return colors[passwordStrength] || colors[0];
    };

    const getStrengthText = () => {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return texts[passwordStrength] || texts[0];
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('password.update'));
    };

    return (
        <>
            <Head title="Reset Password" />

            {/* Full Page Background with Gradient */}
            <div className="min-h-screen w-full bg-gradient-to-br from-[#263592] via-[#006CCD] to-[#80C7E3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB74D]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

                {/* Content Container */}
                <div className="max-w-md w-full relative z-10">
                    {/* White Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-sm">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-[#006CCD] to-[#80C7E3] p-5 rounded-2xl shadow-lg">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#333333] mb-3">
                                Reset Password
                            </h2>
                            <p className="text-[#333333]/70 text-sm leading-relaxed">
                                Create a strong password to secure your account
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            <input type="hidden" name="token" value={data.token} />
                            <input type="hidden" name="email" value={data.email} />

                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-[#333333] mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#333333]/40" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={handlePasswordChange}
                                        className="pl-12 pr-12 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#006CCD] focus:ring-[#006CCD] focus:ring-2 transition-all py-3"
                                        placeholder="Enter your new password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-[#333333]/40 hover:text-[#333333]/60 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-[#333333]/40 hover:text-[#333333]/60 transition-colors" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {data.password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#333333]/60">Password strength:</span>
                                            <span className="text-xs font-semibold" style={{ color: getStrengthColor() }}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full"
                                                style={{
                                                    width: `${(passwordStrength / 4) * 100}%`,
                                                    backgroundColor: getStrengthColor()
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠</span>
                                        {errors.password}
                                    </p>
                                )}

                                {/* Password Requirements */}
                                <div className="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
                                    <p className="text-xs font-semibold text-[#333333] mb-2">Password must contain:</p>
                                    <ul className="space-y-1">
                                        <li className={`text-xs flex items-center ${data.password.length >= 8 ? 'text-green-600' : 'text-[#333333]/60'}`}>
                                            <CheckCircle2 className={`h-3 w-3 mr-1.5 ${data.password.length >= 8 ? 'opacity-100' : 'opacity-30'}`} />
                                            At least 8 characters
                                        </li>
                                        <li className={`text-xs flex items-center ${/[A-Z]/.test(data.password) && /[a-z]/.test(data.password) ? 'text-green-600' : 'text-[#333333]/60'}`}>
                                            <CheckCircle2 className={`h-3 w-3 mr-1.5 ${/[A-Z]/.test(data.password) && /[a-z]/.test(data.password) ? 'opacity-100' : 'opacity-30'}`} />
                                            Uppercase & lowercase letters
                                        </li>
                                        <li className={`text-xs flex items-center ${/\d/.test(data.password) ? 'text-green-600' : 'text-[#333333]/60'}`}>
                                            <CheckCircle2 className={`h-3 w-3 mr-1.5 ${/\d/.test(data.password) ? 'opacity-100' : 'opacity-30'}`} />
                                            At least one number
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-[#333333] mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#333333]/40" />
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="pl-12 pr-12 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#006CCD] focus:ring-[#006CCD] focus:ring-2 transition-all py-3"
                                        placeholder="Confirm your new password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-[#333333]/40 hover:text-[#333333]/60 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-[#333333]/40 hover:text-[#333333]/60 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <span className="mr-1">⚠</span>
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-[#263592] to-[#006CCD] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-5 w-5 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-center text-[#333333]/60 leading-relaxed">
                                If you didn't request a password reset, you can safely ignore this page.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Link */}
                    <div className="mt-8 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-white/90 hover:text-white font-medium transition-colors inline-flex items-center"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
