<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InterviewStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('interview_statuses')->insertOrIgnore([
            ['code' => 'draft', 'sequence' => 1, 'is_final' => false],
            ['code' => 'submitted', 'sequence' => 2, 'is_final' => false],
            ['code' => 'verified', 'sequence' => 3, 'is_final' => false],
            ['code' => 'locked', 'sequence' => 4, 'is_final' => true],
        ]);
    }
}
