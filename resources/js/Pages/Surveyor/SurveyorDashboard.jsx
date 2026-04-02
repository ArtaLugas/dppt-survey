import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { FilePlus, FileText, Send, CheckCircle, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { InterviewTable } from '@/components/dashboard/InterviewTable';
import { InterviewSummaryDialog } from '@/components/interview/dialogs/InterviewSummaryDialog';
import { Button } from '@/components/ui/button';
// mockData DIHAPUS SEPENUHNYA

export default function SurveyorDashboard({ parcels, serverStats }) {
    // 1. Ambil data autentikasi dari server
    const { auth } = usePage().props;
    const currentUserRole = auth?.user?.role?.code?.toLowerCase() || 'surveyor';
    const currentUserName = auth?.user?.name || 'Surveyor';

    // 2. State untuk mengontrol Modal/Dialog Ringkasan
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // 3. Fungsi View: Langsung mencari dari data Inertia yang selalu fresh
    const handleView = (id) => {
        const parcelData = parcels.data.find(p => p.id === id);
        if (parcelData) {
            setSelectedParcel(parcelData);
            setIsSummaryOpen(true);
        }
    }

    // 4. Fungsi Edit: Pindah ke halaman form
    const handleEdit = (id) => {
        router.get(route('surveyor.interviews.edit', id));
    };

    // Fungsi Submit & Delete DIHAPUS karena Dashboard bukan tempat eksekusi akhir.

    return (
        <DashboardLayout userName={currentUserName} userRole={currentUserRole}>
            <Head title="Surveyor Dashboard" />
            <div className="space-y-6">

                {/* ── HEADER HALAMAN ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Pantau kinerja dan prioritas pekerjaan Anda</p>
                    </div>
                    <Button onClick={() => router.get(route('surveyor.interviews.create'))} size="lg" className="shadow-sm">
                        <FilePlus className="h-5 w-5 mr-2" />
                        Buat Pendataan Baru
                    </Button>
                </div>

                {/* ── KARTU STATISTIK (GLOBAL SERVER DATA) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Draft & Revisi" value={(serverStats?.draft || 0) + (serverStats?.revision || 0)} icon={FileText} description="Butuh tindakan" variant="default" />
                    <StatCard title="Submitted" value={serverStats?.submitted || 0} icon={Send} description="Menunggu verifikasi" variant="primary" />
                    <StatCard title="Verified" value={serverStats?.verified || 0} icon={CheckCircle} description="Disetujui Koordinator" variant="success" />
                    <StatCard title="Locked" value={serverStats?.locked || 0} icon={Lock} description="Selesai (Read-only)" variant="danger" />
                </div>

                {/* ── TABEL PRIORITAS (DRAFT SAJA) ── */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
                            Pekerjaan Tertunda (Draft & Revisi)
                        </h3>
                        {parcels.total > 0 && (
                            <span className="text-[13px] font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm">
                                Menampilkan {parcels.from || 0}-{parcels.to || 0} dari {parcels.total} tugas
                            </span>
                        )}
                    </div>

                    <InterviewTable
                        interviews={parcels.data}
                        userRole={currentUserRole}
                        onView={handleView}
                        onEdit={handleEdit}
                        mode="compact" // KUNCI UTAMA: Menyembunyikan delete & submit
                    />
                </div>

                {/* ── PAGINASI ELEGAN ── */}
                {parcels.links && parcels.links.length > 3 && (
                    <div className="flex justify-center pt-4 pb-8">
                        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            {parcels.links.map((link, i) => {
                                let label = link.label.replace(/&laquo;/g, '').replace(/&raquo;/g, '').trim();
                                if (label.includes('Previous')) label = '←';
                                if (label.includes('Next')) label = '→';

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'ghost'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`h-9 min-w-[36px] px-3 font-medium rounded-lg transition-all ${
                                            link.active
                                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{label}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── DIALOG KOMPONEN TERINTEGRASI ── */}
            <InterviewSummaryDialog
                open={isSummaryOpen}
                onOpenChange={setIsSummaryOpen}
                parcel={selectedParcel}
            />

        </DashboardLayout>
    );
}
