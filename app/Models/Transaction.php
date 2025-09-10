<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'balance',
        'description',
        'type',
        'transaction_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the income category for this transaction (if type is income).
     */
    public function incomeCategory()
    {
        return $this->belongsTo(IncomeCategory::class, 'category');
    }

    /**
     * Get the outcome category for this transaction (if type is expense).
     */
    public function outcomeCategory()
    {
        return $this->belongsTo(OutcomeCategory::class, 'category');
    }

    /**
     * Get the category based on transaction type.
     */
    public function getCategory()
    {
        if ($this->type === 'income') {
            return $this->incomeCategory;
        } else {
            return $this->outcomeCategory;
        }
    }

    /**
     * Scope for income transactions.
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Scope for expense transactions.
     */
    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }
}
