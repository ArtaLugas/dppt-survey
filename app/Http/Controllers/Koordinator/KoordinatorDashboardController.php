<?php

namespace App\Http\Controllers\Koordinator;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KoordinatorDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $userId = $request->user()->id;

        $interviews = Parcel::with(['status', 'landDetail', 'respondents', 'surveyor', 'inventoryItems', 'photos'])
            ->whereHas('status', function ($query) {
                $query->whereIn('code', ['submitted', 'verified', 'locked', 'revision']);
            })
            ->latest()
            ->paginate(10);

        $stats = [
            'submitted' => Parcel::whereHas('status', fn($q) => $q->where('code', 'submitted'))->count(),
            'verified'  => Parcel::whereHas('status', fn($q) => $q->where('code', 'verified'))->count(),
            'locked'    => Parcel::whereHas('status', fn($q) => $q->where('code', 'locked'))->count(),
            'revision'  => Parcel::whereHas('status', fn($q) => $q->where('code', 'revision'))->count(),
        ];

        return Inertia::render('Koordinator/KoordinatorDashboard', [
            'interviews'     => $interviews,
            'serverStats' => $stats
        ]);
    }
}
