<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\Respondent;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RespondentController extends Controller
{
    /**
     * Save New Respondnent
     */
    public function store(Request $request, Parcel $parcel)
    {
        // Security check: Pastikan surveyor adalah pemilik bidang ini
        abort_if($parcel->surveyor_id !== auth()->id(), 403);

        $validated = $request->validate([
            'nama'          => 'required|string|max:255',
            'role_id'       => 'required|exists:respondent_roles,id',
            'nik'           => 'required|digits:16',
            'is_primary'    => 'boolean',
            'tempat_lahir'  => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'pekerjaan'     => 'nullable|string|max:100',
            'no_telepon'    => 'nullable|string|max:20',
            'alamat_ktp'    => 'nullable|string',
        ]);

        DB::transaction(function () use ($parcel, $validated){
            if ($validated['is_primary'] ?? false) {
                $parcel->respondents()->update(['is_primary' => false]);
            }

            $parcel->respondents()->create([
                'name'          => $validated['nama'],
                'role_id'       => $validated['role_id'],
                'nik'           => $validated['nik'],
                'is_primary'    => $validated['is_primary'] ?? false,
                'tempat_lahir'  => $validated['tempat_lahir'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'pekerjaan'     => $validated['pekerjaan'],
                'no_telepon'    => $validated['no_telepon'],
                'alamat_ktp'    => $validated['alamat_ktp'],
            ]);
        });

        return redirect()->back()->with('message', 'Respondent berhasil ditambahkan.');
    }

    /**
     * Update Data Responden
     */
    /**
     * Update Data Responden
     */
    public function update(Request $request, Respondent $respondent)
    {
        abort_if($respondent->parcel->surveyor_id !== auth()->id(), 403);

        // KOREKSI MUTLAK: Ubah 'name' menjadi 'nama' agar konsisten dengan store()
        $validated = $request->validate([
            'nama'          => 'required|string|max:255',
            'role_id'       => 'required|exists:respondent_roles,id',
            'nik'           => 'required|digits:16',
            'is_primary'    => 'boolean',
            'tempat_lahir'  => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'pekerjaan'     => 'nullable|string',
            'no_telepon'    => 'nullable|string',
            'alamat_ktp'    => 'nullable|string',
        ]);

        DB::transaction(function () use ($respondent, $validated) {
            if ($validated['is_primary'] ?? false) {
                $respondent->parcel->respondents()->update(['is_primary' => false]);
            }
            $respondent->update([
                'name'          => $validated['nama'], // Sekarang data ini tersedia
                'role_id'       => $validated['role_id'],
                'nik'           => $validated['nik'],
                'is_primary'    => $validated['is_primary'] ?? false,
                'tempat_lahir'  => $validated['tempat_lahir'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'pekerjaan'     => $validated['pekerjaan'],
                'no_telepon'    => $validated['no_telepon'],
                'alamat_ktp'    => $validated['alamat_ktp'],
            ]);
        });

        return redirect()->back()->with('message', 'Respondent berhasil diperbarui.');
    }

    /**
     * Delete Data Responden
     */
    public function destroy(Respondent $respondent)
    {
        abort_if($respondent->parcel->surveyor_id !== auth()->id(), 403);

        $respondent->delete();

        return redirect()->back()->with('message', 'Respondent berhasil dihapus.');
    }
}
