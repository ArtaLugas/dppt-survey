import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Layers, FileText, Calculator, CheckCircle2,
  Tag, Box, Type, AlignLeft, AlertTriangle, Loader2
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// --- KONSTANTA LOKAL ---
const KATEGORI_ASET = [
  { value: 'BANGUNAN', label: 'Bangunan / Struktur' },
  { value: 'TANAMAN', label: 'Tanaman / Pohon' },
  { value: 'BENDA_LAIN', label: 'Benda Lainnya' }
];

const KONDISI_ASET = ['Baik', 'Rusak Ringan', 'Rusak Berat'];
const SATUAN_ASET = ['m²', 'm', 'Unit', 'Batang', 'Rumpun', 'Titik', 'Hektar'];

// --- SCHEMA ---
const formSchema = z.object({
  category: z.string().min(1, 'Kategori wajib dipilih'),
  jenis_item: z.string().min(1, 'Jenis item wajib diisi'),
  spesifikasi: z.string().optional(),
  jumlah: z.coerce.number().min(0.01, 'Jumlah harus lebih dari 0'),
  satuan: z.string().min(1, 'Satuan wajib dipilih'),
  kondisi: z.string().min(1, 'Kondisi wajib dipilih'),
  keterangan: z.string().optional(),
});

// =====================================================================
// KOMPONEN HELPER: SUPERIOR QTY INPUT
// =====================================================================
const QtyInput = ({ field, disabled, className }) => (
  <div className="relative group w-full">
    <Input
      type="text"
      inputMode="decimal"
      className={cn(
        "h-12 text-right font-mono text-lg tracking-wider rounded-xl transition-all w-full font-semibold",
        "bg-white focus-visible:bg-white shadow-sm",
        className
      )}
      value={field.value}
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
    />
  </div>
);

// =====================================================================
// KOMPONEN UTAMA DIALOG
// =====================================================================
export function InventoryItemDialog({ open, onOpenChange, parcelId, item, defaultCategory, onSubmit, isProcessing }) {
  // 1. Kunci Brankas (Membedakan Item Baru dan Edit)
  const storageKey = `draft_inventory_${parcelId || 'new'}_${item?.id || 'new'}`;
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: defaultCategory || 'BANGUNAN',
      jenis_item: '', spesifikasi: '', jumlah: 1, satuan: 'm²', kondisi: 'Baik', keterangan: '',
    },
  });

  const selectedCategory = form.watch('category');

  // Smart Logic: Auto Set Satuan berdasarkan kategori (Hanya saat form baru/create)
  useEffect(() => {
    if (!item && open) {
      if (selectedCategory === 'BANGUNAN') form.setValue('satuan', 'm²');
      if (selectedCategory === 'TANAMAN') form.setValue('satuan', 'Batang');
      if (selectedCategory === 'BENDA_LAIN') form.setValue('satuan', 'Unit');
    }
  }, [selectedCategory, item, open, form]);

  // 2. LOGIKA PENGAMBILAN DATA AWAL (DB VS LOCAL STORAGE)
  useEffect(() => {
    if (open) {
      const dbValues = {
        category: item?.category || defaultCategory || 'BANGUNAN',
        jenis_item: item?.jenis_item || item?.jenisItem || '',
        spesifikasi: item?.spesifikasi || '',
        jumlah: parseFloat(item?.jumlah) || 1,
        satuan: item?.satuan || (defaultCategory === 'TANAMAN' ? 'Batang' : (defaultCategory === 'BANGUNAN' ? 'm²' : 'Unit')),
        kondisi: item?.kondisi || 'Baik',
        keterangan: item?.keterangan || '',
      };

      let initialValues = { ...dbValues };
      let hasDraft = false;

      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (JSON.stringify(parsed) !== JSON.stringify(dbValues)) {
            initialValues = parsed;
            hasDraft = true;
          }
        }
      } catch (e) {
        console.warn('Gagal membaca draf lokal inventaris', e);
      }

      setShowDraftAlert(hasDraft);
      form.reset(initialValues);
    } else {
      // Saat dialog tertutup, reset form ke kondisi awal (kosong)
      form.reset({
        category: defaultCategory || 'BANGUNAN',
        jenis_item: '', spesifikasi: '', jumlah: 1,
        satuan: defaultCategory === 'TANAMAN' ? 'Batang' : (defaultCategory === 'BANGUNAN' ? 'm²' : 'Unit'),
        kondisi: 'Baik', keterangan: '',
      });
      setShowDraftAlert(false);
    }
  }, [item, form, open, defaultCategory, storageKey]);

  // 3. ENGINE AUTO-SAVE
  useEffect(() => {
    if (!open) return;
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      }, 500);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, open, storageKey]);

  // 4. INTERSEPTOR SUBMIT
  const handleFormSubmit = (values) => {
    onSubmit(values, {
      onSuccess: () => {
        // Hapus draf hanya jika simpan berhasil
        window.localStorage.removeItem(storageKey);
        setShowDraftAlert(false);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden bg-background rounded-[2rem] border-none shadow-2xl grid grid-rows-[auto_1fr_auto] max-h-[90vh]">

        {/* --- ROW 1: HEADER VISUAL --- */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-background to-background p-6 md:p-8 border-b border-border/50 flex gap-5 items-center shrink-0">
          <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <DialogTitle className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              {item ? 'Edit Aset Tanah' : 'Registrasi Aset Baru'}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1 text-muted-foreground">
              Catat detail spesifikasi, kondisi fisik, dan kuantitas inventaris di atas bidang tanah.
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
                  Ketikan terakhir Anda pada aset ini berhasil dikembalikan. Silakan periksa dan klik Simpan.
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Form {...form}>
            <form id="inventory-item-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">

              {/* BLOK 1: KLASIFIKASI & KONDISI */}
              <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <div className="p-1.5 bg-slate-500/10 rounded-md"><Tag className="h-4 w-4 text-slate-600" /></div> Klasifikasi Dasar
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kategori */}
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground">Kategori Aset</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-indigo-500/20">
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {KATEGORI_ASET.map((c) => (
                            <SelectItem key={c.value} value={c.value} className="py-3 font-medium">
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* KONDISI (Telah Dikembalikan) */}
                  <FormField control={form.control} name="kondisi" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground">Kondisi Fisik Saat Ini</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/20 focus:ring-indigo-500/20">
                            <SelectValue placeholder="Pilih kondisi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {KONDISI_ASET.map((k) => (
                            <SelectItem key={k} value={k} className="py-3 font-medium">
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* BLOK 2: IDENTITAS ASET */}
              <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-md"><Box className="h-4 w-4 text-blue-600" /></div> Rincian Objek
                </h4>

                <div className="grid grid-cols-1 gap-6">
                  <FormField control={form.control} name="jenis_item" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground">Nama / Jenis Aset</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Type className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-indigo-600 transition-colors" />
                          <Input placeholder="Cth: Rumah Permanen, Pohon Kelapa Sawit, Sumur Bor" className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="spesifikasi" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground flex justify-between items-center">
                        Spesifikasi Material / Dimensi
                        <span className="text-[10px] font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">Opsional</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <AlignLeft className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-indigo-600 transition-colors" />
                          <Input placeholder="Cth: Dinding bata merah, Atap seng, Umur 5 thn" className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* BLOK 3: KUANTITAS & PENGUKURAN */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 p-5 rounded-[1.5rem] space-y-5">
                 <h4 className="text-sm font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-md"><Calculator className="h-4 w-4 text-indigo-700 dark:text-indigo-400" /></div> Pengukuran Kuantitas
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  <FormField control={form.control} name="jumlah" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-indigo-900 dark:text-indigo-400">Volume / Jumlah</FormLabel>
                      <FormControl>
                        <QtyInput field={field} className="border-indigo-200 text-indigo-900 dark:text-indigo-300 dark:border-indigo-800 focus-visible:ring-indigo-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="satuan" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-indigo-900 dark:text-indigo-400">Satuan Ukur</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-background border-indigo-200 dark:border-indigo-800 focus:ring-indigo-500/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {SATUAN_ASET.map((s) => (
                            <SelectItem key={s} value={s} className="py-3 font-medium">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* BLOK 4: KETERANGAN */}
              <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] shadow-sm">
                <FormField control={form.control} name="keterangan" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground">Catatan Tambahan Khusus</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/40 group-focus-within:text-indigo-600 transition-colors" />
                        <Textarea
                          placeholder="Masukkan informasi tambahan yang relevan dengan aset ini (jika ada)..."
                          className="pl-12 resize-y bg-muted/20 focus-visible:bg-background rounded-xl min-h-[100px] p-4 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

            </form>
          </Form>
        </div>

        <div className="p-6 border-t border-border/50 bg-background flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing} className="rounded-full h-12 px-6 font-bold hover:bg-muted">
                Batal
            </Button>
            <Button
                type="submit"
                form="inventory-item-form" // <--- UBAH INI AGAR SAMA DENGAN ID TAG <form>
                disabled={isProcessing}
                className="rounded-full h-12 px-8 font-bold shadow-lg transition-all flex items-center gap-2"
            >
                {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                {isProcessing ? 'Menyimpan...' : (item ? 'Simpan Perubahan' : 'Tambah Aset')}
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
