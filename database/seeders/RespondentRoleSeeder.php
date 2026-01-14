<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RespondentRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('respondent_roles')->insertOrIgnore([
            ['code' => 'pemilik'],
            ['code' => 'penggarap'],
            ['code' => 'penyewa'],
            ['code' => 'ahli_waris'],
        ]);
    }
}
