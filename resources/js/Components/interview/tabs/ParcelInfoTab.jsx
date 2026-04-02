import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle, Map, Hash, Trees, Home,
  ClipboardList, PenTool, Save, Loader2, Info, AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';

import { cn } from '@/lib/utils';

// Skema Zod berfungsi sebagai validasi runtime yang sangat kuat di JS
export const parcelInfoSchema = z.object({
  nomorPetaIndex: z.string().min(1, 'Nomor Peta Index wajib diisi').max(50),
  nomorBidang: z.string().min(1, 'Nomor Bidang wajib diisi').max(50),
  peruntukanLahan: z.string().min(1, 'Peruntukan lahan wajib diisi'),
  tipeBangunanMajor: z.string().optional().default(''),
  catatanLapangan: z.string().optional().default(''),
  tindakLanjut: z.string().optional().default(''),
});

export function ParcelInfoTab({ parcel, accessState, onSave, isLoading }) {
    const dbValues = {
        nomorPetaIndex: parcel?.nomor_peta_index || '',
        nomorBidang: parcel?.nomor_bidang || '',
        peruntukanLahan: parcel?.peruntukan_lahan || '',
        tipeBangunanMajor: parcel?.tipe_bangunan_major || '',
        catatanLapangan: parcel?.catatan_lapangan || '',
        tindakLanjut: parcel?.tindak_lanjut || '',
    };

    let initialValues = dbValues;

    const form = useForm({
        resolver: zodResolver(parcelInfoSchema),
        defaultValues: initialValues,
    });

    const onSubmitForm = (data) => {
        onSave(data, {
            onSuccess: () => {
                form.reset(data);
            }
        });
    };

    const isDisabled = accessState.isReadOnly || isLoading;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

        {/* --- PERINGATAN AKSES TERKUNCI --- */}
        {accessState.message && (
            <Alert variant={accessState.isFinal ? 'destructive' : 'default'} className={cn("rounded-2xl border-2", accessState.isFinal ? "bg-red-50/50" : "bg-muted")}>
            <AlertCircle className="h-5 w-5" />
            <div className="ml-2">
                <AlertTitle className="font-bold">Informasi Akses</AlertTitle>
                <AlertDescription className="font-medium mt-1">{accessState.message}</AlertDescription>
            </div>
            </Alert>
        )}

        {/* --- FORM UTAMA --- */}
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">

            {/* SECTION 1: Identifikasi Bidang */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 border-b border-border/50 pb-5 mb-6">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                    <Hash className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-foreground">Identifikasi Bidang</h3>
                    <p className="text-sm text-muted-foreground">Nomor registrasi dan identitas unik aset tanah.</p>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="nomorPetaIndex"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold">Nomor Peta Index</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Contoh: NPI-2026-001"
                            className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background"
                            {...field}
                            disabled={isDisabled}
                        />
                        </FormControl>
                        <FormDescription className="text-xs">ID unik sistem, tidak boleh ganda.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nomorBidang"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold">Nomor Bidang (Nominatif)</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Masukkan nomor bidang nominatif"
                            className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background"
                            {...field}
                            disabled={isDisabled}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>

            {/* SECTION 2: Karakteristik & Lahan */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 border-b border-border/50 pb-5 mb-6">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <Trees className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-foreground">Karakteristik & Lahan</h3>
                    <p className="text-sm text-muted-foreground">Informasi penggunaan tanah dan tipe bangunan dominan.</p>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="peruntukanLahan"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold flex items-center gap-2">
                        Peruntukan Lahan
                        </FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Sawah, Kebun, Pemukiman, dll."
                            className="h-12 rounded-xl bg-muted/30 focus-visible:bg-background"
                            {...field}
                            disabled={isDisabled}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tipeBangunanMajor"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold flex items-center gap-2">
                        Tipe Bangunan Dominan <span className="text-[10px] font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">Opsional</span>
                        </FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Home className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50" />
                            <Input
                            placeholder="Permanen, Semi-Permanen, Kayu..."
                            className="h-12 pl-12 rounded-xl bg-muted/30 focus-visible:bg-background"
                            {...field}
                            disabled={isDisabled}
                            />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>

            {/* SECTION 3: Catatan & Rekomendasi */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4 border-b border-border/50 pb-5 mb-6">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                    <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-foreground">Catatan Lapangan</h3>
                    <p className="text-sm text-muted-foreground">Observasi tambahan dan tindak lanjut pasca-survei.</p>
                </div>
                </div>

                <div className="space-y-8">
                <FormField
                    control={form.control}
                    name="catatanLapangan"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold">Deskripsi & Catatan Lapangan</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Tuliskan temuan atau kendala spesifik saat observasi lapangan..."
                            className="min-h-[120px] resize-y rounded-xl bg-muted/30 focus-visible:bg-background p-4 leading-relaxed"
                            {...field}
                            disabled={isDisabled}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tindakLanjut"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-bold">Rekomendasi Tindak Lanjut</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <PenTool className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40" />
                            <Textarea
                            placeholder="Contoh: Perlu mediasi batas tanah dengan tetangga sebelah utara."
                            className="min-h-[100px] pl-12 resize-y rounded-xl bg-muted/30 focus-visible:bg-background p-4 leading-relaxed"
                            {...field}
                            disabled={isDisabled}
                            />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>

            {/* --- ACTION BAR --- */}
            {!accessState.isReadOnly && (
                <div className="sticky bottom-4 z-10 flex justify-end pt-4">
                <div className="bg-background/80 backdrop-blur-xl p-4 rounded-full border border-border/50 shadow-2xl flex items-center gap-4 pr-2 pl-6">
                    <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                    Pastikan Nomor Peta Index sudah benar sebelum menyimpan.
                    </span>
                    <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isDirty}
                    className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan Data...</>
                    ) : (
                        <><Save className="mr-2 h-5 w-5" /> Simpan Perubahan</>
                    )}
                    </Button>
                </div>
                </div>
            )}

            </form>
        </Form>
        </div>
    );
}
