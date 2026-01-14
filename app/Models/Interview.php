<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Interview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nomor_peta_index',
        'nomor_bidang',
        'lokasi_wawancara',
        'tanggal_wawancara',
        'waktu_wawancara',
        'nama_pewawancara',
        'status_id',
        'created_by',
        'review_started_at',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'tanggal_wawancara' => 'date',
        'waktu_wawancara' => 'datetime:H:i',
        'review_started_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    // ================= RELATIONS =================

    public function status()
    {
        return $this->belongsTo(InterviewStatus::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function respondents()
    {
        return $this->hasMany(Respondent::class);
    }

    public function landAssets()
    {
        return $this->hasMany(LandAsset::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function snapshots()
    {
        return $this->hasMany(InterviewSnapshot::class);
    }
    // ================= PASIVE HELPERS =================

    public function isLocked(): bool
    {
        return $this->status?->is_final === true;
    }
}
