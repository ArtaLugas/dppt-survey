<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Parcel;
use App\Models\ParcelStatus;
use App\Models\PhotoType;
use App\Models\RespondentRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParcelController extends Controller
{
    public function index(Request $request)
    {
        // ... (Code index tetap sama, tidak perlu diubah) ...
        $filters = $request->only(['search', 'status']);

        $query = Parcel::query()
            ->with(['status', 'landDetail', 'respondents', 'surveyor'])
            ->where('surveyor_id', auth()->id())
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search){
                $q->where('nomor_bidang', 'ilike', "%{$search}%")
                    ->orWhere('nomor_peta_index', 'ilike', "%{$search}%")
                    ->orWhereHas('landDetail', function($subQ) use ($search) {
                        $subQ->where('letak_tanah', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('respondents', function($subQ) use ($search) {
                        $subQ->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('status', function($q) use ($request) {
                $q->where('code', $request->status);
            });
        }

        return Inertia::render('Surveyor/SurveyorInterview', [
            'parcels' => $query->paginate(10)->appends($filters),
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Interview/InterviewEditor', [
            'isCreateMode' => true,
            'parcel' => null,
            'respondents' => [],
            'landDetail' => null,
            'inventoryItems' => [],
            'photos' => [],

            // 2. PERBAIKAN DISINI: Jangan kirim array kosong []
            // Ambil master data tipe foto dari database agar Dropdown & Kategori muncul
            'photoTypes' => PhotoType::select('id', 'label', 'min_qty')->get(),
        ]);
    }

    public function store(Request $request)
    {
        // ... (Code store tetap sama) ...
        $validated = $request->validate([
            'nomorPetaIndex'    => 'required|string|max:50|unique:parcels,nomor_peta_index',
            'nomorBidang'       => 'required|string|max:50',
            'peruntukanLahan'   => 'required|string',
            'tipeBangunanMajor' => 'nullable|string',
            'catatanLapangan'   => 'nullable|string',
            'tindakLanjut'      => 'nullable|string',
        ]);

        $parcel = DB::transaction(function () use ($validated) {
            return Parcel::create([
                'nomor_peta_index'    => $validated['nomorPetaIndex'],
                'nomor_bidang'        => $validated['nomorBidang'],
                'peruntukan_lahan'    => $validated['peruntukanLahan'],
                'tipe_bangunan_major' => $validated['tipeBangunanMajor'],
                'catatan_lapangan'    => $validated['catatanLapangan'],
                'tindak_lanjut'       => $validated['tindakLanjut'],
                'surveyor_id'         => auth()->id(),
                'status_id'           => 1,
            ]);
        });

        return redirect()->route('surveyor.interviews.edit', $parcel->id)
            ->with('message', 'Data bidang berhasil dibuat.');
    }

    public function edit(Parcel $parcel)
    {
        abort_if($parcel->surveyor_id !== auth()->id(), 403);

        $parcel->load(['status','respondents', 'landDetail', 'inventoryItems', 'photos']);

        return Inertia::render('Interview/InterviewEditor', [
            'parcel' => $parcel,
            'respondents' => $parcel->respondents,
            'respondentRoles' => RespondentRole::select('id', 'code', 'label')->get(),
            'landDetail' => $parcel->landDetail,
            'inventoryItems' => $parcel->inventoryItems,
            'photos' => $parcel->photos,
            'isCreateMode' => false,

            // 3. PERBAIKAN KRUSIAL DISINI:
            // Sebelumnya data ini TIDAK ADA, sehingga React tidak bisa me-render tab foto
            'photoTypes' => PhotoType::select('id', 'label', 'min_qty')->get(),
        ]);
    }

    public function update(Request $request, Parcel $parcel)
    {
        // ... (Code update tetap sama) ...
        abort_if($parcel->surveyor_id !== auth()->id(), 403);

        $validated = $request->validate([
            'nomorPetaIndex'    => 'required|string|max:50|unique:parcels,nomor_peta_index,' . $parcel->id,
            'nomorBidang'       => 'required|string|max:50',
            'peruntukanLahan'   => 'required|string',
            'tipeBangunanMajor' => 'nullable|string',
            'catatanLapangan'   => 'nullable|string',
            'tindakLanjut'      => 'nullable|string',
        ]);

        $parcel->update([
            'nomor_peta_index'    => $validated['nomorPetaIndex'],
            'nomor_bidang'        => $validated['nomorBidang'],
            'peruntukan_lahan'    => $validated['peruntukanLahan'],
            'tipe_bangunan_major' => $validated['tipeBangunanMajor'],
            'catatan_lapangan'    => $validated['catatanLapangan'],
            'tindak_lanjut'       => $validated['tindakLanjut'],
        ]);

        return redirect()->back()->with('message', 'Info bidang diperbarui.');
    }

    public function submit(Parcel $parcel)
    {
        // ... (Code submit tetap sama) ...
        abort_if($parcel->surveyor_id !== auth()->id(), 403);

        $readiness = $parcel->submission_readiness;

        if (!$readiness['is_ready']) {
            return redirect()->back()->withErrors([
                'submit' => 'Data belum lengkap: ' . implode(', ', $readiness['errors'])
            ]);
        }

        $parcel->update([
            'status_id'   => 2,
            'updated_at'  => now(),
        ]);

        return redirect()->route('surveyor.interviews.index')
            ->with('message', 'Data berhasil disubmit.');
    }

    public function destroy($id)
    {
        try {
            $parcel = Parcel::with('status')->findOrFail($id);
            $statusCode = $parcel->status->code;

            $userRole = auth()->user()->role->code;

            if (in_array($statusCode, ['draft', 'rejected'])) {
                $parcel->delete();

                return redirect()->back()->with('success', 'Data draf dan file dokumentasi berhasil dihapus permanen.');
            }

            if (in_array($statusCode, ['submitted', 'verified', 'locked'])) {

                if ($userRole === 'surveyor') {
                    abort(403, 'Surveyor tidak diizinkan menghapus atau membatalkan data yang sudah disubmit.');
                }

                $cancelledStatusId = ParcelStatus::where('code', 'cancelled')->value('id');

                $parcel->update([
                    'status_id' => $cancelledStatusId,
                    'tindak_lanjut' => 'Dibatalkan oleh sistem/admin pada ' . now()->format('d-m-Y')
                ]);

                AuditLog::create([
                    'parcel_id' => $parcel->id,
                    'user_id' => auth()->id(),
                    'action' => 'VOID_PARCEL',
                    'old_values' => ['status_code' => $statusCode],
                    'new_values' => ['status_code' => 'cancelled'],
                    'ip_address' => request()->ip(),
                ]);

                return redirect()->back()->with('info', 'Data tidak dihapus demi jejak audit, melainkan diubah statusnya menjadi Dibatalkan.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}
