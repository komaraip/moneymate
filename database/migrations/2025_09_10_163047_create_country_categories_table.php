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
        Schema::create('country_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Country name (e.g., Indonesia, Malaysia)
            $table->string('code', 3)->unique(); // ISO 3-letter code (IDN, MYS)
            $table->string('code_2', 2)->unique(); // ISO 2-letter code (ID, MY)
            $table->string('flag_url')->nullable(); // Flag image URL
            $table->string('currency_code', 3)->nullable(); // Default currency
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country_categories');
    }
};
