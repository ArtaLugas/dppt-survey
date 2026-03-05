import { useState } from 'react';
import { AlertCircle, MapPin, FileText, Ruler, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/Components/dashboard/ConfirmDialog';

// Pastikan helper ini bisa menerima ID angka
import { getLandStatusLabel } from '@/data/mockInterviewDetails';
import { LandDetailDialog } from '../dialogs/LandDetailDialog';
import { set } from 'lodash';

export function LandDetailTab({ parcelId, landDetail, accessState, onSave, onDelete }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false); // State untuk menandakan proses sedang berjalan

    // Logika akses: Boleh edit jika punya akses 'canAddChildren' (Surveyor) & tidak ReadOnly
    const canModify = accessState?.canAddChildren && !accessState?.isReadOnly;

    const handleSubmit = (data) => {
        setIsProcessing(true);
        onSave(data, {
            onSuccess: () => {
                setIsProcessing(false);
                setDialogOpen(false);
            },
            onError: () => {
                setIsProcessing(false);
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    const handleConfirmDelete = () => {
        setIsProcessing(true);
        onDelete({
            onFinish: () => {
                setIsProcessing(false);
                setDeleteDialogOpen(false);
            }
        });
    };

    // Helper untuk format angka (ribuan separator)
    const formatNumber = (num) => {
        return num ? new Intl.NumberFormat('id-ID').format(num) : '0';
    };

    // State Pre-Save: Parcel ID belum ada
    if (!parcelId) {
        return (
        <Alert variant="warning" className="bg-amber-50 text-amber-900 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
                Data bidang utama harus disimpan terlebih dahulu sebelum mengisi detail tanah.
            </AlertDescription>
        </Alert>
        );
    }

    return (
        <div className="space-y-6 relative">

            {/* OVERLAY LOADING GLOBAL (Hanya muncul saat proses, di luar dialog) */}
            {isProcessing && !dialogOpen && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2rem]">
                    <div className="bg-card p-6 rounded-3xl shadow-xl border flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-foreground">Sinkronisasi Spasial...</p>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Detail Tanah
                    {landDetail && <Badge variant="outline" className="ml-2 text-xs">Terisi</Badge>}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Data yuridis (legalitas) dan fisik (spasial) bidang tanah.
                </p>
                </div>

                <div className="flex items-center gap-2">
                    {landDetail && canModify && (
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Hapus Detail Tanah"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Hapus</span>
                        </Button>
                    )}
                    <Button
                        onClick={() => setDialogOpen(true)}
                        disabled={!canModify || isProcessing}
                        variant="warning"
                        className="
                            bg-amber-500
                            hover:bg-amber-600
                            text-white
                            transition-colors
                        "
                        >
                        {landDetail ? 'Edit Detail Tanah' : '+ Tambah Detail Tanah'}
                    </Button>
                </div>
            </div>

            {/* --- ALERT STATUS AKSES --- */}
            {accessState?.isReadOnly && accessState?.message && (
                <Alert variant={accessState.isFinal ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{accessState.message}</AlertDescription>
                </Alert>
            )}

            {/* --- CONTENT AREA --- */}
            {landDetail ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. KARTU ASPEK LEGALITAS (YURIDIS) */}
                <div className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                    <div className="bg-muted/40 px-4 py-3 border-b flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm">A. Aspek Legalitas</h4>
                    </div>
                    <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                        <p className="text-muted-foreground text-xs mb-1">Status Tanah</p>
                        <Badge variant="secondary" className="rounded-sm">
                            {/* Mengakses snake_case: status_tanah_id */}
                            {getLandStatusLabel(landDetail.status_tanah_id)}
                        </Badge>
                        </div>
                        <div>
                        <p className="text-muted-foreground text-xs mb-1">NIB</p>
                        <p className="font-mono font-medium">{landDetail.nib || '-'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                        <div>
                        <p className="text-muted-foreground text-xs mb-1">Jenis Alas Hak</p>
                        <p className="font-medium">{landDetail.alas_hak_jenis || '-'}</p>
                        </div>
                        <div>
                        <p className="text-muted-foreground text-xs mb-1">Nomor Alas Hak</p>
                        <p className="font-medium">{landDetail.alas_hak_nomor || '-'}</p>
                        </div>
                    </div>

                    <div className="border-t pt-3">
                        <p className="text-muted-foreground text-xs mb-1">Luas Tertulis di Dokumen</p>
                        <p className="text-lg font-semibold text-blue-700">
                            {formatNumber(landDetail.luas_surat)} <span className="text-sm font-normal text-muted-foreground">m²</span>
                        </p>
                    </div>
                    </div>
                </div>

                {/* 2. KARTU ASPEK FISIK (SPASIAL) */}
                <div className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                    <div className="bg-muted/40 px-4 py-3 border-b flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold text-sm">B. Aspek Fisik & Lapangan</h4>
                    </div>
                    <div className="p-4 space-y-4">

                    {/* Grid Luas */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-md border">
                        <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Luas Ukur</p>
                        <p className="font-semibold text-slate-900">{formatNumber(landDetail.luas_ukur)}</p>
                        </div>
                        <div className="border-l border-r border-slate-200">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Terdampak</p>
                        <p className="font-bold text-red-600">{formatNumber(landDetail.luas_terdampak)}</p>
                        </div>
                        <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sisa</p>
                        <p className="font-semibold text-green-700">{formatNumber(landDetail.luas_sisa)}</p>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Letak Tanah
                        </p>
                        <p className="font-medium leading-snug">{landDetail.letak_tanah || '-'}</p>
                    </div>

                    {/* Spesifikasi Tambahan */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm border-t pt-3">
                        <div>
                        <p className="text-muted-foreground text-xs">Ruang Atas/Bawah</p>
                        <p>{landDetail.ruang_atas_bawah_tanah}</p>
                        </div>
                        <div>
                        <p className="text-muted-foreground text-xs">Status Sengketa</p>
                        <Badge variant={landDetail.pembebanan_hak === 'Bersih' ? 'outline' : 'destructive'}>
                            {landDetail.pembebanan_hak}
                        </Badge>
                        </div>
                        <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">Perkiraan Dampak</p>
                        <p className="font-medium">{landDetail.perkiraan_dampak}</p>
                        </div>
                    </div>

                    </div>
                </div>

                </div>
            ) : (
                /* --- EMPTY STATE --- */
                <div className="border-2 border-dashed rounded-lg p-10 text-center bg-muted/5">
                <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-sm">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium mb-1">Belum ada detail tanah</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Silakan input data yuridis (surat-surat) dan data fisik hasil pengukuran lapangan.
                </p>
                {canModify && (
                    <Button onClick={() => setDialogOpen(true)}>
                    Isi Detail Tanah Sekarang
                    </Button>
                )}
                </div>
            )}

            {/* --- DIALOG FORM --- */}
            <LandDetailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                parcelId={parcelId}
                landDetail={landDetail}
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
            />

            {/* --- CONFIRM DELETE DIALOG --- */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Hapus Detail Tanah"
                description="Tindakan ini akan menghapus seluruh data yuridis, luas ukur, dan data fisik lainnya pada bidang ini. Apakah Anda yakin?"
                confirmLabel="Ya, Hapus Data"
                cancelLabel="Batal"
                onConfirm={handleConfirmDelete}
                variant="destructive"
                disabled={isProcessing}
            />
        </div>
    );
}
