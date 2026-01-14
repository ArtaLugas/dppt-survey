<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Interview;
use App\Models\User;

final class AuditLogService
{
    public function log(User $user, Interview $interview, string $action): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'interview_id' => $interview->id,
            'action' => $action,
        ]);
    }
}
