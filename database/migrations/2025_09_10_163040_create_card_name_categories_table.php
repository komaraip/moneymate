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
        Schema::create('card_name_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Bank name (e.g., BCA, Mandiri, BNI)
            $table->string('description')->nullable();
            $table->string('country_code', 3)->default('IDN'); // Country code
            $table->string('logo_url')->nullable(); // Bank logo URL
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_name_categories');
    }
};
