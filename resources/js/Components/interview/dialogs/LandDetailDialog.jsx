import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileSignature, Ruler, LayoutList, Map,
  Hash, FileText, AlertTriangle, Loader2
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Asumsi Anda memiliki data statis ini
import { landStatuses } from '@/data/mockInterviewDetails';

// --- SCHEMA VALIDATION ---
const formSchema = z.object({
  status_tanah_id: z.coerce.number().min(1, 'Status tanah wajib dipilih'),
  alas_hak_jenis: z.string().min(1, 'Jenis alas hak wajib diisi'),
  alas_hak_nomor: z.string().min(1, 'Nomor alas hak wajib diisi'),
  nib: z.string().optional(),
  luas_surat: z.coerce.number().min(0, 'Harus >= 0'),
  luas_ukur: z.coerce.number().min(0, 'Harus >= 0'),
  luas_terdampak: z.coerce.number().min(0, 'Harus >= 0'),
  luas_sisa: z.coerce.number().min(0, 'Harus >= 0'),
  letak_tanah: z.string().min(1, 'Letak tanah wajib diisi'),
  ruang_atas_bawah_tanah: z.string(),
  pembebanan_hak: z.string(),
  perkiraan_dampak: z.string(),
}).refine((data) => data.luas_terdampak <= data.luas_ukur, {
  message: "Tidak rasional: Luas terdampak melebihi luas fisik (ukur) di lapangan.",
  path: ["luas_terdampak"],
}).refine((data) => data.luas_terdampak <= data.luas_surat, {
  message: "Isu Legal: Luas terdampak melebihi luas yang tercantum pada dokumen (surat).",
  path: ["luas_terdampak"],
});

// =====================================================================
// KOMPONEN HELPER: SUPERIOR AREA INPUT
// =====================================================================
const AreaInput = ({ field, disabled, className, readOnly }) => (
  <div className="relative group w-full">
    <Input
      type="text"
      inputMode="decimal"
      className={cn(
        "h-12 pr-12 text-right font-mono text-base tracking-wider rounded-xl transition-all w-full",
        "bg-muted/20 focus-visible:bg-background",
        readOnly && "pointer-events-none opacity-80",
        className
      )}
      value={field.value === 0 && !readOnly ? '' : field.value}
      onChange={(e) => {
        let val = e.target.value;
        val = val.replace(/,/g, '.');
        val = val.replace(/[^0-9.]/g, '');

        const parts = val.split('.');
        if (parts.length > 2) {
          val = parts[0] + '.' + parts.slice(1).join('');
        }
        field.onChange(val);
      }}
      onFocus={(e) => e.target.select()}
      disabled={disabled}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : 0}
    />
    <span className={cn(
      "absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase",
      readOnly ? "text-muted-foreground/50" : "text-muted-foreground group-focus-within:text-primary"
    )}>
      m²
    </span>
  </div>
);

// =====================================================================
// KOMPONEN UTAMA DIALOG
// =====================================================================
// PERBAIKAN: Menambahkan parcelId sebagai prop wajib!
export function LandDetailDialog({ open, onOpenChange, parcelId, landDetail, onSubmit, isProcessing }) {
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const storageKey = `draft_land_detail_${parcelId || 'new'}`;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_tanah_id: 1, alas_hak_jenis: '', alas_hak_nomor: '', nib: '',
      luas_surat: 0, luas_ukur: 0, luas_terdampak: 0, luas_sisa: 0,
      letak_tanah: '', ruang_atas_bawah_tanah: 'Bebas', pembebanan_hak: 'Bersih', perkiraan_dampak: 'Sebagian',
    },
  });

  const luasUkur = form.watch('luas_ukur');
  const luasTerdampak = form.watch('luas_terdampak');
  const perkiraanDampak = form.watch('perkiraan_dampak');

  useEffect(() => {
    const ukur = parseFloat(luasUkur) || 0;
    const terdampak = parseFloat(luasTerdampak) || 0;
    const sisa = ukur - terdampak;
    form.setValue('luas_sisa', sisa >= 0 ? parseFloat(sisa.toFixed(2)) : 0, { shouldValidate: true });
  }, [luasUkur, luasTerdampak, form]);

  useEffect(() => {
    if (perkiraanDampak === 'Seluruhnya') {
      form.setValue('luas_terdampak', parseFloat(luasUkur) || 0, { shouldValidate: true });
    }
  }, [perkiraanDampak, luasUkur, form]);

  // --- LOGIKA INTELEJEN: PENGAMBILAN DATA AWAL (DB vs LOKAL) ---
  useEffect(() => {
    if (open) {
      // 1. Siapkan data dari Database (sebagai perbandingan mutlak)
      const dbValues = {
        status_tanah_id: landDetail?.status_tanah_id || 1,
        alas_hak_jenis: landDetail?.alas_hak_jenis || '',
        alas_hak_nomor: landDetail?.alas_hak_nomor || '',
        nib: landDetail?.nib || '',
        luas_surat: parseFloat(landDetail?.luas_surat || 0),
        luas_ukur: parseFloat(landDetail?.luas_ukur || 0),
        luas_terdampak: parseFloat(landDetail?.luas_terdampak || 0),
        luas_sisa: parseFloat(landDetail?.luas_sisa || 0),
        letak_tanah: landDetail?.letak_tanah || '',
        ruang_atas_bawah_tanah: landDetail?.ruang_atas_bawah_tanah || 'Bebas',
        pembebanan_hak: landDetail?.pembebanan_hak || 'Bersih',
        perkiraan_dampak: landDetail?.perkiraan_dampak || 'Sebagian',
      };

      let initialValues = { ...dbValues };
      let hasDraft = false;

      // 2. Cek Brankas LocalStorage
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Jika isi brankas berbeda dengan database, berarti ada ketikan yang nyangkut
          if (JSON.stringify(parsed) !== JSON.stringify(dbValues)) {
            initialValues = parsed;
            hasDraft = true;
          }
        }
      } catch (e) {
        console.warn('Gagal membaca draf lokal', e);
      }

      setShowDraftAlert(hasDraft);
      form.reset(initialValues);

    } else {
      // Jika dialog ditutup, bersihkan form dan hilangkan alert
      form.reset({
        status_tanah_id: 1, alas_hak_jenis: '', alas_hak_nomor: '', nib: '',
        luas_surat: 0, luas_ukur: 0, luas_terdampak: 0, luas_sisa: 0,
        letak_tanah: '', ruang_atas_bawah_tanah: 'Bebas', pembebanan_hak: 'Bersih', perkiraan_dampak: 'Sebagian',
      });
      setShowDraftAlert(false);
    }
  }, [open, landDetail, form, storageKey]);

  // --- ENGINE AUTO-SAVE ---
  useEffect(() => {
    if (!open) return;

    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      }, 1000);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, open, storageKey]);

  // --- INTERSEPTOR SUBMIT ---
  const handleFormSubmit = (values) => {
    // Karena surveyor sukses menekan "Simpan", buang brankasnya
    window.localStorage.removeItem(storageKey);
    setShowDraftAlert(false);
    onSubmit(values); // Lanjutkan ke parent (yang akan menembak ke API Laravel)
  };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-background rounded-[2rem] border-none shadow-2xl grid grid-rows-[auto_1fr_auto] max-h-[90vh]">

                {/* --- ROW 1: HEADER VISUAL --- */}
                <div className="bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 border-b border-border/50 flex gap-5 items-center shrink-0">
                    <div className="h-14 w-14 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <Map className="h-7 w-7" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                        {landDetail ? 'Detail Spesifikasi Tanah' : 'Registrasi Detail Tanah'}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1 text-muted-foreground">
                        Lengkapi data aspek yuridis, dimensi fisik luasan, dan status hukum bidang tanah.
                        </DialogDescription>
                    </div>
                </div>

                {/* --- ROW 2: FORM BODY (Scrollable Area) --- */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-6">

                    {/* ALERT DRAF LOKAL */}
                    {showDraftAlert && (
                        <Alert className="rounded-2xl border-2 bg-amber-50 border-amber-200 text-amber-800 shadow-sm animate-in slide-in-from-top-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div className="ml-2">
                                <AlertTitle className="font-bold">Memulihkan Data yang Belum Tersimpan!</AlertTitle>
                                <AlertDescription className="font-medium mt-1 text-sm">
                                Sistem menemukan ketikan Anda yang gagal terkirim sebelumnya (kemungkinan terputus). Silakan periksa kembali dan klik Simpan.
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form id="land-detail-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">

                        {/* BLOK 1: ASPEK LEGALITAS (YURIDIS) */}
                        <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-md"><FileSignature className="h-4 w-4 text-blue-600" /></div> Aspek Legalitas (Yuridis)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="status_tanah_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-foreground">Status Tanah</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                                        <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-primary/20">
                                            <SelectValue placeholder="Pilih status legal tanah" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                        {landStatuses.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()} className="py-3 font-medium">
                                            {s.label}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="nib" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-foreground">Nomor Induk Bidang (NIB)</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                        <Hash className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="Cth: 12.34.56.78.9.12345" className="h-12 pl-12 rounded-xl font-mono text-sm bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="alas_hak_jenis" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-foreground">Jenis Alas Hak</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                        <FileText className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="Cth: SHM, AJB, Girik, Letter C" className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="alas_hak_nomor" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-foreground">Nomor Alas Hak</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                        <Hash className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <Input placeholder="Masukkan nomor dokumen" className="h-12 pl-12 rounded-xl font-mono text-sm bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            </div>
                        </div>

                        {/* BLOK 2: DIMENSI FISIK & SPASIAL */}
                        <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-6 shadow-sm">
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-md"><Ruler className="h-4 w-4 text-amber-600" /></div> Dimensi Fisik (Luasan Area)
                            </h4>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
                            <FormField control={form.control} name="luas_surat" render={({ field }) => (
                                <FormItem className="flex flex-col h-full justify-end">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center h-8">
                                    Luas di Surat
                                </FormLabel>
                                <FormControl><AreaInput field={field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="luas_ukur" render={({ field }) => (
                                <FormItem className="flex flex-col h-full justify-end">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center h-8">
                                    Luas Aktual (Ukur)
                                </FormLabel>
                                <FormControl><AreaInput field={field} className="border-amber-200 focus-visible:ring-amber-500" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="luas_terdampak" render={({ field }) => (
                                <FormItem className="flex flex-col h-full justify-end">
                                <FormLabel className="text-xs font-black text-red-600 uppercase flex items-center justify-between h-8">
                                    <span>Terdampak</span>
                                    {perkiraanDampak === 'Seluruhnya' && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-1">AUTO</span>}
                                </FormLabel>
                                <FormControl>
                                    <AreaInput
                                    field={field}
                                    disabled={perkiraanDampak === 'Seluruhnya'}
                                    className="border-red-200 bg-red-50/50 text-red-700 focus-visible:ring-red-500 dark:bg-red-950/20 dark:border-red-900"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="luas_sisa" render={({ field }) => (
                                <FormItem className="flex flex-col h-full justify-end">
                                <FormLabel className="text-xs font-black text-emerald-600 uppercase flex items-center justify-between h-8">
                                    <span>Sisa Tanah</span>
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">AUTO</span>
                                </FormLabel>
                                <FormControl>
                                    <AreaInput
                                    field={field}
                                    readOnly
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 shadow-inner"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            </div>

                            <FormField control={form.control} name="letak_tanah" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-foreground">Letak Tanah / Alamat Aktual</FormLabel>
                                <FormControl>
                                <div className="relative group">
                                    <Map className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Textarea
                                    placeholder="Masukkan rincian lokasi fisik bidang tanah (RT/RW, Patokan)..."
                                    className="pl-12 resize-y bg-muted/20 focus-visible:bg-background rounded-xl min-h-[100px] p-4 transition-all"
                                    {...field}
                                    />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />
                        </div>

                        {/* BLOK 3: SPESIFIKASI TAMBAHAN */}
                        <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                            <div className="p-1.5 bg-purple-500/10 rounded-md"><LayoutList className="h-4 w-4 text-purple-600" /></div> Status Tambahan
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="perkiraan_dampak" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold text-foreground">Perkiraan Dampak Proyek</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                    <SelectItem value="Sebagian" className="py-3 font-medium">Sebagian (Parsial)</SelectItem>
                                    <SelectItem value="Seluruhnya" className="py-3 font-medium text-red-600">Seluruhnya (Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="pembebanan_hak" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold text-foreground">Status Sengketa / Agunan</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                    <SelectItem value="Bersih" className="py-3 font-medium text-emerald-600">Bersih (Clear)</SelectItem>
                                    <SelectItem value="Diagunkan" className="py-3 font-medium">Sedang Diagunkan Bank</SelectItem>
                                    <SelectItem value="Sengketa" className="py-3 font-medium text-red-600">Dalam Sengketa Hukum</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="ruang_atas_bawah_tanah" render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold text-foreground">Pemanfaatan Ruang</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
                                    <SelectItem value="Bebas" className="py-3 font-medium">Bebas (Tidak Ada Utilitas)</SelectItem>
                                    <SelectItem value="Terpakai" className="py-3 font-medium">Terpakai (Ada SUTET/Pipa)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                            </div>
                        </div>
                        </form>
                    </Form>
                </div>

                {/* --- ROW 3: FOOTER VISUAL --- */}
                <div className="p-6 border-t border-border/50 bg-background flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing} className="rounded-full h-12 px-6 font-bold hover:bg-muted">
                        Batal
                    </Button>
                    <Button type="submit" form="land-detail-form" disabled={(!form.formState.isDirty && !showDraftAlert) || isProcessing} className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        {/* LOGIKA LOADING VISUAL */}
                        {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Menyimpan...
                        </span>
                        ) : (
                        landDetail ? 'Simpan Perubahan' : 'Simpan Detail Tanah'
                        )}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
