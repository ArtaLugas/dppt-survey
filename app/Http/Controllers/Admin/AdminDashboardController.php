<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use App\Models\User;
use App\Models\UserRole;
use App\Models\ParcelStatus;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __invoke()
    {
        // 1. User Statistics
        $userStats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'admins' => User::whereHas('role', fn($q) => $q->where('code', 'admin'))->count(),
            'koordinators' => User::whereHas('role', fn($q) => $q->where('code', 'koordinator'))->count(),
            'surveyors' => User::whereHas('role', fn($q) => $q->where('code', 'surveyor'))->count(),
        ];

        // 2. Interview (Parcel) Statistics
        $interviewStats = [
            'total'     => Parcel::count(),
            'verified'  => Parcel::whereHas('status', fn($q) => $q->where('code', 'verified'))->count(),
            'locked'    => Parcel::whereHas('status', fn($q) => $q->where('code', 'locked'))->count(),
            'submitted' => Parcel::whereHas('status', fn($q) => $q->where('code', 'submitted'))->count(), // Optional for "Pending Verifications" card
        ];

        // 3. Recent Activity (Latest 5 Parcels)
        $recentInterviews = Parcel::with(['surveyor', 'status', 'landDetail'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($parcel) {
                return [
                    'id' => $parcel->id,
                    'nomor_peta_index' => $parcel->nomor_peta_index,
                    'location' => $parcel->landDetail->letak_tanah ?? 'Lokasi tidak tersedia',
                    'surveyorName' => $parcel->surveyor->name ?? 'N/A',
                    'status' => $parcel->status->code ?? 'draft',
                    'updatedAt' => $parcel->updated_at->diffForHumans(),
                ];
            });

        // 4. Analytics Data for Charts
        $analytics = [
            'statusBreakdown' => [
                ['name' => 'Verified', 'value' => $interviewStats['verified'], 'color' => 'hsl(var(--status-verified))'],
                ['name' => 'Locked', 'value' => $interviewStats['locked'], 'color' => 'hsl(var(--status-locked))'],
                ['name' => 'Submitted', 'value' => $interviewStats['submitted'], 'color' => 'hsl(var(--status-submitted))'],
            ],
            // Simple trend data (Last 7 days)
            'dailyActivity' => collect(range(6, 0))->map(function($days) {
                $date = now()->subDays($days);
                return [
                    'date' => $date->format('d M'),
                    'count' => Parcel::whereDate('updated_at', $date->toDateString())->count(),
                ];
            })->toArray(),
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'userStats' => $userStats,
            'interviewStats' => $interviewStats,
            'recentInterviews' => $recentInterviews,
            'analytics' => $analytics,
        ]);
    }
}
