<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CountryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'code_2',
        'flag_url',
        'currency_code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active countries
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get users from this country
     */
    public function users()
    {
        return $this->hasMany(User::class, 'country', 'name');
    }

    /**
     * Get default currency for this country
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    /**
     * Get card names available in this country
     */
    public function cardNames()
    {
        return $this->hasMany(CardNameCategory::class, 'country_code', 'code');
    }
}
