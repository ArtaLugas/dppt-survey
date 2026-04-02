<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use App\Models\ParcelStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInterviewController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Parcel::with(['status', 'surveyor', 'koordinator', 'landDetail', 'primaryRespondent', 'respondents']);

        // Filtering
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bidang', 'like', "%{$search}%")
                    ->orWhere('nomor_peta_index', 'like', "%{$search}%")
                    ->orWhereHas('surveyor', fn($s) => $s->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('koordinator', fn($k) => $k->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('landDetail', fn($l) => $l->where('letak_tanah', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('status', fn($q) => $q->where('code', $request->status));
        }

        if ($request->filled('surveyor') && $request->surveyor !== 'all') {
            $query->where('surveyor_id', $request->surveyor);
        }

        if ($request->filled('koordinator') && $request->koordinator !== 'all') {
            $query->where('koordinator_id', $request->koordinator);
        }

        $interviews = $query->latest('updated_at')->paginate(10)->appends($request->query());

        // Master Data for Filters
        $surveyors = User::whereHas('role', fn($q) => $q->where('code', 'surveyor'))->get(['id', 'name']);
        $koordinators = User::whereHas('role', fn($q) => $q->where('code', 'koordinator'))->get(['id', 'name']);
        $statuses = ParcelStatus::all(['id', 'code', 'label']);

        return Inertia::render('Admin/AdminInterview', [
            'interviews' => $interviews,
            'surveyors' => $surveyors,
            'koordinators' => $koordinators,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'surveyor', 'koordinator']),
        ]);
    }

    public function lock(Parcel $parcel)
    {
        // Admin hanya bisa mengunci data yang sudah verified
        if ($parcel->status->code !== 'verified') {
            return back()->with('error', 'Hanya data terverifikasi yang dapat dikunci.');
        }

        $statusLocked = ParcelStatus::where('code', 'locked')->first();
        $parcel->update([
            'status_id' => $statusLocked->id,
            'verified_at' => now(), // Opsional: Tandai kapan dikunci oleh admin
        ]);

        return back()->with('success', "Wawancara #{$parcel->nomor_peta_index} berhasil dikunci.");
    }

    public function cancel(Parcel $parcel)
    {
        // Admin dapat membatalkan data yang dianggap tidak valid/digunakan
        $statusCancelled = ParcelStatus::where('code', 'cancelled')->first();
        $parcel->update(['status_id' => $statusCancelled->id]);

        return back()->with('success', "Wawancara #{$parcel->nomor_peta_index} telah dibatalkan.");
    }
}
