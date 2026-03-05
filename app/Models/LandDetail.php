<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandDetail extends Model
{
    public $timestamps = false; // This table not have timestamps
    protected $guarded = ['id'];

    protected $casts = [
        // IMPORTANT: Postgres returns decimal as a string
        // We force it to be a float/double so that we can perform mathematical calculations on it
        'luas_surat' => 'double',
        'luas_ukur' => 'double',
        'luas_terdampak' => 'double',
        'luas_sisa' => 'double',
    ];


    public function parcel(): BelongsTo
    {
        return $this->belongsTo(Parcel::class);
    }

    public function statusTanah(): BelongsTo
    {
        return $this->belongsTo(LandStatus::class, 'status_tanah_id');
    }
}
