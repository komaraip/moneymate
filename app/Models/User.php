<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'fullname',
        'name', // Alias for fullname
        'email',
        'password',
        'role',
        'country',
        'card',
        'card_type',
        'card_name',
        'cardnumber',
        'balance',
        'balance_limit',
        'currency',
        'profile',
    ];

    /**
     * Get the user's name attribute.
     * This is an alias for the fullname field to maintain compatibility.
     */
    public function getNameAttribute()
    {
        return $this->fullname;
    }

    /**
     * Set the user's name attribute.
     * This sets the fullname field to maintain compatibility.
     */
    public function setNameAttribute($value)
    {
        $this->attributes['fullname'] = $value;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'decimal:2',
            'balance_limit' => 'decimal:2',
        ];
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the user's country.
     */
    public function countryCategory()
    {
        return $this->belongsTo(CountryCategory::class, 'country');
    }

    /**
     * Get the user's card name (bank).
     */
    public function cardNameCategory()
    {
        return $this->belongsTo(CardNameCategory::class, 'card_name');
    }

    /**
     * Get the user's card type.
     */
    public function cardTypeCategory()
    {
        return $this->belongsTo(CardTypeCategory::class, 'card_type');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is regular user
     */
    public function isUser()
    {
        return $this->role === 'user';
    }

    /**
     * Scope to get only admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope to get only regular users
     */
    public function scopeUsers($query)
    {
        return $query->where('role', 'user');
    }
}
