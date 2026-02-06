import { useState } from 'react';
import { Eye, Edit, Send, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';

const actionConfigs = {
  submit: {
    title: 'Submit Interview',
    description: 'Are you sure you want to submit this interview for verification? This action cannot be undone.',
    confirmLabel: 'Submit',
    variant: 'default',
  },
  verify: {
    title: 'Verify Interview',
    description: 'Are you sure you want to verify this interview? This confirms the data has been reviewed and is accurate.',
    confirmLabel: 'Verify',
    variant: 'default',
  },
  lock: {
    title: 'Lock Interview',
    description: 'Are you sure you want to lock this interview? Once locked, no further changes can be made. This action is PERMANENT.',
    confirmLabel: 'Lock Interview',
    variant: 'destructive',
  },
};

export function InterviewTable({
  interviews,
  userRole,
  onView,
  onEdit,
  onSubmit,
  onVerify,
  onLock,
  showSurveyor = false,
  showKoordinator = false,
}) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: 'submit',
    interviewId: ''
  });

  const handleAction = (type, interviewId) => {
    setConfirmDialog({ open: true, type, interviewId });
  };

  const handleConfirm = () => {
    const { type, interviewId } = confirmDialog;
    switch (type) {
      case 'submit':
        onSubmit?.(interviewId);
        break;
      case 'verify':
        onVerify?.(interviewId);
        break;
      case 'lock':
        onLock?.(interviewId);
        break;
    }
    setConfirmDialog({ open: false, type: 'submit', interviewId: '' });
  };

  const canEdit = (status) => {
    return userRole === 'surveyor' && status === 'draft';
  };

  const canSubmit = (status) => {
    return userRole === 'surveyor' && status === 'draft';
  };

  const canVerify = (status) => {
    return userRole === 'koordinator' && status === 'submitted';
  };

  const canLock = (status) => {
    return userRole === 'admin' && status === 'verified';
  };

  const isLocked = (status) => status === 'locked';

  const config = actionConfigs[confirmDialog.type];

  return (
    <>
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Interview ID</TableHead>
              {showSurveyor && <TableHead className="font-semibold">Surveyor</TableHead>}
              {showKoordinator && <TableHead className="font-semibold">Koordinator</TableHead>}
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showSurveyor && showKoordinator ? 8 : showSurveyor || showKoordinator ? 7 : 6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No interviews found
                </TableCell>
              </TableRow>
            ) : (
              interviews.map((interview) => (
                <TableRow
                  key={interview.id}
                  className={cn(
                    isLocked(interview.status) && 'bg-muted/30'
                  )}
                >
                  <TableCell className="font-medium">{interview.id}</TableCell>
                  {showSurveyor && <TableCell>{interview.surveyorName}</TableCell>}
                  {showKoordinator && <TableCell>{interview.koordinatorName || '—'}</TableCell>}
                  <TableCell>{interview.location}</TableCell>
                  <TableCell>{interview.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={interview.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {interview.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View - Always available */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(interview.id)}
                        className="h-8 px-2"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      {/* Edit - Surveyor, Draft only */}
                      {canEdit(interview.status) && onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(interview.id)}
                          className="h-8 px-2"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}

                      {/* Submit - Surveyor, Draft only */}
                      {canSubmit(interview.status) && onSubmit && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction('submit', interview.id)}
                          className="h-8 px-2"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}

                      {/* Verify - Koordinator, Submitted only */}
                      {canVerify(interview.status) && onVerify && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction('verify', interview.id)}
                          className="h-8 px-2 bg-[hsl(var(--status-verified))] hover:bg-[hsl(var(--status-verified))]/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}

                      {/* Lock - Admin, Verified only */}
                      {canLock(interview.status) && onLock && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction('lock', interview.id)}
                          className="h-8 px-2"
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Lock
                        </Button>
                      )}

                      {/* Read-only label for locked */}
                      {isLocked(interview.status) && (
                        <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                          READ ONLY
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={config.title}
        description={config.description}
        confirmLabel={config.confirmLabel}
        onConfirm={handleConfirm}
        variant={config.variant}
      />
    </>
  );
}
