<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = ['password'];

    public function role()
    {
        return $this->belongsTo(UserRole::class);
    }

    public function createdInterviews()
    {
        return $this->hasMany(Interview::class, 'created_by');
    }
}
