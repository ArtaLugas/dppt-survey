<?php

namespace App\Enums;

enum InterviewStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Verified = 'verified';
    case Locked = 'locked';

    public function isFinal(): bool
    {
        return $this === self::Locked;
    }
}
