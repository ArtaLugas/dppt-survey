<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandStatus extends Model
{
    public $timestamps = false;
    protected $fillable = ['code'];
}
