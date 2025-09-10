<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'fullname' => 'Administrator',
            'email' => 'admin@moneymate.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'country' => 'Indonesia',
            'card' => 'Visa',
            'cardnumber' => '1234567890123456',
            'balance' => 0,
            'balance_limit' => 999999999,
            'currency' => 'IDR',
            'profile' => null,
        ]);

        // You can also create additional admin users if needed
        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@moneymate.com');
        $this->command->info('Password: admin123');
    }
}
