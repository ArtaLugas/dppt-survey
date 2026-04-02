import { useState, useEffect, useRef } from "react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import {
    Search,
    Filter,
    FileCheck2,
    BriefcaseBusiness,
    CheckCircle2,
    List,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InterviewTable } from "@/components/dashboard/InterviewTable";
import { InterviewSummaryDialog } from "@/components/interview/dialogs/InterviewSummaryDialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function KoordinatorSubmitted({
    interviews,
    pendingCount,
    filters,
    surveyorsList,
}) {
    // 1. Dapatkan konteks Autentikasi dan Role User dari Inertia
    const { auth } = usePage().props;
    const currentUserRole =
        auth?.user?.role?.code?.toLowerCase() || "koordinator";
    const currentUserName = auth?.user?.name || "Koordinator";
    const { toast } = useToast();

    // 2. Data aktual yang sudah difilter dan dipaginate dari server
    const displayInterviews = interviews?.data || [];
    const surveyors = surveyorsList || [];

    // 3. State untuk Interaksi Filtering (Diinisialisasi dari parameter URL server)
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [surveyorFilter, setSurveyorFilter] = useState(
        filters?.surveyor || "all",
    );

    // 4. State Modal "View"
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // 4. Sinkronisasi filter ke backend (Auto-submit ketika mengetik / memilih)
    const isMounted = useRef(false);
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (surveyorFilter && surveyorFilter !== "all")
                params.surveyor = surveyorFilter;

            router.get(window.location.pathname, params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, surveyorFilter]);

    // 5. Handler Aksi (Router Inertia - Tanpa Popup Konfirmasi Ganda)
    const handleView = (id) => {
        const parcelData = displayInterviews.find((p) => p.id === id);
        if (parcelData) {
            setSelectedParcel(parcelData);
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
        console.log("Mencoba mengirim ke ID:", id, "Catatan:", catatan);

        // 2. GANTI router.patch menjadi router.post
        router.post(
            route("koordinator.interviews.revise", id),
            {
                _method: "patch", // SANGAT PENTING: Ini trik Spoofing Laravel
                catatan_revisi: catatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Revisi berhasil dieksekusi!");
                    // Opsional: Anda bisa tambahkan toast/notifikasi sukses di sini
                },
                onError: (errors) => {
                    // Jika error 500/422 terjadi, akan tercetak di sini
                    console.error("Data ditolak oleh server:", errors);
                },
            },
        );
    };

    return (
        <DashboardLayout userName={currentUserName} userRole={currentUserRole}>
            <Head title="Verifikasi Dokumen" />

            <div className="space-y-8 pb-10">
                {/* ── HERO BANNER (Desain Enterprise) ── */}
                <div className="relative overflow-hidden bg-white border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl p-8 transition-all hover:border-indigo-100">
                    {/* Background Pattern Lembut */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-teal-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner ring-1 ring-indigo-100/50 mt-1">
                                <FileCheck2 className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    Verifikasi Berkas Surveyor
                                </h1>
                                <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm leading-relaxed">
                                    Tinjau, evaluasi, dan verifikasi dokumen
                                    pengumpulan data lapangan yang telah
                                    dikirimkan ke server. Pastikan kualitas data
                                    memenuhi standar.
                                </p>
                            </div>
                        </div>

                        {/* Papan Indikator Statistik (Glassmorphism ringan) */}
                        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-sm shrink-0">
                            <div className="px-5 py-2 text-center border-r border-slate-200/60">
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest mb-1">
                                    MENUNGGU TINJAUAN
                                </p>
                                <p className="text-2xl font-black text-amber-500">
                                    {pendingCount}
                                </p>
                            </div>
                            <div className="px-5 py-2 text-center">
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest mb-1">
                                    HASIL PENGURUTAN
                                </p>
                                <p className="text-2xl font-black text-slate-800">
                                    {interviews?.total || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FILTERING CENTER (Bilah Pencarian Mengambang) ── */}
                <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-sm p-3.5 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Cari berdasarkan nomor bidang, nama pemilik, alamat rincian, atau surveyor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all shadow-sm font-medium text-slate-700"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                                <Select
                                    value={surveyorFilter}
                                    onValueChange={setSurveyorFilter}
                                >
                                    <SelectTrigger className="h-12 w-full sm:w-[240px] bg-transparent border-none focus:ring-0 focus:ring-offset-0 font-medium">
                                        <div className="flex items-center gap-2.5">
                                            <BriefcaseBusiness className="h-4 w-4 text-indigo-500" />
                                            <SelectValue placeholder="Semua Surveyor" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                        <SelectItem
                                            value="all"
                                            className="font-medium"
                                        >
                                            Semua Surveyor
                                        </SelectItem>
                                        {surveyors.map((surveyor) => (
                                            <SelectItem
                                                key={surveyor}
                                                value={surveyor}
                                                className="font-medium"
                                            >
                                                {surveyor}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── DATA SECTION (Pembungkus Tabel Utama) ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <List className="h-4 w-4 text-slate-400" />
                            Tabel Dokumen
                            {surveyorFilter !== "all" && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 py-0.5 px-2"
                                >
                                    Filter: {surveyorFilter}
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100 px-2 py-0.5"
                                >
                                    Pencarian Aktif
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
                                    onVerify={handleVerify}
                                    onRevise={handleRevise}
                                    showSurveyor
                                />

                                {/* ── PAGINATION ── */}
                                {interviews?.links && (
                                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Menampilkan {interviews.from} -{" "}
                                            {interviews.to} dari{" "}
                                            {interviews.total} dokumen
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {interviews.links.map(
                                                (link, index) =>
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            preserveScroll
                                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                                link.active
                                                                    ? "bg-indigo-600 text-white font-medium shadow-sm"
                                                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300"
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 text-sm rounded-lg bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── KONDISI KOSONG (Empty State Estetik) ── */
                            <div className="py-24 text-center animate-in fade-in zoom-in duration-500">
                                <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6 ring-8 ring-white border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-100/20"></div>
                                    <CheckCircle2 className="h-10 w-10 text-emerald-400 relative z-10" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1.5 tracking-tight">
                                    Antrean Bersih!
                                </h3>
                                <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                                    {searchQuery || surveyorFilter !== "all"
                                        ? "Tidak ada dokumen yang relevan dengan filter pencarian yang Anda tentukan tersebut."
                                        : "Tampaknya tidak ada lagi dokumen yang harus diverifikasi saat ini. Pekerjaan Anda selesai!"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL VIEW DETIL WAWANCARA */}
                <InterviewSummaryDialog
                    open={isSummaryOpen}
                    onOpenChange={setIsSummaryOpen}
                    parcel={selectedParcel}
                />
            </div>
        </DashboardLayout>
    );
}
