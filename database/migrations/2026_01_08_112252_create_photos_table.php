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
        Schema::create('photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('interview_id')
                ->constrained('interviews')
                ->cascadeOnDelete();

            $table->foreignId('entity_type_id')
                ->constrained('photo_entity_types')
                ->restrictOnDelete();

            $table->unsignedBigInteger('entity_id');

            $table->foreignId('photo_type_id')
                ->constrained('photo_types')
                ->restrictOnDelete();

            $table->string('file_path');
            $table->string('caption')->nullable();
            $table->timestamp('taken_at')->nullable();

            $table->foreignId('uploaded_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
