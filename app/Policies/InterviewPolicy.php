<?php

namespace App\Policies;

use App\Models\Interview;
use App\Models\User;

class InterviewPolicy
{
    /**
     * Semua role yang login boleh melihat interview
     */
    public function view(User $user, Interview $interview): bool
    {
        return true;
    }

    /**
     * Semua role boleh membuat interview
     */
    public function create(User $user): bool
    {
        return in_array($user->role->code, ['surveyor', 'koordinator', 'admin'], true);
    }

    /**
     * Update data interview (BUKAN transisi status)
     */
    public function update(User $user, Interview $interview): bool
    {
        // HARD STOP: LOCKED = read-only absolut
        if ($interview->isLocked()) {
            return false;
        }

        $status = $interview->status->code;
        $role   = $user->role->code;

        return match ($role) {
            // Surveyor: hanya sampai submitted
            'surveyor' => in_array($status, ['draft', 'submitted'], true),

            // Koordinator: sampai verified
            'koordinator' => in_array($status, ['draft', 'submitted', 'verified'], true),

            // Admin: semua sebelum locked
            'admin' => true,

            default => false,
        };
    }

    /**
     * Submit interview (draft -> submitted)
     */
    public function submit(User $user, Interview $interview): bool
    {
        return $user->role->code === 'surveyor'
            && $interview->status->code === 'draft'
            && ! $interview->isLocked();
    }

    /**
     * Verify interview (submitted -> verified)
     */
    public function verify(User $user, Interview $interview): bool
    {
        return in_array($user->role->code, ['koordinator', 'admin'], true)
            && $interview->status->code === 'submitted'
            && ! $interview->isLocked();
    }

    /**
     * Lock interview (verified -> locked)
     */
    public function lock(User $user, Interview $interview): bool
    {
        return $user->role->code === 'admin'
            && $interview->status->code === 'verified'
            && ! $interview->isLocked();
    }

    /**
     * Soft delete interview (hanya sebelum locked)
     */
    public function delete(User $user, Interview $interview): bool
    {
        return ! $interview->isLocked();
    }
}
