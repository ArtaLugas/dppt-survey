<?php

namespace App\Http\Controllers\Koordinator;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KoordinatorSubmittedController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = Parcel::with(['status', 'landDetail', 'respondents', 'surveyor', 'inventoryItems', 'photos'])
            ->whereHas('status', function ($q) {
                // If you want revisions to show up here too, change to: $q->whereIn('code', ['submitted', 'revision']);
                $q->where('code', 'submitted');
            });

        // Backend Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bidang', 'like', "%{$search}%")
                    ->orWhereHas('landDetail', function ($q2) use ($search) {
                        $q2->where('letak_tanah', 'like', "%{$search}%");
                    })
                    ->orWhereHas('surveyor', function ($q3) use ($search) {
                        $q3->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('respondents', function ($q4) use ($search) {
                        $q4->where('nama', 'like', "%{$search}%")->where('is_primary', true);
                    });
            });
        }

        // Backend Filter Surveyor
        if ($surveyorFilter = $request->query('surveyor')) {
            if ($surveyorFilter !== 'all') {
                $query->whereHas('surveyor', function ($q) use ($surveyorFilter) {
                    $q->where('name', $surveyorFilter);
                });
            }
        }

        $interviews = $query->latest()
            ->paginate(10)
            ->appends($request->query());

        $pendingCount = Parcel::whereHas('status', fn($q) => $q->whereIn('code', ['submitted', 'revision']))->count();

        // Get all possible surveyors from submitted items to populate the dropdown
        $surveyors = User::whereHas('role', function ($q) {
            $q->where('code', 'surveyor');
        })
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        return Inertia::render('Koordinator/KoordinatorSubmitted', [
            'interviews' => $interviews,
            'pendingCount' => $pendingCount,
            'filters' => $request->only(['search', 'surveyor']),
            'surveyorsList' => $surveyors
        ]);
    }
}
