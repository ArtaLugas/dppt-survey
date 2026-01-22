import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { LogOut, Loader2, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/* =========================
   TOP NAVIGATION
========================= */
export function TopNav() {
    const [loading, setLoading] = useState(false);
    const page = usePage();
    const user = page.props.auth?.user;

    if (!user) return null;

    const userRole = user.role.code;

    const handleLogout = () => {
        setLoading(true);
        router.post('/logout', {}, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-6 shadow-sm">
            {/* Left Section - Page Title */}
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    Admin Dashboard
                </h1>
            </div>

            {/* Right Section - User Info & Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications (Optional) */}
                <button
                    className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {/* Settings (Optional) */}
                <button
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                    aria-label="Settings"
                >
                    <Settings className="h-5 w-5" />
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-slate-200" />

                {/* User Info */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                        {user.name.charAt(0)}
                    </div>

                    {/* Name & Role */}
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">
                            {user.name}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">
                            {userRole}
                        </p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleLogout}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                        loading
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Logging out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
