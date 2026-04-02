<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ParcelStatus;
use Illuminate\Support\Facades\DB;

class ParcelStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Definisikan ID secara eksplisit untuk menjamin konsistensi relasi di seluruh sistem
        $statuses = [
            ['id' => 1, 'code' => 'draft', 'label' => 'Draft / Revisi'],
            ['id' => 2, 'code' => 'submitted', 'label' => 'Submitted (Menunggu Verifikasi)'],
            ['id' => 3, 'code' => 'verified', 'label' => 'Verified (Telah Diverifikasi)'],
            ['id' => 4, 'code' => 'locked', 'label' => 'Locked (Dokumen Final)'],

            // --- STATUS BARU UNTUK JEJAK AUDIT ---
            ['id' => 5, 'code' => 'cancelled', 'label' => 'Cancelled (Dibatalkan)'],
            ['id' => 6, 'code' => 'revision', 'label' => 'Butuh Revisi Koordinator'],
        ];

        // 2. Eksekusi penyimpanan (Aman dari duplikasi)
        foreach ($statuses as $status) {
            ParcelStatus::updateOrCreate(
                ['id' => $status['id']], // Kunci utama pencarian
                [
                    'code' => $status['code'],
                    'label' => $status['label']
                ]
            );
        }

        // 3. KUNCI POSTGRESQL: Sinkronisasi ulang penghitung (Sequence) secara otomatis
        // Mencegah error duplicate key value violates unique constraint di masa depan
        if (config('database.default') === 'pgsql') {
            DB::statement("SELECT setval('parcel_statuses_id_seq', (SELECT MAX(id) FROM parcel_statuses));");
        }
    }
}
