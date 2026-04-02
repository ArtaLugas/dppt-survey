import { useState, useEffect, useRef } from "react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { 
    FileCheck, 
    Lock, 
    Search, 
    Filter, 
    ArrowUpDown, 
    FileText, 
    List,
    Archive
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InterviewTable } from "@/components/dashboard/InterviewTable";
import { InterviewSummaryDialog } from "@/components/interview/dialogs/InterviewSummaryDialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function KoordinatorVerified({ interviews, stats, filters }) {
    const { auth } = usePage().props;
    const currentUserRole = auth?.user?.role?.code?.toLowerCase() || "koordinator";
    const currentUserName = auth?.user?.name || "Koordinator";

    // Data dari server
    const displayInterviews = interviews?.data || [];

    // State Filter & Sort
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");
    const [sortBy, setSortBy] = useState(filters?.sort || "latest");

    // Modal View Detail
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Sinkronisasi ke Backend
    const isMounted = useRef(false);
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (statusFilter && statusFilter !== "all") params.status = statusFilter;
            if (sortBy && sortBy !== "latest") params.sort = sortBy;

            router.get(route('koordinator.verified'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter, sortBy]);

    const handleView = (id) => {
        const parcelData = displayInterviews.find((p) => p.id === id);
        if (parcelData) {
            setSelectedParcel(parcelData);
            setIsSummaryOpen(true);
        }
    };

    return (
        <DashboardLayout userName={currentUserName} userRole={currentUserRole}>
            <Head title="Verified Interviews" />

            <div className="space-y-8 pb-10">
                {/* ── HERO BANNER ── */}
                <div className="relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl p-8 transition-all hover:border-emerald-100">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-gradient-to-tr from-indigo-50 to-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner ring-1 ring-emerald-100/50 mt-1">
                                <Archive className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    Arsip Wawancara Terverifikasi
                                </h1>
                                <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm leading-relaxed">
                                    Daftar seluruh data lapangan yang telah dinyatakan Valid atau telah dikunci secara permanen sistem.
                                </p>
                            </div>
                        </div>

                        {/* Statistik Mini */}
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-sm shrink-0">
                            <div className="px-5 py-2 text-center border-r border-slate-200/60">
                                <p className="text-[10px] font-bold text-emerald-600 tracking-widest mb-1 uppercase">VERIFIED</p>
                                <p className="text-2xl font-black text-slate-800">{stats.verified || 0}</p>
                            </div>
                            <div className="px-5 py-2 text-center">
                                <p className="text-[10px] font-bold text-indigo-600 tracking-widest mb-1 uppercase">LOCKED</p>
                                <p className="text-2xl font-black text-slate-800">{stats.locked || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 2 SUMMARY CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileCheck className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-black text-slate-800">{stats.verified || 0}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">Verified Interviews</h3>
                        <p className="text-sm text-slate-500 mt-1">Data yang telah disetujui kualitasnya oleh Koordinator.</p>
                    </div>

                    <div className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Lock className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-black text-slate-800">{stats.locked || 0}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">Locked Interviews</h3>
                        <p className="text-sm text-slate-500 mt-1">Berkas terkunci permanen dan tidak dapat diubah kembali.</p>
                    </div>
                </div>

                {/* ── FILTERING & SEARCH ── */}
                <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-sm p-4 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Cari berdasarkan nomor bidang, nama pemilik, alamat rincian..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white border-slate-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl transition-all shadow-sm font-medium text-slate-700"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
                            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 px-3 h-12 flex-1 lg:flex-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full lg:w-[160px] border-none focus:ring-0 font-medium">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="verified">Verified Only</SelectItem>
                                        <SelectItem value="locked">Locked Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 px-3 h-12 flex-1 lg:flex-none">
                                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full lg:w-[160px] border-none focus:ring-0 font-medium">
                                        <SelectValue placeholder="Terbaru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Terbaru</SelectItem>
                                        <SelectItem value="oldest">Terlama</SelectItem>
                                        <SelectItem value="status">Urut Status</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── DATA SECTION ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <List className="h-4 w-4 text-slate-400" />
                            Tabel Dokumen
                            {statusFilter !== "all" && (
                                <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-100 px-2 py-0.5">
                                    Status: {statusFilter.toUpperCase()}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="p-0">
                        {displayInterviews.length > 0 ? (
                            <>
                                <InterviewTable
                                    interviews={displayInterviews}
                                    userRole={currentUserRole}
                                    onView={handleView}
                                    showSurveyor
                                />

                                {/* ── PAGINATION ── */}
                                {interviews?.links && (
                                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Menampilkan {interviews.from} - {interviews.to} dari {interviews.total} dokumen
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {interviews.links.map((link, index) =>
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                            link.active
                                                                ? "bg-emerald-600 text-white font-medium shadow-sm"
                                                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300"
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 text-sm rounded-lg bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-24 text-center">
                                <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6 ring-8 ring-white border border-slate-100">
                                    <FileText className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1.5">Data Tidak Ditemukan</h3>
                                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                                    Tidak ada dokumen terverifikasi yang cocok dengan kriteria pencarian Anda.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <InterviewSummaryDialog
                    open={isSummaryOpen}
                    onOpenChange={setIsSummaryOpen}
                    parcel={selectedParcel}
                />
            </div>
        </DashboardLayout>
    );
}
