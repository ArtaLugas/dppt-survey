<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhotoEntityTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('photo_entity_types')->insertOrIgnore([
            ['code' => 'respondent'],
            ['code' => 'land_asset'],
            ['code' => 'building'],
            ['code' => 'plant'],
            ['code' => 'other_object'],
            ['code' => 'activity'],
        ]);
    }
}
