import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    FilePlus,
    Users,
    ClipboardCheck,
    FileCheck,
    ScrollText,
    ChevronLeft,
    LogOut,
    Loader2,
    Settings,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* =========================
   MENU CONFIG
========================= */
const menuItems = {
    surveyor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/surveyor' },
        { label: 'Create Interview', icon: FilePlus, path: '/interviews/create' },
        { label: 'My Interviews', icon: FileText, path: '/interviews' },
    ],
    koordinator: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/koordinator' },
        { label: 'Submitted Interviews', icon: ClipboardCheck, path: '/koordinator/submitted' },
        { label: 'Verified Interviews', icon: FileCheck, path: '/koordinator/verified' },
    ],
    admin: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'All Interviews', icon: FileText, path: '/admin/interviews' },
        { label: 'Users Management', icon: Users, path: '/admin/users' },
        { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit' },
    ],
};

/* =========================
   SIDEBAR
========================= */
export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false); // ✅ FIX UTAMA

    const page = usePage();
    const user = page.props.auth?.user;
    const currentUrl = page.url;

    if (!user) return null;

    const userRole = user.role.code; // ✅ HARUS code
    const items = menuItems[userRole] || [];

    return (
        <aside
            className={cn(
                'relative flex h-screen flex-col border-r bg-gradient-to-b from-slate-50 to-white shadow-lg transition-all duration-300',
                collapsed ? 'w-20' : 'w-72'
            )}
        >
            {/* Header */}
            <div className={cn(
                'flex items-center gap-3 border-b px-6 py-5',
                collapsed && 'justify-center px-4'
            )}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow">
                    <img
                        src="/assets/icon_eq.png"
                        alt="Equator Group"
                        className={cn(
                            'transition-all duration-300',
                            collapsed ? 'h-6 w-6' : 'h-8 w-auto'
                        )}
                    />
                </div>
                {!collapsed && (
                    <div>
                        <div className="text-lg font-bold">Data Collection</div>
                        <div className="text-xs uppercase text-blue-600">
                            {userRole}
                        </div>
                    </div>
                )}
            </div>

            {/* Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow"
            >
                <ChevronLeft
                    className={cn(
                        'h-4 w-4 transition-transform',
                        collapsed && 'rotate-180'
                    )}
                />
            </button>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {items.map(item => (
                    <SidebarItem
                        key={item.path}
                        item={item}
                        currentUrl={currentUrl}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {/* User */}
            <div className="border-t p-4">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-xl bg-slate-100 p-3 transition',
                        collapsed && 'justify-center'
                    )}
                >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                    </div>

                    {!collapsed && (
                        <>
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {user.name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {user.email}
                                </p>
                            </div>

                            {/* Logout Button */}
                            <LogoutButton />
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}

/* =========================
   SIDEBAR ITEM
========================= */
function SidebarItem({ item, currentUrl, collapsed }) {
    const Icon = item.icon;
    const path = currentUrl.split('?')[0];

    const active =
        path === item.path ||
        path.startsWith(item.path + '/');

    return (
        <Link
            href={item.path}
            className={cn(
                'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                collapsed && 'justify-center px-3',
                active
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-100'
            )}
        >
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
        </Link>
    );
}

function LogoutButton() {
    const [loading, setLoading] = useState(false);

    return (
        <button
            type="button"
            disabled={loading}
            onClick={() => {
                setLoading(true);

                router.post('/logout', {}, {
                    onFinish: () => setLoading(false),
                });
            }}
            className={cn(
                'flex items-center gap-2 rounded-lg p-2 transition-all duration-200',
                loading
                    ? 'cursor-not-allowed text-slate-400'
                    : 'text-red-600 hover:bg-red-100 hover:text-red-700'
            )}
            aria-label="Logout"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="h-4 w-4" />
            )}
        </button>
    );
}
