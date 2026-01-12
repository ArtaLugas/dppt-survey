<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $this->call([
            UserRoleSeeder::class,
            InterviewStatusSeeder::class,
            RespondentRoleSeeder::class,
            GenderTypeSeeder::class,
            LandStatusSeeder::class,
            DocumentTypeSeeder::class,
            PhotoEntityTypeSeeder::class,
            PhotoTypeSeeder::class,
        ]);
    }
}
