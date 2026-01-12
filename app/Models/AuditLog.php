<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Interview;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'interview_id',
        'action',
        'change_type',
        'entity_type',
        'entity_id',
        'created_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }
}
