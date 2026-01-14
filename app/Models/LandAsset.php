<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\LandStatus;

class LandAsset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'interview_id',
        'nib',
        'desa',
        'rt_rw',
        'kecamatan',
        'kabupaten_provinsi',
        'land_status_id',
        'luas_terdampak',
    ];

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }

    public function status()
    {
        return $this->belongsTo(LandStatus::class, 'land_status_id');
    }

    public function documents()
    {
        return $this->hasMany(LandDocument::class);
    }
}
