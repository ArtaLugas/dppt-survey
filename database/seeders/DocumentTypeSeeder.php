<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('document_types')->insertOrIgnore([
            ['code' => 'shm'],
            ['code' => 'hgu'],
            ['code' => 'hgb'],
            ['code' => 'hak_pengelolaan'],
            ['code' => 'surat_sewa'],
            ['code' => 'sppt'],
            ['code' => 'girik'],
            ['code' => 'akta_jual_beli'],
            ['code' => 'lainnya'],
        ]);
    }
}
