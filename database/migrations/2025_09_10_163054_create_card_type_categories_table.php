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
        Schema::create('card_type_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Card type name (e.g., Visa, Mastercard, GPN)
            $table->string('description')->nullable();
            $table->string('logo_url')->nullable(); // Card type logo URL
            $table->string('color', 7)->default('#6B7280'); // Brand color
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_type_categories');
    }
};
