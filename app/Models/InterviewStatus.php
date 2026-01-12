<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InterviewStatus extends Model
{
    public $timestamps = false;
    protected $fillable = ['code', 'sequence', 'is_final'];
}
