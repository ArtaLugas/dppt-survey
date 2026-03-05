import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Camera, UploadCloud, X,
  CheckCircle2, Loader2
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogTitle
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- SCHEMA VALIDATION ---
const formSchema = z.object({
  photoTypeId: z.number().min(1, 'Kategori foto wajib dipilih.'),
  file: z.any().refine((val) => val instanceof File, "File foto wajib diunggah."),
  caption: z.string().max(1000, 'Keterangan terlalu panjang.').optional(),
});

// Helper: support snake_case (min_qty dari Laravel) dan camelCase (minQty)
const getMinQty = (pt) => pt.min_qty ?? pt.minQty ?? 0;

export function DocumentationPhotoDialog({ open, onOpenChange, onSubmit, photoTypes = [], isProcessing }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { photoTypeId: 0, file: null, caption: '' },
    });

    const handleClose = useCallback(() => {
        if (isProcessing) return;
        form.reset();
        setPreviewUrl(null);
        onOpenChange(false);
    }, [form, onOpenChange, isProcessing]);

    const handleFormSubmit = (values) => {
        // Kirim sebagai FormData-compatible object agar forceFormData di Inertia berfungsi
        onSubmit({
            photo_type_id: values.photoTypeId,
            photo_file: values.file,
            caption: values.caption || '',
        }, {
            onSuccess: () => handleClose(),
        });
    };

    const processFile = (file) => {
        if (isProcessing) return;
        if (file && file.type.startsWith('image/')) {
            form.setValue('file', file, { shouldValidate: true });
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            form.setError('file', { type: 'manual', message: 'Hanya file gambar (JPG, PNG, WEBP) yang diizinkan.' });
        }
    };

    const handleFileChange = (e) => !isProcessing && processFile(e.target.files?.[0]);
    const handleDragOver = (e) => { e.preventDefault(); if (!isProcessing) setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsDragging(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const removeFile = () => {
        if (isProcessing) return;
        form.setValue('file', null, { shouldValidate: true });
        if (previewUrl) URL.revokeObjectURL(previewUrl); // Bebaskan memory
        setPreviewUrl(null);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-background rounded-[2rem] border-none shadow-2xl grid grid-rows-[auto_1fr_auto] max-h-[90vh]">

                {/* --- ROW 1: HEADER --- */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-background to-background p-6 md:p-8 border-b border-border/50 flex gap-5 items-center shrink-0">
                    <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        {isProcessing ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
                    </div>
                    <div>
                        <DialogTitle className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                            {isProcessing ? 'Sedang Mengunggah...' : 'Unggah Bukti Lapangan'}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1 text-muted-foreground">
                            {isProcessing ? 'Harap tunggu, file sedang diproses oleh server.' : 'Pastikan foto terang, jelas, dan memenuhi standar dokumentasi.'}
                        </DialogDescription>
                    </div>
                </div>

                {/* --- ROW 2: FORM BODY --- */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
                    <Form {...form}>
                        <form id="photo-upload-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">

                            {/* BLOK 1: KATEGORI */}
                            <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] shadow-sm">
                                <FormField control={form.control} name="photoTypeId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-foreground">Kategori Dokumen Foto</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(parseInt(v))}
                                            value={field.value ? field.value.toString() : ''}
                                            disabled={isProcessing}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-emerald-500/20">
                                                    <SelectValue placeholder="Pilih jenis foto..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {photoTypes.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()} className="py-3 font-medium">
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <span>{t.label}</span>
                                                            {/* FIX: Gunakan getMinQty untuk support snake_case dan camelCase */}
                                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                                                                Min. {getMinQty(t)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* BLOK 2: DROPZONE */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-[1.5rem] shadow-inner relative">
                                <FormField control={form.control} name="file" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-3">
                                                {!previewUrl ? (
                                                    <div
                                                        className={cn(
                                                            "relative flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden group",
                                                            isDragging ? "border-emerald-500 bg-emerald-100/50 scale-[1.02]" : "border-emerald-200 bg-white hover:border-emerald-400",
                                                            isProcessing && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                                            onChange={handleFileChange}
                                                            disabled={isProcessing}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                                        />
                                                        <UploadCloud className={cn("h-10 w-10 mb-4", isDragging ? "text-emerald-600 scale-110" : "text-emerald-500")} />
                                                        <p className="text-base font-bold text-emerald-900">Tarik gambar ke sini</p>
                                                        <p className="text-xs text-muted-foreground mt-1">atau klik untuk memilih file</p>
                                                        <p className="text-[10px] text-muted-foreground mt-3 font-medium">JPG, PNG, WEBP • Maks. 10 MB</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full h-[280px] rounded-2xl border-2 border-emerald-200 overflow-hidden group shadow-md flex items-center justify-center">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className={cn("relative z-10 w-full h-full object-contain", isProcessing && "brightness-50")}
                                                        />
                                                        {!isProcessing && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                className="absolute top-4 right-4 h-10 w-10 rounded-full z-30"
                                                                onClick={removeFile}
                                                            >
                                                                <X className="h-5 w-5" />
                                                            </Button>
                                                        )}
                                                        {isProcessing && <Loader2 className="absolute z-40 h-12 w-12 text-white animate-spin" />}
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* BLOK 3: CATATAN */}
                            <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] shadow-sm">
                                <FormField control={form.control} name="caption" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Catatan Lapangan</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                disabled={isProcessing}
                                                placeholder="Contoh: Batas utara bidang..."
                                                className="pl-4 rounded-xl min-h-[100px] bg-muted/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </form>
                    </Form>
                </div>

                {/* --- ROW 3: FOOTER --- */}
                <div className="p-6 border-t border-border/50 bg-background flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isProcessing} className="rounded-full h-12 px-6 font-bold">
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        form="photo-upload-form"
                        disabled={isProcessing}
                        className="rounded-full h-12 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white min-w-[180px]"
                    >
                        {isProcessing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" /> Unggah Dokumen
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
