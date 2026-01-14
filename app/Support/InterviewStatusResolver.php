<?php

namespace App\Support;

use App\Models\InterviewStatus;
use DomainException;

final class InterviewStatusResolver
{
    public static function id(string $code): int
    {
        $status = InterviewStatus::where('code', $code)->first();

        if (!$status) {
            throw new DomainException("Interview status with code '{$code}' not found");
        }

        return $status->id;
    }
}
