<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentationPhoto extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $appends = ['url'];

    protected $casts = [
        'latitude' => 'double',
        'longitude' => 'double',
        'accuracy_meters' => 'float',
        'uploaded_at' => 'integer',
        'taken_at' => 'datetime',
    ];
    // Accessor: $photo->url
    // Automatically generate the URL from storage
    public function getUrlAttribute()
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    public function parcel(): BelongsTo
    {
        return $this->belongsTo(Parcel::class, 'parcel_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(PhotoType::class, 'photo_type_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($photo) {
            if ($photo->file_path && Storage::disk('public')->exists($photo->file_path)) {
                Storage::disk('public')->delete($photo->file_path);
            }
        });
    }
}
