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
        'country',
        'card',
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
}
