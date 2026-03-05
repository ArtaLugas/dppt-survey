<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MasterDataSeeder extends Seeder
{
    public function run()
    {
        // ==========================================
        // 1. ROLES (Admin, Koordinator, Surveyor)
        // ==========================================
        DB::table('user_roles')->insertOrIgnore([
            ['id' => 1, 'code' => 'admin', 'label' => 'Administrator System'],
            ['id' => 2, 'code' => 'koordinator', 'label' => 'Koordinator Tim (Verifikator)'],
            ['id' => 3, 'code' => 'surveyor', 'label' => 'Surveyor Lapangan'],
        ]);

        // ==========================================
        // 2. PHOTO TYPES (Aturan 1-2-3)
        // ==========================================
        DB::table('photo_types')->insertOrIgnore([
            ['id' => 1, 'code' => 'ktp', 'min_qty' => 1, 'label' => 'Identitas (KTP)'],
            ['id' => 2, 'code' => 'alas_hak', 'min_qty' => 2, 'label' => 'Dokumen Alas Hak (Depan & Peta)'],
            ['id' => 3, 'code' => 'aset', 'min_qty' => 3, 'label' => 'Fisik Aset (Depan, Samping, Lingkungan)'],
        ]);

        // ==========================================
        // 3. PARCEL STATUSES (Alur Kerja)
        // ==========================================
        // PERBAIKAN: Menggunakan 'label' bukan 'description'
        DB::table('parcel_statuses')->insertOrIgnore([
            ['id' => 1, 'code' => 'draft', 'label' => 'Draft (Input Surveyor)'],
            ['id' => 2, 'code' => 'submitted', 'label' => 'Menunggu Review Koordinator'],
            ['id' => 3, 'code' => 'verified', 'label' => 'Disetujui Koordinator'],
            ['id' => 4, 'code' => 'locked', 'label' => 'Final (Terkunci)'],
        ]);

        // ==========================================
        // 4. RESPONDENT ROLES (Kiri vs Kanan Excel)
        // ==========================================
        // PERBAIKAN: Menggunakan 'label' bukan 'description'
        DB::table('respondent_roles')->insertOrIgnore([
            ['id' => 1, 'code' => 'pemilik', 'label' => 'Pihak Yang Berhak (Owner)'],
            ['id' => 2, 'code' => 'penggarap', 'label' => 'Pihak Yang Menguasai/Menyewa'],
        ]);

        // ==========================================
        // 5. LAND STATUSES
        // ==========================================
         DB::table('land_statuses')->insertOrIgnore([
            ['code' => 'shm', 'label' => 'Sertifikat Hak Milik (SHM)'],
            ['code' => 'hgb', 'label' => 'Hak Guna Bangunan (HGB)'],
            ['code' => 'girik', 'label' => 'Girik / Letter C'],
            ['code' => 'ajb', 'label' => 'Akta Jual Beli (AJB)'],
            ['code' => 'tanah_negara', 'label' => 'Tanah Negara'],
            ['code' => 'adat', 'label' => 'Tanah Adat / Ulayat'],
        ]);

        // ==========================================
        // 6. CREATE DEFAULT USERS (Untuk Login)
        // ==========================================

        // A. User Admin
        DB::table('users')->insertOrIgnore([
            'name' => 'Super Admin',
            'email' => 'admin@system.com',
            'password' => Hash::make('password'),
            'role_id' => 1, // Admin
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // B. User Koordinator
        DB::table('users')->insertOrIgnore([
            'name' => 'Budi Koordinator',
            'email' => 'koordinator@system.com',
            'password' => Hash::make('password'),
            'role_id' => 2, // Koordinator
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // C. User Surveyor
        DB::table('users')->insertOrIgnore([
            'name' => 'Andi Surveyor',
            'email' => 'surveyor@system.com',
            'password' => Hash::make('password'),
            'role_id' => 3, // Surveyor
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
