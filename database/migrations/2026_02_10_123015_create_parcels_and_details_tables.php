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
        // 1. Parcels (Header Data)
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();

            // Identification (angka)
            $table->string('nomor_peta_index')->unique();
            $table->string('nomor_bidang')->nullable();

            // Visual Header
            $table->string('peruntukan_lahan')->nullable();
            $table->string('tipe_bangunan_major')->nullable();

            // Visual Footer
            $table->text('catatan_lapangan')->nullable();
            $table->text('tindak_lanjut')->nullable();

            // Metadata
            $table->foreignId('status_id')->default(1)->constrained('parcel_statuses');
            $table->foreignId('surveyor_id')->nullable()->constrained('users');
            $table->foreignId('koordinator_id')->nullable()->constrained('users');


            $table->timestamp('verified_at')->nullable();
            $table->text('catatan_revisi')->nullable();

            $table->timestamps();
        });

        // 2. Land Details (One to One)
        Schema::create('land_details', function (Blueprint $table) {
            $table->id();

            // Unique Constraint agar 1 Parcel hanya memiliki 1 Land Details
            $table->foreignId('parcel_id')->unique()->constrained('parcels')->onDelete('cascade');

            // Legalitas
            $table->foreignId('status_tanah_id')->default(1)->constrained('land_statuses');
            $table->string('alas_hak_jenis')->nullable();
            $table->string('alas_hak_nomor')->nullable();
            $table->string('nib')->nullable();

            // Numeric (Decimal) di  Postgres sangat presisi
            $table->decimal('luas_surat', 12, 2)->default(0);

            // Fisik
            $table->decimal('luas_ukur', 12, 2)->default(0);
            $table->decimal('luas_terdampak', 12, 2)->default(0);
            $table->decimal('luas_sisa', 12, 2)->nullable();
            $table->text('letak_tanah')->nullable();

            // Spesifikasi Tambahan
            $table->string('ruang_atas_bawah_tanah')->nullable();
            $table->string('pembebanan_hak')->nullable();
            $table->string('perkiraan_dampak')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('land_details');
        Schema::dropIfExists('parcels');
    }
};
