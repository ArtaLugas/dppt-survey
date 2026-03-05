import { useState, useEffect, useCallback, useRef } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import { Search, Filter, Plus, LayoutList } from 'lucide-react';
import { debounce } from 'lodash'; // Hapus 'set' yang tidak terpakai

import { DashboardLayout } from '@/Components/layout/DashboardLayout';
import { InterviewTable } from '@/Components/dashboard/InterviewTable';
import { InterviewSummaryDialog } from '@/Components/interview/dialogs/InterviewSummaryDialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function SurveyorInterviews({ parcels, filters }) {
    const { auth } = usePage().props;
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Gunakan useRef untuk mencegah infinite loop trigger dari initial render
    const isFirstRender = useRef(true);

    // --- SERVER-SIDE FILTERING (DEBOUNCE) ---
    const debouncedSearch = useCallback(
        debounce((query, status) => {
            router.get(
                route('surveyor.interviews.index'),
                { search: query, status: status },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 500),
        []
    );

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        debouncedSearch(searchQuery, statusFilter);
    }, [searchQuery, statusFilter, debouncedSearch]);

    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // --- HANDLERS ---
    const handleView = (id) => {
        const parcelData = parcels.data.find(p => p.id === id);
        if (parcelData) {
            setSelectedParcel(parcelData);
            setIsSummaryOpen(true);
        }
    }

    const handleEdit = (id) => {
        router.get(route('surveyor.interviews.edit', id));
    };

    const handleSubmit = (id) => {
        router.post(route('surveyor.interviews.submit', id), {}, {
            preserveScroll: true,
            onSuccess: () => toast({
                title: 'Berhasil',
                description: 'Data disubmit untuk verifikasi.',
                className: "bg-emerald-50 border-emerald-200 text-emerald-900"
            }),
            onError: () => toast({
                title: 'Gagal',
                description: 'Gagal submit data.',
                variant: 'destructive'
            })
        });
    };

    // PERBAIKAN: Pisahkan parameter actionType ('delete' | 'void')
    const handleDelete = (id, actionType = 'delete') => {
        const endpoint = actionType === 'void'
            ? route('surveyor.interviews.void', id)
            : route('surveyor.interviews.destroy', id);

        // LOGIKA INTELEJEN: Gunakan router.visit dengan parameter 'method' dinamis
        router.visit(endpoint, {
            method: actionType === 'void' ? 'post' : 'delete',
            preserveScroll: true,
            onSuccess: () => toast({
                title: actionType === 'void' ? 'Dianulir' : 'Terhapus',
                description: actionType === 'void'
                    ? 'Berkas berhasil dibatalkan.'
                    : 'Data draf wawancara berhasil dihancurkan.',
                className: "bg-red-50 border-red-200 text-red-900"
            }),
            onError: () => toast({
                title: 'Aksi Gagal',
                description: 'Terjadi kesalahan sistem atau Anda tidak memiliki akses.',
                variant: 'destructive'
            })
        });
    };

    const currentUserRole = auth?.user?.role?.code?.toLowerCase() || 'surveyor';

    return (
        <DashboardLayout userName={auth.user.name} userRole={currentUserRole}>
            <Head title="Daftar Wawancara" />

            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
                {/* Header Premium (Tidak ada perubahan) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-200/80 pb-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-xl mb-3 border border-indigo-100/50">
                            <LayoutList className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Daftar Wawancara</h1>
                        <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                            Kelola, pantau, dan lengkapi data pembebasan lahan Anda. Pastikan semua dokumen dan foto memenuhi standar Golden Rule.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.get(route('surveyor.interviews.create'))}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all h-11 px-6 rounded-xl gap-2 font-medium"
                    >
                        <Plus className="h-4 w-4" /> Data Baru
                    </Button>
                </div>

                {/* Filter Bar (Tidak ada perubahan signifikan) */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center w-full z-10 relative">
                    {/* ... Input Search ... */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari No. Bidang, NIB, atau Nama Pemilik..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:bg-white rounded-xl w-full transition-all"
                        />
                    </div>
                    {/* ... Select Filter ... */}
                    <div className="w-full sm:w-auto min-w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:ring-indigo-500/20 rounded-xl w-full text-slate-700 font-medium">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    <SelectValue placeholder="Semua Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="draft">Draft / Revisi</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="locked">Locked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabel */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-semibold text-slate-700">Hasil Pencarian</h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            Menampilkan {parcels.from || 0}-{parcels.to || 0} dari total {parcels.total} data
                        </span>
                    </div>

                    <InterviewTable
                        interviews={parcels.data}
                        userRole={currentUserRole}
                        onView={handleView}
                        onEdit={handleEdit}
                        onSubmit={handleSubmit}
                        // Jika Anda menyesuaikan Table untuk mengirimkan type (delete/void) sebagai parameter kedua:
                        onDelete={(id, type) => handleDelete(id, type)}
                    />
                </div>

                {/* PERBAIKAN: Paginasi yang Aman dari Error DOM */}
                {parcels.links && parcels.links.length > 3 && (
                    <div className="flex justify-center pt-6 pb-4">
                        <div className="inline-flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-sm">
                            {parcels.links.map((link, i) => {
                                let label = link.label;
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
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: label }} />
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <InterviewSummaryDialog
                    open={isSummaryOpen}
                    onOpenChange={setIsSummaryOpen}
                    parcel={selectedParcel}
                />
            </div>
        </DashboardLayout>
    );
}
