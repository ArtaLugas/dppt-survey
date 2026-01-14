<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhotoTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('photo_types')->insertOrIgnore([
            ['code' => 'ktp'],
            ['code' => 'kk'],
            ['code' => 'tanah'],
            ['code' => 'bangunan'],
            ['code' => 'tanaman'],
            ['code' => 'benda_lain'],
            ['code' => 'kegiatan'],
        ]);
    }
}
