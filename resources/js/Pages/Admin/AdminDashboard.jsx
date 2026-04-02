import { Head, Link, router } from "@inertiajs/react";
import {
    FileText,
    Lock,
    Users,
    ClipboardCheck,
    FileCheck,
    TrendingUp,
    ChevronRight,
    ArrowRight,
    Activity,
    Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

import { DashboardLayout } from "@/Components/layout/DashboardLayout";
import { StatCard } from "@/Components/dashboard/StatCard";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";

// Mapping status ke varian Badge yang lebih profesional dan kontras
const STATUS_MAP = {
    draft: { variant: "secondary", label: "Draft" },
    submitted: { variant: "default", label: "Submitted" },
    verified: { variant: "success", label: "Verified" },
    locked: { variant: "premium", label: "Locked" }, // Indigo untuk Locked/Final
    revision: { variant: "warning", label: "Revision" },
    cancelled: { variant: "destructive", label: "Cancelled" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function Admin({
    auth,
    userStats = {},
    interviewStats = {},
    recentInterviews = [],
    analytics = {},
}) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <DashboardLayout
                userName={auth.user.name}
                userRole={auth.user.role.label}
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8 max-w-[1600px] mx-auto pb-10"
                >
                    {/* Page Header - Lebih bersih dengan border bottom */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-5">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                Dashboard Overview
                            </h1>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Real-time system governance and control center
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.visit("/admin/audit")}
                            >
                                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                                Audit Logs
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            index={0}
                            title="Total Interviews"
                            value={interviewStats?.total || 0}
                            icon={FileText}
                            description="Cumulative records"
                            variant="primary"
                        />
                        <StatCard
                            index={1}
                            title="Verified Records"
                            value={interviewStats?.verified || 0}
                            icon={FileCheck}
                            description="Quality assured data"
                            variant="success"
                        />
                        <StatCard
                            index={2}
                            title="Active Users"
                            value={userStats?.active || 0}
                            icon={Users}
                            description={`${userStats?.total || 0} total system users`}
                            variant="primary"
                        />
                        <StatCard
                            index={3}
                            title="Locked Fields"
                            value={interviewStats?.locked || 0}
                            icon={Lock}
                            description="Finalized interview blocks"
                            variant="danger"
                        />
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Status Chart */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-1"
                        >
                            <Card className="h-full shadow-sm hover:shadow-md transition-shadow border-muted/60">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Interview Integrity
                                    </CardTitle>
                                    <CardDescription>
                                        Status distribution breakdown
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[280px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    analytics?.statusBreakdown ||
                                                    []
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {(
                                                    analytics?.statusBreakdown ||
                                                    []
                                                ).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2 border-t pt-4">
                                    {(analytics?.statusBreakdown || []).map(
                                        (status, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between w-full text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                status.color,
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        {status.name}
                                                    </span>
                                                </div>
                                                <span className="font-bold">
                                                    {status.value}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>

                        {/* Trend Chart */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-2"
                        >
                            <Card className="h-full shadow-sm hover:shadow-md transition-shadow border-muted/60">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Activity Trend
                                    </CardTitle>
                                    <CardDescription>
                                        Daily interview updates (Last 7 days)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px] pr-4">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={
                                                analytics?.dailyActivity || []
                                            }
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="colorCount"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="hsl(var(--muted))"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "hsl(var(--muted-foreground))",
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "hsl(var(--muted-foreground))",
                                                }}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorCount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                        {/* User Distribution */}
                        <motion.div
                            variants={itemVariants}
                            className="xl:col-span-1"
                        >
                            <Card className="h-full shadow-sm border-muted/60">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        User Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4">
                                    {[
                                        {
                                            label: "Surveyors",
                                            value: userStats?.surveyors,
                                            icon: Users,
                                            color: "bg-blue-500",
                                        },
                                        {
                                            label: "Koordinators",
                                            value: userStats?.koordinators,
                                            icon: ClipboardCheck,
                                            color: "bg-amber-500",
                                        },
                                        {
                                            label: "Admins",
                                            value: userStats?.admins,
                                            icon: Lock,
                                            color: "bg-rose-500",
                                        },
                                    ].map((role, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-muted-foreground">
                                                    {role.label}
                                                </span>
                                                <span className="font-bold">
                                                    {role.value || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${(role.value / (userStats.total || 1)) * 100}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        delay: 0.5,
                                                    }}
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        role.color,
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="pt-0 border-t mt-auto">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between mt-4 text-sm font-semibold group"
                                        asChild
                                    >
                                        <Link href="/admin/users">
                                            Manage Access Control
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            variants={itemVariants}
                            className="xl:col-span-2"
                        >
                            <Card className="h-full shadow-sm border-muted/60 flex flex-col">
                                <CardHeader className="border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                                <FileCheck className="h-4 w-4 text-muted-foreground" />
                                                Live Activity Stream
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Real-time updates from field
                                                surveyors
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="font-semibold shadow-sm"
                                        >
                                            <Link href="/admin/interviews">
                                                Full Audit Log
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    {recentInterviews.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <Activity className="h-8 w-8 opacity-20" />
                                            </div>
                                            <p className="font-medium">
                                                No recent activity detected
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y border-b">
                                            {recentInterviews.map(
                                                (interview) => (
                                                    <Link
                                                        key={interview.id}
                                                        href={`/admin/view/${interview.id}`}
                                                        className="flex items-center justify-between p-5 transition-all hover:bg-muted/30 group relative"
                                                    >
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-sm tracking-tight text-foreground">
                                                                    #
                                                                    {
                                                                        interview.nomor_peta_index
                                                                    }
                                                                </span>
                                                                <Badge
                                                                    variant={STATUS_MAP[interview.status]?.variant || "outline"}
                                                                    className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5"
                                                                >
                                                                    {STATUS_MAP[interview.status]?.label || interview.status}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                                                <span className="max-w-[200px] truncate">
                                                                    {
                                                                        interview.location
                                                                    }
                                                                </span>
                                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                                <span className="text-foreground/70">
                                                                    Surveyor:{" "}
                                                                    {
                                                                        interview.surveyorName
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                                                    Updated
                                                                </p>
                                                                <p className="text-xs font-semibold">
                                                                    {
                                                                        interview.updatedAt
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="h-8 w-8 rounded-full border flex items-center justify-center bg-background shadow-sm group-hover:border-primary group-hover:text-primary transition-colors">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </DashboardLayout>
        </>
    );
}
