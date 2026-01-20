import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const handleEmailChange = (e) => {
        setData('email', e.target.value);
    };

    const handlePasswordChange = (e) => {
        setData('password', e.target.value);
    };

    const handleRememberChange = (e) => {
        setData('remember', e.target.checked);
    };

    return (
        <>
            <Head title="Log in" />

            {/* Animated Background with Brand Colors */}
            <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #263592 0%, #006CCD 50%, #80C7E3 100%)' }}>
                {/* Animated Blobs */}
                <div className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ backgroundColor: '#80C7E3' }}></div>
                <div className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: '#FFB74D' }}></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" style={{ backgroundColor: '#006CCD' }}></div>

                {/* Main Content */}
                <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-[480px]">
                        {/* Glass Card */}
                        <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-10 md:p-12 border border-white/50">
                            {/* Logo/Brand */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl bg-white">
                                    <svg
                                        viewBox="0 0 868.42 866.15"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-12 h-12 text-[#263592]"
                                        fill="currentColor"
                                    >
                                        <path d="m733.12,740.58c-9.97,1.59-17.05,8.19-29.52,11.52h.01c-8.88,7.94-139.96,51.36-161.26,57.16-27.33,7.44-157.67,45.5-178.23,40.48l-13.52,5.22c44.67,19.63,116.1,8.3,162.01,1.36l75.13-20.49c3.27-3.07-2.86-.36,5.31-3.59..." />
                                        <path d="m281.92,608.63c33.42-16.19,67.6-37.97,93.49-58.67,80.76-64.53,156.04-155.8,208.68-247.26,17.97-31.22,36.81-61.29,54.8-97.22,4.5-9,48.61-99.46,49.69-100.55,2.14-8.22,4.26-10.04,3.36-20.24-10.28-3.11-15.48-13.13-27.66-16.32-8.01,14.73-14.9,34.54-23.39,51.41-60.54,120.17-107.89,214.65-201.65,318.48-70.42,77.99-169.33,158.65-279.93,166.92-84.46,6.32-92.53-13.6-128.57-18.34l1.6,12.19h0c.44.43,1.05.51,1.22,1.36l6.47,15.05c10.96,8.02-5.58,16.46,48.99,24.55,64.8,9.62,136.83-4.21,192.89-31.38Z"/>
                                        <path d="m221.19,545.78c72.46-23.44,130.98-73.15,179.02-122.97,46.64-48.36,88.77-107.38,128.98-172.93,15.42-25.14,99.41-176.37,101.38-200.6-7.56-7.15-20.64-9.67-23.77-13.93-5.56-1.28-7.42-1.55-12.52-3.51-.34-.14-4.32-2.05-4.46-2.13-4.24-2.52-.93.16-3.91-2.98-5.62-.2-41.58-11.75-53.39-14.45-5.35-1.22-53.19-9.13-54.16-9.59l-57.31-2.7c1.18,2.87,1.85,5.21,2.73,7.01l.02.03,161.55,55.11c-1.4,9.72-14.06,31.81-18.26,39.33-29.42-.78-207.16-55.4-218.82-65.85-9.91-1.9-7.57.47-12.44-6.03-13.19,1.97-19.65-12.58-39.93-6.77-11.59,3.32-28.61,9.49-35.76,15.78,6.22,11.48,63.17,23.57,75.7,34.08l158.21,50.56c18.84,5.48,37.34,8.96,53.35,15.16-1.58,11.71-13.95,32.57-20.69,40.45-14.03.53-57.53-11.62-75.08-15.42-40.41-8.74-98.13-27.97-138.92-40.94-7.97-2.54-58.59-19.14-64.56-26.47-5.74.94-4.49.53-11.69-1.67l-28.26-10.55c-3.26-2.11-1.65-.75-3.99-3.26-10.33-.25-12.67-5.71-22.59,1.68-5.99,4.46-11.57,11.4-18.01,12.04l-1.16,8.52c1.11.79,2.88,4.34,3.44,5.2,9.37-.01,67.59,25.69,84.61,32,14.78,5.48,28.2,9.91,42.77,15.23,10.29,3.75,35.02,10.08,41.67,14.03,29.47,6.12,54.93,17.19,85.25,23.56,17.24,3.62,73.18,15.27,85.48,21.32-.09,10.34-15.44,30-20.73,38.76-19.2,1.25-80.36-13.93-97.46-18.65-13.13-3.62-82.44-16.29-90.69-25.41-22.94,1.14-180.48-60.38-186.99-61.2l-9.01,8.84c-4.15,9.13-12.28,12.21-13.41,20.72l23.59,11.88c3.95-.3,62.59,20.19,66.16,23.07,11.74,2.03,24.53,7.41,35.5,11.11,7.96,2.68,29.27,8.1,34.97,13,10.93-1.21,38.63,10.7,50.95,13.86l159.98,36.8c-.11,10.22-17.96,32.14-25.12,38.56-19.96.74-200.23-37.69-210.66-44.7-5.09-.74-9.87-1.59-14.04-2.79-3.57-1.03-1.75-.14-4.86-1.71-4.85-2.45-2.52-.69-6.02-4.34-6.04,1.31-82.65-22.43-89.82-27.08-19.13-2.98-38.34-15.93-53.51-17.16-2.63,2.93-1.84,2.79-4.05,5.83l-5.44,6.32c-.35,9.52-4.74,8.02-5.38,19.23,8.38,7.11,66.25,25.14,81.18,30.05,13.86,4.56,73.85,20.78,81.42,25.17,17.62,3.06,34.83,8.9,51.61,13l126.99,27.62c4.22.98,5.93,1.58,11.62,2.72l11.91,4.19c-3.31,8.96-13.42,18.4-18.99,24.76-10.23,11.7-12.96,12.82-32.26,8.66-22.57-4.86-47.24-7.82-70.93-12.42l-121.48-27.14c-1.68-.41-5.77-1.4-8.12-2.39-6.12-2.6-1.93-.09-5.44-3.24-13.01.58-52.09-13.13-66.01-17.18-13.97-4.06-49.94-18.47-62.97-18.1l-6.06,19.23c-1.4,15.68-2.14,15.77,11.67,20.04,4.03,1.25,8.38,2.38,11.5,3.38,5.74,1.86,6.46,1.32,6.48,1.02-.14-.23,0-.14,0,0,.21.35,1.08,1.45,4.19,4.25,10.08-.66,26.04,6.09,34.88,9.14,31.32,10.82,146.33,38.51,180.63,44.32,9.33,1.59,70.14,11.58,75.51,14.15-1.69,7.4-6.27,9.58-12.8,14.95-41.15,33.83-26.83,19.47-104.93,10.24-13.99-1.65-28.7-6.06-43.42-9.13-31.22-6.51-58.94-13.74-88.82-20.27l-79.35-20.47c-11.51.8-6.11,33.12-6.04,33.26,3.64,6.91,154.12,41.65,177.89,46.37,13.47,2.67,54.62,6.84,62.2,11.43-8.76,6.91-39.49,16.97-53.8,20.19-59.08,13.29-144.94-1.43-177.69-33.94l-6.28-.02.48,7.68c10.04,29.5-6.28,31.5,27.01,46.19,61.59,27.2,127.17,29.26,189.74,9Z"/>
                                        <path d="m846.6,537.49c-14.96,12.77-156.82,78.27-189.76,90.66-90.74,34.11-208.54,75.24-302.64,89.2-46.73,6.93-155.06,28.35-202.22,20.33-4.12,2.91-9.81,2.08-16.72,2.57l.71,7.99c2.83,1.01.3-.34,3.6,1.85,2.11,1.4,2.8,2.06,4.61,3.64l23.82,20.9c12.17,1.17,40.19-.55,52.35-2.93,63.29,4.67,230.88-38.48,297.01-56.4,58.6-15.88,136.69-46.93,194.12-71.23,11.33-4.79,55.13-25.65,63.12-26.32,4.93-5.82,20.46-12.61,28.48-15.41,10.45-5.94,25.95-15.24,36.99-18.86,4.11-13.91,11.54-27.54,13.23-43.97-4-4.51,1.6-.93-6.69-2.02Z"/>
                                        <path d="m400.7,776.73c-26.38,5.53-140.44,27.73-162.3,23.27h0c-5.32,3.21-14.73,2.84-22.84,3.24,3.4,7.3,11.42,5.42,18.69,14.56,8.11-.57,18.96,7.61,28.6,12.09,17.39,8.11,24.22.26,40.72,1.8,4.44-3.77,1.98-2.01,9.82-3.42,3.69-.66,7.97-1.03,11.34-1.55,8.22-1.29,15.35-2.15,24.28-3.07,7.07-3.45,61.76-11.7,76.9-15.42,25.67-6.33,49.61-11.39,73.25-18.55l141.91-43.86,10.14-5.86c22.67-9.13,62.13-25.89,81.93-31.31,6.95-7.62,44.24-17.47,54.46-26.95,5.2-4.82,28.88-42.45,31.5-52.32-12.33,2.35-50.73,22.67-65.52,29.17-114.59,50.38-228.12,92.07-352.86,118.18Z"/>
                                        <path d="m723.5,117.64s.01,0,.02,0c0,0,0,0,0,0h-.02Z"/>
                                        <path d="m865.84,394.84c-11.02.89-5.93,9.15-16,18.23-1.06,11.13-11.42,26.61-17.6,37.29-6.18,10.64-11.23,25.33-21.68,31.71-9.64,5.86-63.98,33.99-73.1,35.68l91.32-154.91c2.4-9.07,11.01-25.88,15.84-34.99,9.79-18.43,1.01-23.21-2.3-40.91l-6.44-16.37c-6.4,1.58-5.64,2.45-8.93,9.21l-17.08,36.67c-42.4,84.44-78.68,145.71-134.26,223.32-10.57,14.76-26.73,17.56-47.02,25.84-11.49,4.69-41.58,17.45-51.31,18.55,4.46-9.47,22.6-26.8,32.63-39.34,74.01-92.56,128.32-179.61,179.95-286.72l11.05-21.6c2.6-9.48,6.98-13.51,5.87-25.01-7.21-8.16-13.24-25.6-22.85-29.06l-19.5,42.58c-19.45,45.71-44.73,88.82-68.83,131.4-40.42,71.4-133.84,201.85-193.73,251.58-13,10.8-100.44,31.31-115.57,31.94,4.88-6.02,19.41-15.59,28.82-22.4,20.98-15.2,60.68-52.01,78.08-69.62,76.15-76.99,173.91-217.06,221.09-320.59,2.84-6.23,5.15-11.38,8.08-17.88,4.03-8.96,3.86-9.56,9.62-14.3.11-12.7,18.73-36.24,20.81-53.79-1.61-7.36-18.53-15.84-20.93-25.17-5.42.14-4.16-.18-8.34,1.45-.76,10.37-39.29,89.11-46.46,102.28-51.68,95.01-78.08,144.7-145.4,229.44-27.27,34.34-76.9,90.08-110.27,116.65-14.34,11.42-26.42,21.8-42.2,32.77-33.08,23.01-57.28,38.59-94.83,55.09-53.2,23.37-158.39,14.52-206.9,20.16,1.98,11.94,19.46,33.21,27.12,35.89,15.61,5.44,157.32-8.94,174.83-11.71,72.42-11.45,138.7-24.93,206.75-44.02,100.36-28.15,180.51-62.44,271.5-105.07,11.96-5.6,78.87-40.58,84.29-40.87,2.2-2.62.81-1.36,3.85-3.59,1.86-1.37,3.34-2.13,5.48-3.25,3.58-1.87,6.06-3.19,10.18-4.93,4.99-18.41,10.22-80.79,4.38-101.63Z"/>
                                        <path d="m861.4,496.7l.99-.62c-.33.14-.62.26-.93.39-.02.07-.04.16-.06.23Z"/>
                                    </svg>
                                </div>

                                <h1 className="text-4xl font-bold mb-2" style={{ color: '#263592' }}>Welcome</h1>
                                <p className="text-gray-600 font-medium">Sign in to access your account</p>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className="mb-6 p-4 rounded-xl border-l-4" style={{ backgroundColor: '#E3F2FD', borderColor: '#006CCD' }}>
                                    <p className="text-sm font-semibold" style={{ color: '#006CCD' }}>{status}</p>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={handleEmailChange}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium bg-white"
                                            placeholder="you@example.com"
                                            autoComplete="username"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm flex items-center font-semibold" style={{ color: '#D32F2F' }}>
                                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#333333' }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            onChange={handlePasswordChange}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium bg-white"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-2 text-sm flex items-center font-semibold" style={{ color: '#D32F2F' }}>
                                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={handleRememberChange}
                                            className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer transition-all"
                                            style={{ accentColor: '#006CCD' }}
                                        />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">Remember me</span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-semibold transition-colors hover:underline"
                                            style={{ color: '#006CCD' }}
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="
                                        group
                                        w-full text-white font-semibold
                                        py-4 px-6 rounded-xl
                                        transition-all duration-300 ease-out
                                        disabled:opacity-60 disabled:cursor-not-allowed
                                        shadow-lg hover:shadow-xl
                                        focus:outline-none focus:ring-4 focus:ring-blue-300
                                        mt-8 relative overflow-hidden
                                        transform hover:scale-[1.02] active:scale-[0.98]
                                    "
                                    style={{ background: 'linear-gradient(135deg, #006CCD 0%, #263592 100%)' }}
                                >
                                    {/* Efek shimmer saat hover */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 group-hover:animate-shimmer"></span>

                                    {/* Efek overlay gelap saat hover */}
                                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>

                                    <span className="relative z-10 flex items-center justify-center text-base">
                                        {processing ? (
                                            <span className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                    />
                                                </svg>
                                                Signing in…
                                            </span>
                                        ) : (
                                            <>
                                                Sign In
                                                <svg
                                                    className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="2.5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                </button>

                            </form>

                            {/* Divider */}
                            <div className="my-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center space-x-2 text-gray-500 bg-gray-50 py-3 px-5 rounded-xl border border-gray-200">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-xs font-semibold">Secured Connection</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Text */}
                        <p className="text-center text-white/90 text-sm mt-8 font-medium">
                            © 2026 EQUATOR GROUP. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Custom Animations */}
                <style>{`
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                `}</style>
            </div>
        </>
    );
}
