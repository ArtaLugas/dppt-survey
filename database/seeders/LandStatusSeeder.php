<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class LandStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('land_statuses')->insertOrIgnore([
            ['code' => 'hak_milik'],
            ['code' => 'hak_guna_usaha'],
            ['code' => 'hak_guna_bangunan'],
            ['code' => 'hak_pengelolaan'],
            ['code' => 'tanah_negara'],
            ['code' => 'hak_lama'],
        ]);
    }
}
