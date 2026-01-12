<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\DocumentType;
use App\Models\LandAsset;
use App\Models\User;

class LandDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'land_asset_id',
        'document_type_id',
        'uploaded_by',
        'file_path',
    ];

    public function landAsset()
    {
        return $this->belongsTo(LandAsset::class);
    }

    public function type()
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
