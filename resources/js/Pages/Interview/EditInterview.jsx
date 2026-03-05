import { router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

// Komponen UI
import { DashboardLayout } from '@/Components/Layout/DashboardLayout';
import { InterviewForm } from '@/Components/interview/InterviewForm';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/Dashboard/StatusBadge';

// Hooks
import { useToast } from '@/hooks/use-toast';

/**
 * @typedef {Object} EditInterviewProps
 * @property {Object} auth - Data user dari middleware Laravel
 * @property {Object} interview - Data bidang yang dikirim dari ParcelController@edit
 */

/**
 * Halaman Edit Interview (Inertia Page)
 * @param {EditInterviewProps} props
 */
export default function EditInterview({ auth, interview }) {
  const { toast } = useToast();

  // Ambil data user secara dinamis
  const user = auth?.user || { name: 'Ahmad Fauzi', role: { code: 'surveyor' } };

  // Guard: Jika data tidak ditemukan (Biasanya ditangani Laravel, tapi ini pengaman di Frontend)
  if (!interview) {
    return (
      <DashboardLayout userName={user.name} userRole={user.role.code}>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Interview Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-4">Interview dengan ID tersebut tidak ada.</p>
          <Button onClick={() => router.visit('/surveyor/interviews')}>Kembali ke Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Cek apakah interview bisa diedit (Hanya jika status 'draft')
  const canEdit = interview.status === 'draft';

  if (!canEdit) {
    return (
      <DashboardLayout userName={user.name} userRole={user.role.code}>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Interview Tidak Dapat Diedit</h1>
          <p className="text-muted-foreground mb-4">
            Interview dengan status <StatusBadge status={interview.status} /> tidak dapat diedit.
          </p>
          <Button onClick={() => router.visit('/surveyor/interviews')}>Kembali ke Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (data) => {
    // Kirim update ke ParcelController@update
    router.put(`/surveyor/interviews/${interview.id}`, data, {
      onSuccess: () => {
        toast({
          title: 'Interview Diperbarui',
          description: 'Perubahan berhasil disimpan.',
        });
      },
      onError: (errors) => {
        toast({
          title: 'Gagal Memperbarui',
          description: Object.values(errors)[0] || 'Terjadi kesalahan.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCancel = () => {
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
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Edit Interview</h1>
              <StatusBadge status={interview.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">ID: {interview.id}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Interview</CardTitle>
            <CardDescription>
              Edit informasi interview. Perubahan akan disimpan sebagai draft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewForm
              mode="edit"
              interview={interview}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
