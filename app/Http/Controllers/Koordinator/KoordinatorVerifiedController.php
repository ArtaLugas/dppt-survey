<?php

namespace App\Http\Controllers\Koordinator;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KoordinatorVerifiedController extends Controller
{
    public function __invoke(Request $request)
    {
        $statusFilter = $request->query('status', 'all');
        $sort = $request->query('sort', 'latest');
        $search = $request->query('search');

        $query = Parcel::with(['status', 'landDetail', 'respondents', 'surveyor', 'inventoryItems', 'photos'])
            ->whereHas('status', function ($q) use ($statusFilter) {
                if ($statusFilter !== 'all' && in_array($statusFilter, ['verified', 'locked'])) {
                    $q->where('parcel_statuses.code', $statusFilter);
                } else {
                    $q->whereIn('parcel_statuses.code', ['verified', 'locked']);
                }
            });

        // Search Logic
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bidang', 'like', "%{$search}%")
                    ->orWhereHas('landDetail', function ($q2) use ($search) {
                        $q2->where('letak_tanah', 'like', "%{$search}%");
                    })
                    ->orWhereHas('surveyor', function ($q3) use ($search) {
                        $q3->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('respondents', function ($q4) use ($search) {
                        $q4->where('name', 'like', "%{$search}%")->where('is_primary', true);
                    });
            });
        }

        // Sorting Logic
        if ($sort === 'oldest') {
            $query->oldest();
        } elseif ($sort === 'status') {
            $query->leftJoin('parcel_statuses', 'parcels.status_id', '=', 'parcel_statuses.id')
                ->orderBy('parcel_statuses.code', 'asc')
                ->select('parcels.*');
        } else {
            $query->latest();
        }

        $interviews = $query->paginate(10)->appends($request->query());

        $stats = [
            'verified' => Parcel::whereHas('status', fn($q) => $q->where('code', 'verified'))->count(),
            'locked'   => Parcel::whereHas('status', fn($q) => $q->where('code', 'locked'))->count(),
        ];

        return Inertia::render('Koordinator/KoordinatorVerified', [
            'interviews' => $interviews,
            'stats'      => $stats,
            'filters'    => [
                'status' => $statusFilter,
                'sort'   => $sort,
                'search' => $search,
            ]
        ]);
    }
}
