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
        // Respondents
        Schema::create('respondents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained('parcels')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('respondent_roles');

            $table->boolean('is_primary')->default(false);
            $table->string('name');
            $table->string('nik', 16)->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('pekerjaan')->nullable();
            $table->text('alamat_ktp')->nullable();
            $table->string('no_telepon')->nullable();
            $table->timestamps();
        });

        // Inventory Items
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained('parcels')->onDelete('cascade');

            // Enum used in the application, string used in the database for flexibility
            $table->string('category')->comment('BANGUNAN, TANAMAN, BENDA_LAIN');

            $table->string('jenis_item');
            $table->string('spesifikasi')->nullable();
            $table->integer('jumlah');
            $table->string('satuan')->nullable();
            $table->string('kondisi')->nullable();
            $table->string('keterangan')->nullable();

        });

        // Documentation Photos
        Schema::create('documentation_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained('parcels')->onDelete('cascade');
            $table->foreignId('photo_type_id')->constrained('photo_types');

            $table->text('file_path');
            $table->string('file_name')->nullable();

            $table->text('caption')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();

            // Geotagging
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('accuracy_meters', 8, 2)->nullable();
            $table->timestamp('taken_at')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->string('action');

            // Using JSONB (Binary JSON)
            // Much faster for querying and indexing compared to JSON
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();

            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('documentation_photos');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('respondents');
    }
};
