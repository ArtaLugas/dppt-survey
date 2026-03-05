import { useState, useMemo } from 'react';
import {
  Plus, Trash2, Camera, Image as ImageIcon, AlertCircle, CheckCircle2,
  FileImage, MapPin, Fingerprint, Landmark, Package, Clock, HardDrive, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { DocumentationPhotoDialog } from '@/Components/interview/dialogs/DocumentationPhotosDialog';
import { cn } from '@/lib/utils';

// --- HELPERS ---

const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getCategoryMeta = (id) => {
    switch (id) {
        case 1:
            return { icon: <Fingerprint className="h-6 w-6" />, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-200' };
        case 2:
            return { icon: <Landmark className="h-6 w-6" />, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-200' };
        case 3:
            return { icon: <Package className="h-6 w-6" />, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-200' };
        default:
            return { icon: <Camera className="h-6 w-6" />, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
    }
};

// Helper: ambil min_qty dengan support snake_case (Laravel) dan camelCase
const getMinQty = (pt) => pt.min_qty ?? pt.minQty ?? 0;

export function DocumentationPhotosTab({
    parcelId,
    photos = [],
    photoTypes = [],
    accessState = {},
    onAdd,
    onDelete
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleInternalSubmit = (formData, dialogCallbacks) => {
        setIsProcessing(true);
        onAdd(formData, {
            onSuccess: (page) => {
                setIsProcessing(false);
                setDialogOpen(false);
                if (dialogCallbacks?.onSuccess) dialogCallbacks.onSuccess(page);
            },
            onError: (errors) => {
                setIsProcessing(false);
                if (dialogCallbacks?.onError) dialogCallbacks.onError(errors);
            }
        });
    };

    const canModify = accessState?.canAddChildren && !accessState?.isReadOnly;

    const safePhotos = useMemo(() => Array.isArray(photos) ? photos : [], [photos]);

    const groupedData = useMemo(() => photoTypes.map(pt => {
        // Support photo_type_id (snake_case dari Laravel) dan photoTypeId (camelCase)
        const typePhotos = safePhotos.filter(p =>
            p.photo_type_id === pt.id || p.photoTypeId === pt.id
        );
        const minRequired = getMinQty(pt);

        return {
            type: pt,
            photos: typePhotos,
            count: typePhotos.length,
            met: typePhotos.length >= minRequired,
        };
    }), [safePhotos, photoTypes]);

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingId) {
            setIsProcessing(true);
            onDelete(deletingId, {
                onFinish: () => {
                    setIsProcessing(false);
                    setDeleteDialogOpen(false);
                    setDeletingId(null);
                }
            });
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Overlay Loading Global saat Delete atau Upload */}
            {isProcessing && !dialogOpen && (
                <div className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[100] flex items-center justify-center">
                    <div className="bg-card p-6 rounded-3xl shadow-2xl border flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-black uppercase tracking-widest">Sinkronisasi Data...</p>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
                        <Camera className="text-primary h-7 w-7" /> Manajemen Visual
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xl">
                        Pusat kendali bukti lapangan. Sistem otomatis mengekstrak titik koordinat (Geotagging) dari metadata foto untuk validasi lokasi.
                    </p>
                </div>
                <Button
                    onClick={() => setDialogOpen(true)}
                    disabled={!canModify || !parcelId}
                    className="rounded-xl h-12 px-6 shadow-xl shadow-primary/20 font-bold transition-all hover:scale-105"
                >
                    <Plus className="mr-2 h-5 w-5" /> Unggah Dokumentasi
                </Button>
            </div>

            {/* --- STATUS WIDGETS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groupedData.map((group) => {
                    const meta = getCategoryMeta(group.type.id);
                    return (
                        <Card key={`widget-${group.type.id}`} className="border-none bg-muted/30 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-4 rounded-2xl shadow-inner transition-colors", meta.bg, meta.color, "group-hover:bg-background")}>
                                        {meta.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{group.type.label}</p>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-2xl font-black text-foreground">{group.count}</span>
                                            <span className="text-sm font-medium text-muted-foreground">/ {getMinQty(group.type)} File</span>
                                        </div>
                                    </div>
                                </div>
                                {group.met ? (
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shadow-sm animate-pulse">
                                        <AlertCircle className="h-6 w-6 text-amber-600" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* --- GALERI FOTO (Dikelompokkan) --- */}
            <div className="space-y-20">
                {groupedData.map((group) => {
                    const meta = getCategoryMeta(group.type.id);

                    return (
                        <div key={`section-${group.type.id}`} className="space-y-8 animate-in fade-in duration-700">

                            {/* Header Kategori */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-primary pl-6 py-2 bg-gradient-to-r from-muted/30 to-transparent rounded-r-2xl">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl shadow-sm bg-background border", meta.color, meta.border)}>
                                        {meta.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground uppercase tracking-widest text-sm">
                                            {group.type.label}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                                            Wajib: <span className="text-foreground">{getMinQty(group.type)} Berkas</span> • Terkumpul: <span className={cn(group.met ? "text-emerald-600" : "text-amber-600")}>{group.count}</span>
                                        </p>
                                    </div>
                                </div>

                                <Badge variant={group.met ? "default" : "outline"} className={cn("px-5 py-2 font-bold tracking-wide rounded-full shadow-sm", group.met ? "bg-emerald-600 hover:bg-emerald-700 border-none" : "text-amber-700 border-amber-300 bg-amber-50")}>
                                    {group.met ? (
                                        <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> LENGKAP</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5" /> KURANG {Math.max(0, getMinQty(group.type) - group.count)} FILE</span>
                                    )}
                                </Badge>
                            </div>

                            {/* Grid Foto */}
                            {group.photos.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {group.photos.map((photo) => (
                                        <Card key={photo.id} className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-border/60 bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1">

                                            {/* Area Gambar */}
                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50">
                                                {photo.file_path || photo.url || photo.path ? (
                                                    <img
                                                        src={photo.file_path ? `/storage/${photo.file_path}` : (photo.url || photo.path)}
                                                        alt={photo.file_name}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=File+Corrupt";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                                                        <ImageIcon className="h-16 w-16" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                                {canModify && (
                                                    <Button
                                                        variant="destructive" size="icon"
                                                        className="absolute right-4 top-4 h-9 w-9 translate-y-[-10px] rounded-full bg-red-500/80 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-red-600 group-hover:translate-y-0 group-hover:opacity-100"
                                                        onClick={() => handleDeleteClick(photo.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {photo.latitude && photo.longitude ? (
                                                    <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                                                        <div className="flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 shadow-lg backdrop-blur-md transition-all group-hover:bg-black/60">
                                                            <MapPin className="h-3 w-3 shrink-0 text-rose-400" />
                                                            <span className="truncate font-mono text-[10px] font-bold text-white">
                                                                {Number(photo.latitude).toFixed(6)}, {Number(photo.longitude).toFixed(6)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="absolute bottom-3 left-3">
                                                        <Badge variant="destructive" className="border-none bg-red-600/90 text-[10px] backdrop-blur-md">No GPS Data</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Area Metadata */}
                                            <div className="flex flex-1 flex-col justify-between p-5">
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="line-clamp-1 text-sm font-bold text-foreground" title={photo.file_name}>
                                                            {photo.file_name || "Tanpa Nama File"}
                                                        </h5>
                                                        <Badge variant="secondary" className="shrink-0 text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-muted">
                                                            {photo.mime_type ? photo.mime_type.split('/')[1] : 'IMG'}
                                                        </Badge>
                                                    </div>
                                                    <p className="line-clamp-2 text-xs italic leading-relaxed text-muted-foreground">
                                                        {photo.caption || "Tidak ada keterangan tambahan."}
                                                    </p>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between border-t border-dashed border-border pt-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/80">
                                                        <HardDrive className="h-3 w-3" />
                                                        {formatBytes(photo.file_size_bytes)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/80">
                                                        <Clock className="h-3 w-3" />
                                                        {photo.taken_at ? new Date(photo.taken_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {/* Add Button Placeholder */}
                                    {canModify && (
                                        <button
                                            onClick={() => setDialogOpen(true)}
                                            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-muted bg-muted/5 transition-all hover:border-primary/50 hover:bg-primary/5 h-full min-h-[320px]"
                                        >
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted shadow-sm transition-transform group-hover:scale-110 group-hover:bg-background">
                                                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <p className="mt-4 text-sm font-bold text-muted-foreground group-hover:text-primary">Tambah {group.type.label}</p>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-dashed border-border bg-muted/5 py-20 text-center transition-all hover:bg-muted/10">
                                    <div className={cn("mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br shadow-inner", meta.bg)}>
                                        {meta.icon}
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-widest text-foreground">
                                        Belum Ada Dokumentasi
                                    </h3>
                                    <p className="mt-2 max-w-sm text-sm font-medium text-muted-foreground">
                                        Kategori <span className="font-bold text-foreground">{group.type.label}</span> mewajibkan minimal {getMinQty(group.type)} foto untuk verifikasi validitas bidang.
                                    </p>
                                    {canModify && (
                                        <Button onClick={() => setDialogOpen(true)} variant="outline" className="mt-8 rounded-full border-primary/20 px-8 font-bold text-primary hover:bg-primary hover:text-white">
                                            <Plus className="mr-2 h-4 w-4" /> Mulai Unggah Sekarang
                                        </Button>
                                    )}
                                    <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
                                    <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- MODALS --- */}
            <DocumentationPhotoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleInternalSubmit}
                photoTypes={photoTypes}
                isProcessing={isProcessing}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Hapus Bukti Visual"
                description="Apakah Anda yakin ingin menghapus foto ini?"
                confirmLabel={isProcessing ? "Menghapus..." : "Ya, Hapus Permanen"}
                onConfirm={handleConfirmDelete}
                variant="destructive"
                disabled={isProcessing}
            />
        </div>
    );
}
