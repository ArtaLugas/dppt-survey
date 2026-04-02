import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ClipboardCheck, FileCheck, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InterviewTable } from "@/components/dashboard/InterviewTable";
import { InterviewSummaryDialog } from "@/components/interview/dialogs/InterviewSummaryDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// 1. Terima semua props dalam objek 'props' untuk menghindari ReferenceError
export default function KoordinatorDashboard(props) {
    const interviews = props.interviews ??
        props.parcels ?? { data: [], links: [], total: 0 };
    const serverStats = props.serverStats ?? {
        submitted: 0,
        verified: 0,
        locked: 0,
        revision: 0,
    };

    const { auth } = usePage().props;
    const currentUserRole =
        auth?.user?.role?.code?.toLowerCase() || "koordinator";
    const currentUserName = auth?.user?.name || "Koordinator";

    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const handleView = (id) => {
        const data = interviews.data?.find((i) => i.id === id);
        if (data) {
            setSelectedParcel(data);
            setIsSummaryOpen(true);
        }
    };

    const handleVerify = (id) => {
        router.patch(
            route("koordinator.interviews.verify", id),
            {},
            { preserveScroll: true },
        );
    };

    const handleRevise = (id, catatan) => {
        router.post(
            route("koordinator.interviews.revise", id),
            {
                _method: "patch",
                catatan_revisi: catatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Optional: add toast if available in props
                },
            },
        );
    };

    return (
        <DashboardLayout userName={currentUserName} userRole={currentUserRole}>
            <Head title="Koordinator Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Koordinator Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Review dan verifikasi data
                    </p>
                </div>

                {/* Grid Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Pending"
                        value={
                            (serverStats.submitted || 0) +
                            (serverStats.revision || 0)
                        }
                        icon={ClipboardCheck}
                        description="Menunggu diverifikasi / Revisi"
                        variant="warning"
                    />
                    <StatCard
                        title="Verified"
                        value={serverStats.verified}
                        icon={FileCheck}
                        description="Disetujui oleh Koordinator"
                        variant="success"
                    />
                    <StatCard
                        title="Locked"
                        value={serverStats.locked}
                        icon={Lock}
                        description="Catatan yang telah diselesaikan"
                        variant="danger"
                    />
                </div>

                <Tabs defaultValue="pending" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-slate-100/80">
                            <TabsTrigger value="pending" className="gap-2">
                                Menunggu Verifikasi
                                {(serverStats.submitted || 0) +
                                    (serverStats.revision || 0) >
                                    0 && (
                                    <span className="ml-1 px-2 py-0.5 text-[11px] bg-amber-500 text-white rounded-full font-bold">
                                        {(serverStats.submitted || 0) +
                                            (serverStats.revision || 0)}
                                    </span>
                                )}
                            </TabsTrigger>

                            <TabsTrigger value="verified" className="gap-2">
                                Selesai
                                {(serverStats.verified > 0 ||
                                    serverStats?.locked > 0) && (
                                    <span className="ml-1 px-2 py-0.5 text-[11px] bg-emerald-500 text-white rounded-full font-bold">
                                        {(serverStats.verified || 0) +
                                            (serverStats.locked || 0)}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Pengecekan aman dengan Optional Chaining */}
                        {interviews?.total > 0 && (
                            <span className="hidden md:inline text-[13px] font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm">
                                Total: {interviews.total} data
                            </span>
                        )}
                    </div>

                    <TabsContent value="pending">
                        <InterviewTable
                            interviews={
                                interviews.data?.filter(
                                    (i) =>
                                        i.status?.code === "submitted" ||
                                        i.status?.code === "revision",
                                ) || []
                            }
                            userRole={currentUserRole}
                            onView={handleView}
                            onVerify={handleVerify}
                            onRevise={handleRevise}
                            showSurveyor
                        />
                    </TabsContent>

                    <TabsContent value="verified">
                        <InterviewTable
                            interviews={
                                interviews.data?.filter(
                                    (i) =>
                                        i.status?.code === "verified" ||
                                        i.status?.code === "locked",
                                ) || []
                            }
                            userRole={currentUserRole}
                            onView={handleView}
                            showSurveyor
                        />
                    </TabsContent>
                </Tabs>

                {/* Paginasi Aman */}
                {interviews?.links?.length > 3 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {interviews.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <InterviewSummaryDialog
                open={isSummaryOpen}
                onOpenChange={setIsSummaryOpen}
                parcel={selectedParcel}
            />
        </DashboardLayout>
    );
}
