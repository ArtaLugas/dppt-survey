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
        // ======================================================================
        // 1. MASTER DATA
        // ======================================================================

        // User Roles
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('label');
        });

        // Parcel Statuses
        Schema::create('parcel_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label')->nullable();
        });

        // Respondent Roles
        Schema::create('respondent_roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label')->nullable();
        });

        // Land Statuses
        Schema::create('land_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
        });

        // Photo Types
        Schema::create('photo_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->integer('min_qty')->default(1);
            $table->string('label');
        });

        // ======================================================================
        // 2. USERS AUTHENTIACTION & SYSTEM
        // ======================================================================

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            // Foreign Key
            $table->foreignId('role_id')->constrained('user_roles')->onDelete('restrict');

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity')->index();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_resets');
        Schema::dropIfExists('users');
        Schema::dropIfExists('photo_types');
        Schema::dropIfExists('land_statuses');
        Schema::dropIfExists('respondent_roles');
        Schema::dropIfExists('parcel_statuses');
        Schema::dropIfExists('user_roles');
    }
};
