import { router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

// Komponen UI
import { DashboardLayout } from '@/Components/Layout/DashboardLayout';
import { InterviewForm } from '@/Components/interview/InterviewForm';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

// Hooks
import { useToast } from '@/hooks/use-toast';

/**
 * @typedef {Object} CreateInterviewProps
 * @property {Object} auth - Data autentikasi dari Laravel
 */

/**
 * Halaman Create Interview (Inertia Page)
 * @param {CreateInterviewProps} props
 */
export default function CreateInterview({ auth }) {
  const { toast } = useToast();

  // Mengambil data user secara dinamis dari props Inertia
  const user = auth?.user || { name: 'Guest', role: 'surveyor' };

  const handleSubmit = (data) => {
    // Di Laravel Inertia, kita mengirim data ke rute POST yang ada di web.php
    router.post('/surveyor/interviews', data, {
      onStart: () => {
        console.log('Memulai pembuatan interview...');
      },
      onSuccess: () => {
        toast({
          title: 'Interview Dibuat',
          description: 'Interview baru berhasil disimpan sebagai draft.',
        });
      },
      onError: (errors) => {
        toast({
          title: 'Gagal Menyimpan',
          description: Object.values(errors)[0] || 'Terjadi kesalahan sistem.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleCancel = () => {
    // Navigasi Inertia ke halaman indeks
    router.visit('/surveyor/interviews');
  };

  return (
    <DashboardLayout userName={user.name} userRole={user.role.code}>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Buat Interview Baru</h1>
            <p className="text-muted-foreground mt-1">
              Isi data interview untuk disimpan sebagai draft
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Interview</CardTitle>
            <CardDescription>
              Lengkapi informasi berikut untuk membuat interview baru.
              Interview akan disimpan sebagai draft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
