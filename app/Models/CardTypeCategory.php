<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardTypeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'logo_url',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active card types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get users using this card type
     */
    public function users()
    {
        return $this->hasMany(User::class, 'card_type', 'name');
    }
}
