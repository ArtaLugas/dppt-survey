<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LandDetailController extends Controller
{
    /**
     * Store or Update Land Detail (One-to-One Relation)
     */
    public function store(Request $request, Parcel $parcel)
    {
        // 1. Otorisasi: Pastikan hanya pemilik yang bisa simpan/update
        abort_if($parcel->surveyor_id !== auth()->id(), 403, 'Anda tidak memiliki otoritas atas bidang ini.');

        // 2. Integritas: Cek apakah status berkas sudah terkunci
        $lockedStatuses = ['submitted', 'verified', 'locked'];
        if (in_array($parcel->status?->code, $lockedStatuses)) {
            return back()->withErrors(['error' => 'Berkas sudah terkunci. Data tidak dapat diubah lagi.']);
        }

        // 3. Validasi Input
        $validated = $request->validate([
            'status_tanah_id'        => 'required|exists:land_statuses,id',
            'alas_hak_jenis'         => 'required|string',
            'alas_hak_nomor'         => 'required|string',
            'nib'                    => 'nullable|string',
            'luas_surat'             => 'required|numeric|min:0',
            'luas_ukur'              => 'required|numeric|min:0',
            'luas_terdampak'         => 'required|numeric|min:0|max:' . $request->luas_ukur, // Logika: Terdampak tidak boleh > Luas Ukur
            'letak_tanah'            => 'required|string',
            'ruang_atas_bawah_tanah' => 'required|string',
            'pembebanan_hak'         => 'required|string',
            'perkiraan_dampak'       => 'required|string',
        ], [
            'luas_terdampak.max'     => 'Luas terdampak tidak boleh melebihi luas hasil ukur.',
        ]);

        try {
            DB::beginTransaction();

            $luas_sisa = $validated['luas_ukur'] - $validated['luas_terdampak'];

            $parcel->landDetail()->updateOrCreate(
                ['parcel_id' => $parcel->id],
                array_merge($validated, ['luas_sisa' => $luas_sisa])
            );

            DB::commit();
            return back()->with('message', 'Detail tanah berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete Land Detail
     */
    public function destroy(Parcel $parcel)
    {
        // FIX: Hapus double 'r' pada surveyor_id
        abort_if($parcel->surveyor_id !== auth()->id(), 403, 'Anda tidak memiliki hak akses atas bidang ini.');

        $lockedStatuses = ['submitted', 'verified', 'locked'];
        if (in_array($parcel->status?->code, $lockedStatuses)) {
            return back()->withErrors(['error' => 'Status bidang terkunci. Tidak dapat menghapus detail tanah.']);
        }

        if ($parcel->landDetail) {
            $parcel->landDetail->delete();
        }

        return back()->with('message', 'Detail tanah berhasil dihapus.');
    }
}
