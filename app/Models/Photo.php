<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Photo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'interview_id',
        'entity_type_id',
        'entity_id',
        'photo_type_id',
        'file_path',
        'caption',
        'taken_at',
        'uploaded_by',
    ];

    protected $casts = [
        'taken_at' => 'datetime',
    ];

    public function interview()
    {
        return $this->belongsTo(Interview::class);
    }

    public function entityType()
    {
        return $this->belongsTo(PhotoEntityType::class, 'entity_type_id');
    }

    public function type()
    {
        return $this->belongsTo(PhotoType::class, 'photo_type_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
