import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Skema validasi menggunakan Zod
const interviewSchema = z.object({
  nomorPetaIndex: z.string()
    .min(1, 'Nomor Peta Index wajib diisi')
    .max(50, 'Nomor Peta Index maksimal 50 karakter'),
  nomorBidang: z.string()
    .min(1, 'Nomor Bidang wajib diisi')
    .max(50, 'Nomor Bidang maksimal 50 karakter'),
  lokasiWawancara: z.string()
    .min(1, 'Lokasi wawancara wajib diisi')
    .max(300, 'Lokasi wawancara maksimal 300 karakter'),
  tanggalWawancara: z.date({ required_error: 'Tanggal wawancara wajib diisi' }),
  waktuWawancara: z.string()
    .min(1, 'Waktu wawancara wajib diisi')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:MM)'),
  namaResponden: z.string()
    .min(1, 'Nama responden wajib diisi')
    .max(100, 'Nama responden maksimal 100 karakter'),
});

/**
 * Komponen Form Wawancara
 * @param {Object} props
 * @param {Object} [props.interview] - Data interview untuk mode edit
 * @param {Function} props.onSubmit - Handler saat form disubmit
 * @param {Function} props.onCancel - Handler saat tombol batal ditekan
 * @param {boolean} [props.isLoading] - Status loading tombol
 * @param {'create' | 'edit'} props.mode - Mode form
 */
export function InterviewForm({ interview, onSubmit, onCancel, isLoading, mode }) {
  // Inisialisasi form tanpa generic type
  const form = useForm({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      nomorPetaIndex: interview?.nomorPetaIndex || '',
      nomorBidang: interview?.nomorBidang || '',
      lokasiWawancara: interview?.lokasiWawancara || interview?.location || '',
      tanggalWawancara: interview?.tanggalWawancara
        ? new Date(interview.tanggalWawancara)
        : interview?.date
          ? new Date(interview.date)
          : undefined,
      waktuWawancara: interview?.waktuWawancara || '',
      namaResponden: interview?.namaResponden || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Identifikasi Bidang */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">Identifikasi Bidang</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nomorPetaIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Peta Index</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor peta index" {...field} />
                  </FormControl>
                  <FormDescription>Nomor referensi pada peta index</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomorBidang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Bidang</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor bidang" {...field} />
                  </FormControl>
                  <FormDescription>Nomor identifikasi bidang tanah</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Detail Wawancara */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">Detail Wawancara</h3>

          <FormField
            control={form.control}
            name="lokasiWawancara"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi Wawancara</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Masukkan lokasi wawancara (alamat lengkap)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Alamat lengkap tempat wawancara dilakukan</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="tanggalWawancara"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Wawancara</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd MMMM yyyy', { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Tanggal pelaksanaan wawancara</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waktuWawancara"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waktu Wawancara</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="time"
                        placeholder="HH:MM"
                        {...field}
                        className="pl-10"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>Waktu mulai wawancara (format 24 jam)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Data Responden */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">Data Responden</h3>

          <FormField
            control={form.control}
            name="namaResponden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Responden</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap responden" {...field} />
                </FormControl>
                <FormDescription>Nama lengkap orang yang diwawancara</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : mode === 'create' ? 'Buat Interview' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
