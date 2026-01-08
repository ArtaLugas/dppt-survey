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
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
        });

        Schema::create('interview_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->unsignedInteger('sequence');
            $table->boolean('is_final')->default(false);
        });

        Schema::create('respondent_roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
        });

        Schema::create('gender_types', function (Blueprint $table) {
            $table->id();
            $table->char('code', 1)->unique();
        });

        Schema::create('land_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
        });

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
        });

        Schema::create('photo_entity_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
        });

        Schema::create('photo_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reference_tables');
    }
};
