import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Users, ClipboardCheck, Shield } from 'lucide-react';

const roles = [
    {
        id: 'surveyor',
        title: 'Surveyor',
        description: 'Create, edit, and submit surveys for verification',
        icon: ClipboardCheck,
        href: '/surveyor',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
    },
    {
        id: 'koordinator',
        title: 'Koordinator',
        description: 'Review and verify submitted surveys',
        icon: Users,
        href: '/koordinator',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
    },
    {
        id: 'admin',
        title: 'Admin',
        description: 'Full system access, user management, and governance',
        icon: Shield,
        href: '/admin',
        color: 'text-red-600',
        bg: 'bg-red-100',
    },
];

export default function Welcome() {
    return (
        <>
            <Head title="Select Role" />

            <div className="min-h-screen flex flex-col bg-gray-100">
                {/* Header */}
                <header className="border-b bg-white">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <img
                            src="/assets/logo_eq.png"
                            alt="Logo"
                            className="h-8 w-auto"
                        />
                        <h1 className="text-xl font-semibold text-gray-900">
                            Project Data Collection System
                        </h1>
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                                Project Data Collection System
                            </h2>
                            <p className="text-gray-500">
                                Select a role to log in to the Project Data Collection System dashboard.
                            </p>
                        </div>

                        {/* Role Cards */}
                        <div className="grid gap-4">
                            {roles.map((role) => {
                                const Icon = role.icon;

                                return (
                                    <Link
                                        key={role.id}
                                        href={role.href}
                                        className="
                                            group block
                                            rounded-xl
                                            border border-gray-200
                                            bg-white
                                            transition-all
                                            hover:border-blue-300
                                            hover:shadow-md
                                        "
                                    >
                                        <div className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                {/* Icon */}
                                                <div className={`p-3 rounded-lg ${role.bg}`}>
                                                    <Icon className={`h-6 w-6 ${role.color}`} />
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {role.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {role.description}
                                                    </p>
                                                </div>

                                                {/* CTA */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="
                                                        hover:bg-gray-200
                                                        hover:text-gray-900
                                                        border-gray-300
                                                    "
                                                >
                                                    <span>Login</span>
                                                </Button>

                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Workflow Info */}
                        <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-5">
                            <h3 className="mb-4 text-sm font-medium text-gray-900">
                                Project Data Collection System Workflow Status
                            </h3>

                            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                                <Status color="bg-gray-400" label="Draft" />
                                <Status color="bg-blue-500" label="Submitted" />
                                <Status color="bg-green-500" label="Verified" />
                                <Status color="bg-red-500" label="Locked (Final)" />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
                    Project Data Collection System Dashboard - &copy; 2026 EQUATOR GROUP
                </footer>
            </div>
        </>
    );
}

function Status({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}
