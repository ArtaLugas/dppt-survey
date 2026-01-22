import { router } from '@inertiajs/react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';

/**
 * DashboardLayout
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.userName
 * @param {string} props.userRole
 */
export function DashboardLayout({ children, userName, userRole }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Content */}
            <div className="flex flex-1 flex-col">
                <TopNav
                    userName={userName}
                    userRole={userRole}
                    onLogout={handleLogout}
                />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
