<?php

namespace App\Models;

use Exception;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

use function PHPUnit\Framework\returnCallback;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'is_active',
        'role_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(UserRole::class);
    }

    public function parcelsCreated(): HasMany
    {
        return $this->hasMany(Parcel::class, 'surveyor_id');
    }

    // Helper: $user->hasRole('Admin')
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return in_array($this->role->code, $roles);
        }
        return $this->role->code === $roles;
    }

    // --- SECURITY GUARD: PREVENT HARD DELETE ---

    /**
     * Override Laravel's built-in delete() function.
     * Prevent deleting a user if they have data transactions.
     */
    public function delete()
    {
        // Check 1: Has this user created any Parcels?
        if ($this->parcelsCreated()->exists()) {
            // If YES, throw an Error. Do not allow deletion.
            throw new Exception(
                "ERROR: User '{$this->name}' has created Parcels. Data will be corrupted if deleted." .
                "Please change the status to 'Non-Active' (is_active = false) instead."
            );
        }

        return parent::delete();
    }
}
