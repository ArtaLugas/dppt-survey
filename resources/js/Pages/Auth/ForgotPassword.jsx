import { useState,useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [showStatus, setShowStatus] = useState(true);

    useEffect(() => {
        if (status) {
            setShowStatus(true);
            const timer = setTimeout(() => setShowStatus(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);


    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

            {/* Full Page Background with Gradient */}
            <div className="min-h-screen w-full bg-gradient-to-br from-[#263592] via-[#006CCD] to-[#80C7E3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB74D]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                {/* Content Container */}
                <div className="max-w-md w-full relative z-10">
                    {/* White Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-sm">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-[#006CCD] to-[#80C7E3] p-5 rounded-2xl shadow-lg">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#333333] mb-3">
                                Forgot Password?
                            </h2>
                            <p className="text-[#333333]/70 text-sm leading-relaxed px-2">
                                No problem. Enter your email address and we'll send you a password reset link to help you regain access.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && showStatus && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                <p className="text-sm font-medium text-green-700 flex items-center">
                                    <Send className="h-4 w-4 mr-2" />
                                    {status}
                                </p>
                            </div>
                        )}

                        {errors.email && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <p className="text-sm font-medium text-red-700 flex items-center">
                                    ⚠️ {errors.email}
                                </p>
                            </div>
                        )}



                        {/* Form */}
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-[#333333] mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#333333]/40" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-12 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#006CCD] focus:ring-[#006CCD] focus:ring-2 transition-all py-3"
                                        placeholder="Enter your email"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                            </div>

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
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5 mr-2" />
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-[#333333]/60">or</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-sm text-[#333333]/70">
                                Remember your password?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-[#006CCD] hover:text-[#263592] transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Text */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-white/90">
                            Need help? Contact our{' '}
                            <a href="mailto:office@equatorgroup.id" className="font-semibold text-[#FFB74D] hover:text-white transition-colors underline-offset-2 hover:underline">
                                support team
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
