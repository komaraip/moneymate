<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardNameCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'country_code',
        'logo_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active card names
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific country
     */
    public function scopeByCountry($query, $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    /**
     * Get users using this card name
     */
    public function users()
    {
        return $this->hasMany(User::class, 'card_name', 'name');
    }
}
