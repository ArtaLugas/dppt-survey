<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('user_roles')->insertOrIgnore([
            ['code' => 'surveyor',    'label' => 'Surveyor'],
            ['code' => 'koordinator', 'label' => 'Koordinator'],
            ['code' => 'admin',       'label' => 'Administrator'],
        ]);
    }
}
