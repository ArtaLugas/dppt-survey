import { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        if (status) {
            setShowStatus(true);
            const timer = setTimeout(() => setShowStatus(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'), {
            preserveScroll: true,
            // Logika tambahan untuk feedback instan jika dibutuhkan
        });
    };

    return (
        <>
            <Head title="Forgot Password | Equator Group" />

            {/* Back to YOUR Original Vibrant Gradient */}
            <div className="min-h-screen w-full bg-gradient-to-br from-[#263592] via-[#006CCD] to-[#80C7E3] flex items-center justify-center py-12 px-4 relative overflow-hidden">

                {/* Decorative Elements - Kept for depth */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB74D]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-md w-full relative z-10">
                    {/* White Card - Your Original 3xl Design */}
                    <div className="bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 sm:p-10">

                        {/* Icon - Your Original Gradient Icon Box */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-gradient-to-br from-[#006CCD] to-[#80C7E3] p-5 rounded-2xl shadow-lg ring-4 ring-blue-50">
                                <Mail className="h-7 w-7 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#333333] mb-3 tracking-tight">
                                Forgot Password?
                            </h2>
                            <p className="text-[#333333]/60 text-sm leading-relaxed px-4">
                                No problem. Enter your email and we'll send a secure link to recover your account.
                            </p>
                        </div>

                        {/* Status Message - Refined Logic */}
                        {status && showStatus && (
                            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3 shrink-0" />
                                    <p className="text-sm font-semibold text-emerald-700">{status}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Handling - Refined Logic */}
                        {errors.email && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl animate-in shake duration-500">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 shrink-0" />
                                    <p className="text-sm font-semibold text-red-700">{errors.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-[#333333]/60 ml-1">
                                    Official Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#333333]/30 group-focus-within:text-[#006CCD] transition-colors" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`pl-12 block w-full rounded-xl border-gray-200 bg-gray-50/30 shadow-none focus:bg-white focus:ring-2 focus:ring-[#006CCD] transition-all py-3.5 ${errors.email ? 'border-red-300 ring-red-100' : ''}`}
                                        placeholder="user@equatorgroup.id"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button - Enhanced with Loader */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-[#263592] to-[#006CCD] text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm uppercase tracking-widest"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-3" />
                                        Request Reset Link
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-tighter">
                                <span className="px-4 bg-white text-gray-400">Security Access</span>
                            </div>
                        </div>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center font-bold text-sm text-[#006CCD] hover:text-[#263592] transition-colors group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Support Text - Using your Orange Accents */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-white/80">
                            Technical issues? Contact{' '}
                            <a href="mailto:support@equatorgroup.id" className="font-bold text-[#FFB74D] hover:underline decoration-2 underline-offset-4">
                                IT Support Center
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
