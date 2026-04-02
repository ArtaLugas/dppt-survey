<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProfilePasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Memastikan tabel roles terisi
        DB::table('user_roles')->updateOrInsert(['id' => 1], ['code' => 'admin', 'label' => 'Admin']);
        DB::table('user_roles')->updateOrInsert(['id' => 3], ['code' => 'surveyor', 'label' => 'Surveyor']);
    }

    public function test_password_cannot_be_updated_with_incorrect_current_password(): void
    {
        // 1. Simpan sebagai teks asli (karena model akan men-hash otomatis)
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'old-password-123',
            'role_id' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->from('/profile')
            ->put(route('profile.update-password'), [
                'current_password' => 'password-salah-banget',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ]);

        // 3. Verifikasi: Harus kembali dengan error
        $response->assertSessionHasErrors('current_password');

        // Cek bahwa password lama masih berlaku
        $this->assertTrue(Hash::check('old-password-123', $user->fresh()->password));
    }

    public function test_password_can_be_updated_with_correct_current_password(): void
    {
        $user = User::create([
            'name' => 'Success User',
            'email' => 'success@example.com',
            'password' => 'password-benar',
            'role_id' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->put(route('profile.update-password'), [
                'current_password' => 'password-benar',
                'password' => 'password-baru-789',
                'password_confirmation' => 'password-baru-789',
            ]);

        $response->assertSessionHasNoErrors();

        // 4. Verifikasi: Password baru harus tersimpan (dan otomatis ter-hash oleh model)
        $this->assertTrue(Hash::check('password-baru-789', $user->fresh()->password));
    }
}
