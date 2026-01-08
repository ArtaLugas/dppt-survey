<?php

namespace App\Enums;

enum UserRole: string
{
    case Surveyor = 'surveyor';
    case Koordinator = 'koordinator';
    case Admin = 'admin';
}
