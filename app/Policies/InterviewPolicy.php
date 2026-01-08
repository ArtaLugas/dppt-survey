<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Interview;

class InterviewPolicy
{
    public function update(User $user, Interview $interview): bool
    {
        return true;
    }

    public function lock(User $user, Interview $interview): bool
    {
        return $user->role->code === 'admin';
    }
}
