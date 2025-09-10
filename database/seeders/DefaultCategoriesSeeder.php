<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\IncomeCategory;
use App\Models\OutcomeCategory;

class DefaultCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default income categories
        $incomeCategories = [
            [
                'name' => 'Salary',
                'description' => 'Regular monthly salary from employment',
                'icon' => 'fas fa-wallet',
                'color' => '#10B981',
                'is_active' => true,
            ],
            [
                'name' => 'Freelancing',
                'description' => 'Income from freelance work and consulting',
                'icon' => 'fas fa-laptop-code',
                'color' => '#3B82F6',
                'is_active' => true,
            ],
            [
                'name' => 'Investment',
                'description' => 'Returns from investments, dividends, and interest',
                'icon' => 'fas fa-chart-line',
                'color' => '#8B5CF6',
                'is_active' => true,
            ],
            [
                'name' => 'Business Income',
                'description' => 'Revenue from business operations',
                'icon' => 'fas fa-building',
                'color' => '#F59E0B',
                'is_active' => true,
            ],
            [
                'name' => 'Bonus',
                'description' => 'Work bonus, performance incentives, and rewards',
                'icon' => 'fas fa-gift',
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Gift',
                'description' => 'Money received as gifts or donations',
                'icon' => 'fas fa-heart',
                'color' => '#EC4899',
                'is_active' => true,
            ],
            [
                'name' => 'Other Income',
                'description' => 'Miscellaneous income sources',
                'icon' => 'fas fa-plus-circle',
                'color' => '#6B7280',
                'is_active' => true,
            ],
        ];

        foreach ($incomeCategories as $category) {
            IncomeCategory::create($category);
        }

        // Create default outcome categories
        $outcomeCategories = [
            [
                'name' => 'Food & Dining',
                'description' => 'Groceries, restaurants, and food delivery',
                'icon' => 'fas fa-utensils',
                'color' => '#EF4444',
                'is_active' => true,
            ],
            [
                'name' => 'Transportation',
                'description' => 'Gas, public transport, taxi, and vehicle maintenance',
                'icon' => 'fas fa-car',
                'color' => '#F59E0B',
                'is_active' => true,
            ],
            [
                'name' => 'Utilities',
                'description' => 'Electricity, water, internet, and phone bills',
                'icon' => 'fas fa-bolt',
                'color' => '#3B82F6',
                'is_active' => true,
            ],
            [
                'name' => 'Shopping',
                'description' => 'Clothing, electronics, and general shopping',
                'icon' => 'fas fa-shopping-bag',
                'color' => '#EC4899',
                'is_active' => true,
            ],
            [
                'name' => 'Healthcare',
                'description' => 'Medical expenses, pharmacy, and health insurance',
                'icon' => 'fas fa-heart',
                'color' => '#10B981',
                'is_active' => true,
            ],
            [
                'name' => 'Entertainment',
                'description' => 'Movies, games, hobbies, and leisure activities',
                'icon' => 'fas fa-gamepad',
                'color' => '#8B5CF6',
                'is_active' => true,
            ],
            [
                'name' => 'Education',
                'description' => 'Tuition, books, courses, and learning materials',
                'icon' => 'fas fa-graduation-cap',
                'color' => '#059669',
                'is_active' => true,
            ],
            [
                'name' => 'Housing',
                'description' => 'Rent, mortgage, and home maintenance',
                'icon' => 'fas fa-home',
                'color' => '#7C3AED',
                'is_active' => true,
            ],
            [
                'name' => 'Insurance',
                'description' => 'Life, car, health, and other insurance premiums',
                'icon' => 'fas fa-shield-alt',
                'color' => '#0891B2',
                'is_active' => true,
            ],
            [
                'name' => 'Savings',
                'description' => 'Money transferred to savings accounts',
                'icon' => 'fas fa-piggy-bank',
                'color' => '#059669',
                'is_active' => true,
            ],
            [
                'name' => 'Investment',
                'description' => 'Money invested in stocks, bonds, or other instruments',
                'icon' => 'fas fa-chart-line',
                'color' => '#7C2D12',
                'is_active' => true,
            ],
            [
                'name' => 'Other Expenses',
                'description' => 'Miscellaneous expenses',
                'icon' => 'fas fa-ellipsis-h',
                'color' => '#6B7280',
                'is_active' => true,
            ],
        ];

        foreach ($outcomeCategories as $category) {
            OutcomeCategory::create($category);
        }

        $this->command->info('Default categories created successfully!');
        $this->command->info('Created ' . count($incomeCategories) . ' income categories');
        $this->command->info('Created ' . count($outcomeCategories) . ' outcome categories');
    }
}
