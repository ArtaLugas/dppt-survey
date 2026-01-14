<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\RespondentRole;

class Respondent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'interview_id',
        'nama',
        'respondent_role_id',
        'gender_id',
        'nik',
        'tanggal_lahir',
        'pekerjaan',
        'alamat_ktp',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }

    public function role()
    {
        return $this->belongsTo(RespondentRole::class, 'respondent_role_id');
    }


    public function gender()
    {
        return $this->belongsTo(GenderType::class);
    }

    protected static function booted()
    {
        static::updating(function ($model) {
            if ($model->interview?->status?->is_final) {
                throw new \DomainException('LOCKED interview is read-only');
            }
        });

        static::deleting(function ($model) {
            if ($model->interview?->status?->is_final) {
                throw new \DomainException('LOCKED interview is read-only');
            }
        });
    }

}
