<?php

namespace App\Services;

use App\Models\Interview;
use App\Models\User;
use App\Support\InterviewStatusResolver;
use DomainException;

final class InterviewStateService
{
    public function __construct(
        private AuditLogService $audit
    ) {}

    public function submit(Interview $interview, User $actor): void
    {
        $this->assertRole($actor, 'surveyor');
        $this->assertStatus($interview, 'draft');

        $interview->update([
            'status_id' => InterviewStatusResolver::id('submitted'),
        ]);

        $this->audit->log($actor, $interview, 'submit_interview');
    }

    public function verify(Interview $interview, User $actor): void
    {
        $this->assertRole($actor, 'koordinator');
        $this->assertStatus($interview, 'submitted');

        $interview->update([
            'status_id' => InterviewStatusResolver::id('verified'),
            'reviewed_by' => $actor->id,
            'review_started_at' => now(),
        ]);

        $this->audit->log($actor, $interview, 'verify_interview');
    }

    public function lock(Interview $interview, User $actor): void
    {
        $this->assertRole($actor, 'admin');
        $this->assertStatus($interview, 'verified');

        $interview->update([
            'status_id' => InterviewStatusResolver::id('locked'),
        ]);

        $this->audit->log($actor, $interview, 'lock_interview');
    }

    /* ================= GUARDS ================= */

    private function assertRole(User $user, string $role): void
    {
        if ($user->role->code !== $role) {
            throw new DomainException("Role {$role} required");
        }
    }

    private function assertStatus(Interview $interview, string $status): void
    {
        if ($interview->status->code !== $status) {
            throw new DomainException("Interview must be {$status}");
        }
    }
}
