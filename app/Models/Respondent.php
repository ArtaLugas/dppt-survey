<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Respondent extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'is_primary'        => 'boolean',
        'tanggal_lahir'     => 'date',
        'nik'               => 'string',
        'parcel_id'         => 'integer',
        'role_id'           => 'integer',
    ];

    // ---- Relations ----

    public function role(): BelongsTo
    {
        return $this->belongsTo(RespondentRole::class, 'role_id');
    }

    public function parcel(): BelongsTo
    {
        return $this->belongsTo(Parcel::class);
    }

    /**
     * Membantu Frontend menampilkan Label Role tanpa perlu lookup table terpisah
     * Penggunaan: $respondent->role_label
     */
    public function getRoleLabelAttribute(): string
    {
        return $this->role->label ?? 'Tidak Diketahui';
    }
}
