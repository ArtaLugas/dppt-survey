import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  User, Fingerprint, MapPin, Briefcase, Phone,
  ShieldCheck, UserPlus, Info, Star, AlertTriangle, Loader2
} from 'lucide-react';

import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- SCHEMA VALIDATION ---
const formSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  role_id: z.number().min(1, 'Peran wajib dipilih'),
  isPrimary: z.boolean().default(false),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  tempatLahir: z.string().optional().default(''),
  tanggalLahir: z.string().optional().default(''),
  pekerjaan: z.string().optional().default(''),
  alamatKtp: z.string().optional().default(''),
  noTelepon: z.string().optional().default(''),
});

// PERBAIKAN: Wajib menerima parcelId untuk kunci brankas LocalStorage
export function RespondentDialog({ open, onOpenChange, parcelId, respondent, respondentRoles = [], onSubmit, isProcessing }) {
  // 1. Kunci Brankas
  const storageKey = `draft_respondent_${parcelId || 'new'}_${respondent?.id || 'new'}`;
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '', role_id: 1, isPrimary: false, nik: '', tempatLahir: '',
      tanggalLahir: '', pekerjaan: '', alamatKtp: '', noTelepon: '',
    },
  });

  // 2. LOGIKA PENANGKAP DATA (DB VS LOKAL)
    useEffect(() => {
        if (open) {
            const isTrue = (val) => (val === true || val === 1 || String(val) === 1 || val === 't' || val === 'true');
            const rawRoleId = respondent?.role_id || respondent?.roleid || respondent?.roleId || respondent?.role?.id || 1;
            const rawPrimary = respondent?.is_primary ?? respondent?.isprimary ?? respondent?.isPrimary;
            const rawDate = respondent?.tanggal_lahir || respondent?.tanggalLahir || '';
            const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;

            const dbValues = {
                nama: respondent?.nama || respondent?.name || '',
                role_id: Number(rawRoleId), // Sekarang pasti tertangkap
                isPrimary: isTrue(rawPrimary),
                nik: respondent?.nik || '',
                tempatLahir: respondent?.tempat_lahir || respondent?.tempatLahir || '',
                tanggalLahir: cleanDate,
                pekerjaan: respondent?.pekerjaan || '',
                alamatKtp: respondent?.alamat_ktp || respondent?.alamatKtp || '',
                noTelepon: respondent?.no_telepon || respondent?.noTelepon || '',
            };

            let initialValues = { ...dbValues };
            let hasDraft = false;

            // Cek Brankas
            try {
                const saved = window.localStorage.getItem(storageKey);
                if (saved) {
                const parsed = JSON.parse(saved);
                if (JSON.stringify(parsed) !== JSON.stringify(dbValues)) {
                    initialValues = parsed;
                    hasDraft = true;
                }
                }
            } catch (e) { console.warn('Gagal membaca draf lokal', e); }

            setShowDraftAlert(hasDraft);
            form.reset(initialValues);
            } else {
            // Reset saat dialog ditutup
            form.reset({
                nama: '', role_id: 1, isPrimary: false, nik: '', tempatLahir: '',
                tanggalLahir: '', pekerjaan: '', alamatKtp: '', noTelepon: '',
            });
            setShowDraftAlert(false);
        }
    }, [respondent, form, open, storageKey]);

  // 3. ENGINE AUTO-SAVE (Merekam ketikan setiap 500ms)
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
    // Mapping data form kembali ke format Database
    const submitPayload = {
      nama: values.nama,
      role_id: values.role_id,
      is_primary: values.isPrimary,
      nik: values.nik,
      tempat_lahir: values.tempatLahir,
      tanggal_lahir: values.tanggalLahir,
      pekerjaan: values.pekerjaan,
      alamat_ktp: values.alamatKtp,
      no_telepon: values.noTelepon,
    };

    onSubmit(submitPayload, {
      onSuccess: () => {
        // Hapus brankas karena berhasil disave ke DB
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
                <div className="bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 border-b border-border/50 flex gap-5 items-center">
                    <div className="h-14 w-14 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        {respondent ? <User className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
                    </div>
                <div>
                    <DialogTitle className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                    {respondent ? 'Edit Data Responden' : 'Daftarkan Responden'}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium mt-1 text-muted-foreground">
                    {respondent ? 'Perbarui informasi detail identitas di bawah ini.' : 'Isi identitas lengkap sesuai KTP untuk keperluan validasi legal.'}
                    </DialogDescription>
                </div>
                </div>

                {/* --- ROW 2: FORM BODY (Area Scroll Aktif) --- */}
                <div className="overflow-y-auto p-6 md:p-8 space-y-6">

                {/* ALERT DRAF LOKAL */}
                {showDraftAlert && (
                    <Alert className="rounded-2xl border-2 bg-amber-50 border-amber-200 text-amber-800 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div className="ml-2">
                        <AlertTitle className="font-bold text-sm">Draf Dipulihkan!</AlertTitle>
                        <AlertDescription className="text-xs mt-1 font-medium">
                        Ketikan Anda sebelumnya berhasil diselamatkan dari memori browser.
                        </AlertDescription>
                    </div>
                    </Alert>
                )}

                <Form {...form}>
                    <form id="respondent-form" onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {console.error("Zod memblokir submit. Error:", errors);
                        alert("Gagal menyimpan! Silahkan scroll ke atas dan di periksa kolom yang berwarna merah.");})} className="space-y-8">

                    {/* BLOK 1: KAPASITAS & PERAN */}
                    <div className="bg-muted/30 border border-border/60 p-5 rounded-[1.5rem] space-y-5">
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md"><ShieldCheck className="h-4 w-4 text-primary" /></div> Kapasitas & Peran
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="role_id" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-bold text-foreground">Status Peran Utama</FormLabel>
                            {/* Konversi value yang benar untuk Shadcn Select */}
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                                <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-background border-border/50 focus:ring-primary/20">
                                    <SelectValue placeholder="Pilih kapasitas peran" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl">
                                    {respondentRoles.length > 0 ? (
                                        respondentRoles.map((role) => (
                                        <SelectItem
                                            key={role.id}
                                            value={String(role.id)} // Shadcn butuh String
                                            className="font-medium py-3 cursor-pointer"
                                        >
                                            {/* Prioritaskan 'label', jika null gunakan 'code' */}
                                            {role.label || role.code || `Role ${role.id}`}
                                        </SelectItem>
                                        ))
                                    ) : (
                                        <div className="py-3 px-2 text-sm text-muted-foreground text-center font-medium">
                                        Memuat peran...
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="isPrimary" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-amber-200/50 bg-amber-50 dark:bg-amber-950/10 p-4 shadow-sm h-[84px]">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2 cursor-pointer">
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Wakil Utama
                                </FormLabel>
                                <FormDescription className="text-xs text-amber-700 dark:text-amber-600/70">
                                Jadikan sebagai perwakilan utama bidang.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white rounded-md" />
                            </FormControl>
                            </FormItem>
                        )} />
                        </div>
                    </div>

                    {/* BLOK 2: IDENTITAS UTAMA */}
                    <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-md"><Fingerprint className="h-4 w-4 text-blue-600" /></div> Identitas Personal
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="nama" render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                            <FormLabel className="font-bold text-foreground">Nama Lengkap (Sesuai KTP)</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input placeholder="Masukkan nama lengkap tanpa singkatan" className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="nik" render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                            <FormLabel className="font-bold text-foreground">Nomor Induk Kependudukan (NIK)</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input placeholder="32xxxxxxxxxxxxxx" maxLength={16} className="h-12 pl-12 font-mono text-base tracking-widest rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                </div>
                            </FormControl>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 font-medium">
                                <Info className="h-3 w-3" /> Pastikan 16 digit angka sesuai fisik KTP.
                            </div>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="tempatLahir" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-bold text-foreground">Tempat Lahir</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input placeholder="Kota/Kabupaten" className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="tanggalLahir" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-bold text-foreground">Tanggal Lahir</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <Input type="date" className="h-12 px-4 rounded-xl bg-muted/20 focus-visible:bg-background uppercase transition-all block w-full" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        </div>
                    </div>

                    {/* BLOK 3: KONTAK & ALAMAT */}
                    <div className="bg-card border border-border/60 p-5 rounded-[1.5rem] space-y-5 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 rounded-md"><Phone className="h-4 w-4 text-emerald-600" /></div> Kontak & Domisili
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="pekerjaan" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-bold text-foreground">Pekerjaan Saat Ini</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input placeholder="Wiraswasta, PNS, Petani..." className="h-12 pl-12 rounded-xl bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="noTelepon" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="font-bold text-foreground">No. Telepon / WhatsApp</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input placeholder="08xxxxxxxxxx" type="tel" className="h-12 pl-12 rounded-xl font-mono text-sm bg-muted/20 focus-visible:bg-background transition-all" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="alamatKtp" render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                            <FormLabel className="font-bold text-foreground">Alamat Sesuai KTP</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan..."
                                className="min-h-[100px] resize-y rounded-xl bg-muted/20 focus-visible:bg-background p-4 leading-relaxed transition-all"
                                {...field}
                                />
                            </FormControl>
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

                <Button
                    type="submit"
                    form="respondent-form"
                    disabled={(!form.formState.isDirty && !showDraftAlert) || isProcessing}
                    className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                    {isProcessing ? 'Menyimpan...' : (respondent ? 'Simpan Perubahan' : 'Daftarkan Responden')}
                </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
