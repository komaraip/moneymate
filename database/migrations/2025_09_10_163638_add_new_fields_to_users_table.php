<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('card_type')->nullable()->after('card'); // Card type (Visa, Mastercard, GPN)
            $table->string('card_name')->nullable()->after('card_type'); // Bank name (BCA, Mandiri, BNI)
            // Note: country field already exists, but we might need to update its structure later
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['card_type', 'card_name']);
        });
    }
};
