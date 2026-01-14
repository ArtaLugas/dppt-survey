<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenderTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('gender_types')->insertOrIgnore([
            ['code' => 'L'],
            ['code' => 'P'],
        ]);
    }
}
