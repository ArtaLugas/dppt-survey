<?php

use App\Models\User;
use App\Models\Interview;
use App\Models\InterviewStatus;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed reference tables
    $this->seed(\Database\Seeders\UserRoleSeeder::class);
    $this->seed(\Database\Seeders\InterviewStatusSeeder::class);
});

it('allows surveyor to edit interview in draft status', function () {
    $surveyorRole = UserRole::where('code', 'surveyor')->first();
    $draftStatus  = InterviewStatus::where('code', 'draft')->first();

    $surveyor = User::factory()->create([
        'role_id' => $surveyorRole->id,
    ]);

    $interview = Interview::factory()->create([
        'created_by' => $surveyor->id,
        'status_id'  => $draftStatus->id,
        'lokasi_wawancara' => 'Lokasi Lama',
    ]);

    $this->actingAs($surveyor)
        ->put(route('interviews.update', $interview->id), [
            'lokasi_wawancara' => 'Lokasi Baru',
        ])
        ->assertStatus(200);

    expect($interview->fresh()->lokasi_wawancara)
        ->toBe('Lokasi Baru');
});

it('rejects surveyor editing interview after submitted', function () {
    $surveyorRole   = UserRole::where('code', 'surveyor')->first();
    $submittedStatus = InterviewStatus::where('code', 'submitted')->first();

    $surveyor = User::factory()->create([
        'role_id' => $surveyorRole->id,
    ]);

    $interview = Interview::factory()->create([
        'created_by' => $surveyor->id,
        'status_id'  => $submittedStatus->id,
        'lokasi_wawancara' => 'Lokasi Awal',
    ]);

    $this->actingAs($surveyor)
        ->put(route('interviews.update', $interview->id), [
            'lokasi_wawancara' => 'Percobaan Edit',
        ])
        ->assertStatus(403);

    expect($interview->fresh()->lokasi_wawancara)
        ->toBe('Lokasi Awal');
});
