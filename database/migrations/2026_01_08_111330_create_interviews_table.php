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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();

            $table->string('nomor_peta_index')->nullable();
            $table->string('nomor_bidang')->nullable();
            $table->text('lokasi_wawancara')->nullable();
            $table->date('tanggal_wawancara')->nullable();
            $table->time('waktu_wawancara')->nullable();
            $table->string('nama_pewawancara')->nullable();

            $table->foreignId('status_id')->constrained('interview_statuses')->restrictOnDelete();

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('review_at')->nullable();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
