<?php

namespace App\Services;

use App\Models\Interview;
use App\Support\InterviewStatusResolver;

final class InterviewQueryService
{
    public function listForDashboard(string $statusCode, int $limit = 20)
    {
        return Interview::query()
            ->select('id', 'nomor_peta_index', 'status_id', 'created_at')
            ->where('status_id', InterviewStatusResolver::id($statusCode))
            ->orderBy('created_at')
            ->limit($limit)
            ->get();
    }

    public function countByStatus()
    {
        return Interview::query()
            ->selectRaw('status_id, COUNT(*) as count')
            ->groupBy('status_id')
            ->get();
    }

    public function detailWithRelations(int $id)
    {
        return Interview::with([
            'respondents',
            'landAssets',
            'photos',
        ])->findOrFail($id);
    }
}
