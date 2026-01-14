<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewSnapshot extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'interview_id',
        'created_by',
        'hash',
        'pdf_path',
        'json_path',
        'created_at',
    ];

    /* ================= RELATIONS ================= */

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /* ================= Immutable Guard ================= */

    protected static function booted()
    {
        static::updating(function () {
            throw new \DomainException('InterviewSnapshot is immutable');
        });

        static::deleting(function () {
            throw new \DomainException('InterviewSnapshot cannot be deleted');
        });
    }
}
