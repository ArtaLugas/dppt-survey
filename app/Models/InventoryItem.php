<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Parcel;

class InventoryItem extends Model
{
    protected $guarded = ['id'];
    public $timestamps = false;

    // Ensuring consistency of category
    // public const CATEGORY = ['BANGUNAN', 'TANAMAN', 'BENDA_LAIN'];
    public function parcel(): BelongsTo
    {
        return $this->belongsTo(Parcel::class);
    }
}
