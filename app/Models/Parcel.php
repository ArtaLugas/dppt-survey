<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class Parcel extends Model
{
    // Prevent Mass Assignment Exception
    protected $guarded = ['id'];

    // Cast data types for Postgres
    protected $casts = [
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function status(): BelongsTo
    {
        return $this->belongsTo(ParcelStatus::class, 'status_id');
    }

    public function surveyor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'surveyor_id');
    }

    public function koordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'koordinator_id');
    }

    public function landDetail(): HasOne
    {
        return $this->hasOne(LandDetail::class, 'parcel_id');
    }

    public function respondents(): HasMany
    {
        return $this->hasMany(Respondent::class, 'parcel_id');
    }

    public function primaryRespondent(): HasOne
    {
        return $this->hasOne(Respondent::class, 'parcel_id')->where('is_primary', true);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(DocumentationPhoto::class, 'parcel_id');
    }

    protected $appends = ['submission_readiness'];

    // --- Logic: The Golden Ruler 1-2-3 (Photo Validation) ---
    public function getSubmissionReadinessAttribute(): array
    {
        $photos = $this->photos;

        $counts = [
            'ktp' => $photos->where('photo_type_id', 1)->count(),
            'alas_hak' => $photos->where('photo_type_id', 2)->count(),
            'aset' => $photos->where('photo_type_id', 3)->count(),
        ];

        $rules = [
            'ktp' => 1,
            'alas_hak' => 2,
            'aset' => 3,
        ];

        $errors = [];

        if ($counts['ktp'] < $rules['ktp']) {
            $errors[] = "Kurang" . ($rules['ktp'] - $counts['ktp']) . " Foto KTP.";
        }
        if ($counts['alas_hak'] < $rules['alas_hak']) {
            $errors[] = "Kurang" . ($rules['alas_hak'] - $counts['alas_hak']) . " Foto Alas Hak.";
        }
        if ($counts['aset'] < $rules['aset']) {
            $errors[] = "Kurang" . ($rules['aset'] - $counts['aset']) . " Foto Aset.";
        }

        return [
            'is_ready' => empty($errors),
            'errors' => $errors,
            'counts' => $counts,
            'rules' => $rules,
        ];
    }

    protected static function booted()
    {
        static::deleting(function ($parcel) {
            $photos = $parcel->photos()->get();

            foreach ($photos as $photo) {
                if (!empty($photo->file_path) && Storage::disk('public')->exists($photo->file_path)) {
                    Storage::disk('public')->delete($photo->file_path);
                }
            }
        });
    }
}
