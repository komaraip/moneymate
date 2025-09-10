<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CardNameCategory;
use App\Models\CountryCategory;
use App\Models\CardTypeCategory;

class DefaultCardCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default countries
        $countries = [
            [
                'name' => 'Indonesia',
                'code' => 'IDN',
                'code_2' => 'ID',
                'currency_code' => 'IDR',
                'is_active' => true,
            ],
            [
                'name' => 'Malaysia',
                'code' => 'MYS',
                'code_2' => 'MY',
                'currency_code' => 'MYR',
                'is_active' => true,
            ],
            [
                'name' => 'Singapore',
                'code' => 'SGP',
                'code_2' => 'SG',
                'currency_code' => 'SGD',
                'is_active' => true,
            ],
            [
                'name' => 'United States',
                'code' => 'USA',
                'code_2' => 'US',
                'currency_code' => 'USD',
                'is_active' => true,
            ],
            [
                'name' => 'United Kingdom',
                'code' => 'GBR',
                'code_2' => 'GB',
                'currency_code' => 'GBP',
                'is_active' => true,
            ],
        ];

        foreach ($countries as $country) {
            CountryCategory::create($country);
        }

        // Create default card types
        $cardTypes = [
            [
                'name' => 'Visa',
                'description' => 'Visa payment network',
                'color' => '#1A1F71',
                'is_active' => true,
            ],
            [
                'name' => 'Mastercard',
                'description' => 'Mastercard payment network',
                'color' => '#EB001B',
                'is_active' => true,
            ],
            [
                'name' => 'GPN',
                'description' => 'Gerbang Pembayaran Nasional - Indonesian national payment network',
                'color' => '#FF6B35',
                'is_active' => true,
            ],
            [
                'name' => 'American Express',
                'description' => 'American Express payment network',
                'color' => '#006FCF',
                'is_active' => true,
            ],
            [
                'name' => 'JCB',
                'description' => 'Japan Credit Bureau payment network',
                'color' => '#0E4C96',
                'is_active' => true,
            ],
        ];

        foreach ($cardTypes as $cardType) {
            CardTypeCategory::create($cardType);
        }

        // Create default Indonesian bank names
        $indonesianBanks = [
            [
                'name' => 'BCA',
                'description' => 'Bank Central Asia',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'Mandiri',
                'description' => 'Bank Mandiri',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'BNI',
                'description' => 'Bank Negara Indonesia',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'BRI',
                'description' => 'Bank Rakyat Indonesia',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'BTN',
                'description' => 'Bank Tabungan Negara',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'CIMB Niaga',
                'description' => 'CIMB Niaga',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'Danamon',
                'description' => 'Bank Danamon',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'Permata',
                'description' => 'Bank Permata',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'OCBC NISP',
                'description' => 'OCBC NISP',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'BSI',
                'description' => 'Bank Syariah Indonesia',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'Mega',
                'description' => 'Bank Mega',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
            [
                'name' => 'Bukopin',
                'description' => 'Bank Bukopin',
                'country_code' => 'IDN',
                'is_active' => true,
            ],
        ];

        foreach ($indonesianBanks as $bank) {
            CardNameCategory::create($bank);
        }

        $this->command->info('Default card categories created successfully!');
        $this->command->info('Created ' . count($countries) . ' countries');
        $this->command->info('Created ' . count($cardTypes) . ' card types');
        $this->command->info('Created ' . count($indonesianBanks) . ' Indonesian banks');
    }
}
