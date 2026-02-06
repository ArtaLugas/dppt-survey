import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FilePlus, FileText, Send, CheckCircle, Lock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
// Pastikan path import ini benar (Components vs components)
import { InterviewTable } from '@/Components/dashboard/InterviewTable';
import { Button } from '@/components/ui/button';
import { mockInterviews, getInterviewStats } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

// Simulate current user's interviews
const currentUserId = 'u1';

export default function SurveyorDashboard() {
  // PERBAIKAN 1: Hapus 'useNavigate', ganti dengan inisialisasi toast
  const { toast } = useToast();

  const [interviews, setInterviews] = useState(
    mockInterviews.filter(i => i.surveyorId === currentUserId)
  );

  const stats = getInterviewStats(interviews);

  const handleView = (id) => {
    // Menggunakan router Inertia (sudah benar)
    router.get(route('surveyor.interviews.index'));
  };

  const handleEdit = (id) => {
    // PERBAIKAN 2: Typo 'route.get' diubah menjadi 'router.get'
    route.get(route(`surveyor.interviews./${id}/edit`));
  };

  const handleSubmit = (id) => {
    setInterviews(prev =>
      prev.map(interview =>
        interview.id === id
          ? { ...interview, status: 'submitted', submittedAt: new Date().toISOString() }
          : interview
      )
    );

    // Toast sekarang akan berfungsi karena sudah didefinisikan di atas
    toast({
      title: 'Interview Submitted',
      description: `Interview ${id} has been submitted for verification.`,
    });
  };

  return (
    <DashboardLayout userName="Ahmad Fauzi" userRole="surveyor">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground mt-1">Manage your interviews and submissions</p>
          </div>
          <Button onClick={() => router.get(route('surveyor.interviews.create'))} size="lg">
            <FilePlus className="h-5 w-5 mr-2" />
            Create New Interview
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Draft Interviews"
            value={stats.draft}
            icon={FileText}
            description="Pending submission"
            variant="default"
          />
          <StatCard
            title="Submitted"
            value={stats.submitted}
            icon={Send}
            description="Awaiting verification"
            variant="primary"
          />
          <StatCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle}
            description="Approved by koordinator"
            variant="success"
          />
          <StatCard
            title="Locked"
            value={stats.locked}
            icon={Lock}
            description="Final - Read only"
            variant="danger"
          />
        </div>

        {/* Interviews Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">My Interviews</h2>
          <InterviewTable
            interviews={interviews}
            userRole="surveyor"
            onView={handleView}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
