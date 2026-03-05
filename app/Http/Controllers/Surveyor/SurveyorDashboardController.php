<?php

namespace App\Http\Controllers\Surveyor;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SurveyorDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        // 1. KONTRAK DATA DISAMAKAN DENGAN SURVEYOR INTERVIEW
        // Tidak ada filter is_primary di sini, biarkan frontend yang memilih
        $parcels = Parcel::with(['status', 'landDetail', 'respondents', 'surveyor', 'inventoryItems', 'photos'])
            ->where('surveyor_id', $userId)
            ->whereHas('status', function ($query) {
                $query->where('code', 'draft', 'revision');
            })
            ->latest()
            ->paginate(10);

        // 2. LOGIKA STATISTIK TETAP AMAN (Menggunakan relasi status)
        $stats = [
            'draft'     => Parcel::where('surveyor_id', $userId)->whereHas('status', fn($q) => $q->where('code', 'draft'))->count(),
            'submitted' => Parcel::where('surveyor_id', $userId)->whereHas('status', fn($q) => $q->where('code', 'submitted'))->count(),
            'verified'  => Parcel::where('surveyor_id', $userId)->whereHas('status', fn($q) => $q->where('code', 'verified'))->count(),
            'locked'    => Parcel::where('surveyor_id', $userId)->whereHas('status', fn($q) => $q->where('code', 'locked'))->count(),
        ];

        return Inertia::render('Dashboard/Surveyor', [
            'parcels'     => $parcels,
            'serverStats' => $stats
        ]);
    }
}
