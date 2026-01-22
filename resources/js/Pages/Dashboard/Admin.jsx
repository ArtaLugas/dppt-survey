import { router, Head } from '@inertiajs/react';
import {
    FileText,
    Lock,
    Users,
    ClipboardCheck,
    FileCheck,
    TrendingUp,
} from 'lucide-react';

import { DashboardLayout } from '@/Components/layout/DashboardLayout';
import { StatCard } from '@/Components/dashboard/StatCard';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

import {
    mockInterviews,
    mockUsers,
    getInterviewStats,
    getUserStats,
} from '@/data/mockData';

export default function Admin() {
    const interviewStats = getInterviewStats(mockInterviews);
    const userStats = getUserStats(mockUsers);

    const recentInterviews = [...mockInterviews]
        .sort(
            (a, b) =>
                new Date(b.lastUpdated || b.updatedAt).getTime() -
                new Date(a.lastUpdated || a.updatedAt).getTime()
        )
        .slice(0, 5);

    const statusColors = {
        draft: 'bg-[hsl(var(--status-draft))]',
        submitted: 'bg-[hsl(var(--status-submitted))]',
        verified: 'bg-[hsl(var(--status-verified))]',
        locked: 'bg-[hsl(var(--status-locked))]',
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <DashboardLayout userName="Eka Wijaya" userRole="admin">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div>
                        <p className="mt-1 text-muted-foreground">
                            System governance and control center
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Interviews"
                            value={interviewStats.total}
                            icon={FileText}
                            description="All interview records"
                            variant="primary"
                        />
                        <StatCard
                            title="Locked Interviews"
                            value={interviewStats.locked}
                            icon={Lock}
                            description="Finalized records"
                            variant="danger"
                        />
                        <StatCard
                            title="Active Users"
                            value={userStats.active}
                            icon={Users}
                            description={`${userStats.total} total users`}
                            variant="success"
                        />
                        <StatCard
                            title="Pending Verifications"
                            value={interviewStats.submitted}
                            icon={ClipboardCheck}
                            description="Awaiting koordinator review"
                            variant="warning"
                        />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Interview Status Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Interview Status Breakdown
                                </CardTitle>
                                <CardDescription>
                                    Overview of all interview statuses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--status-draft))]" />
                                            <span className="text-sm">Draft</span>
                                        </div>
                                        <span className="font-semibold">
                                            {interviewStats.draft}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--status-submitted))]" />
                                            <span className="text-sm">Submitted</span>
                                        </div>
                                        <span className="font-semibold">
                                            {interviewStats.submitted}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--status-verified))]" />
                                            <span className="text-sm">Verified</span>
                                        </div>
                                        <span className="font-semibold">
                                            {interviewStats.verified}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--status-locked))]" />
                                            <span className="text-sm">Locked</span>
                                        </div>
                                        <span className="font-semibold">
                                            {interviewStats.locked}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            router.visit('/admin/interviews')
                                        }
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View All Interviews
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    User Statistics
                                </CardTitle>
                                <CardDescription>
                                    Breakdown by role and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Surveyors</span>
                                        <span className="font-semibold">
                                            {userStats.surveyors}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Koordinators</span>
                                        <span className="font-semibold">
                                            {userStats.koordinators}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Admins</span>
                                        <span className="font-semibold">
                                            {userStats.admins}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <span className="text-sm font-medium">
                                            Active Users
                                        </span>
                                        <span className="font-semibold text-[hsl(var(--status-verified))]">
                                            {userStats.active}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            router.visit('/admin/users')
                                        }
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Interviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest interview updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentInterviews.map((interview) => (
                                    <div
                                        key={interview.id}
                                        className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/view/${interview.id}`
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="font-medium">
                                                    {interview.id}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {interview.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    {interview.surveyorName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {interview.lastUpdated ||
                                                        interview.updatedAt}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`${statusColors[interview.status]} capitalize`}
                                            >
                                                {interview.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={() =>
                                        router.visit('/admin/interviews')
                                    }
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    All Interviews
                                </Button>
                                <Button
                                    onClick={() => router.visit('/admin/users')}
                                    variant="outline"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Users Management
                                </Button>
                                <Button
                                    onClick={() => router.visit('/admin/audit')}
                                    variant="outline"
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Audit Logs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </>
    );
}
