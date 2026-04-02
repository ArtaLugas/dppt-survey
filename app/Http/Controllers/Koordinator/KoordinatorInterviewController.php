<?php

namespace App\Http\Controllers\Koordinator;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use App\Models\ParcelStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KoordinatorInterviewController extends Controller
{
    public function revise(Request $request, Parcel $parcel)
    {
        $request->validate([
            'catatan_revisi' => 'required|string',
        ]);

        $statuRevision = ParcelStatus::where('code', 'revision')->first();

        if (!$statuRevision) {
            return back()->with('error', 'Konfigurasi status "Revision" tidak ditemukan dalam database.');
        }

        $parcel->update([
            'status_id' => $statuRevision->id,
            'catatan_revisi' => $request->catatan_revisi,
            'koordinator_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Data berhasil dikembalikan ke surveyor untuk revisi.');
    }

    public function verify(Parcel $parcel)
    {
        $statusVerified = ParcelStatus::where('code', 'verified')->first();

        $parcel->update([
            'status_id' => $statusVerified->id,
            'catatan_revisi' => null,
            'koordinator_id' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Data berhasil diverifikasi.');
    }
}
