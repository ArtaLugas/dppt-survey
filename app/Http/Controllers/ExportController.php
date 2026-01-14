<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Interview;
use App\Models\InterviewStatus;

class ExportController extends Controller
{
    public function exportCsv()
    {
        $handle = fopen(storage_path('app/export.csv'), 'w');

        Interview::where('status_id', InterviewStatus::locked())
            ->orderBy('id')
            ->chunk(500, function($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->nomor_peta_index,
                        $row->created_at,
                    ]);
                }
            });

        fclose($handle);

        return response()->download(
            storage_path('app/export.csv')
        );
    }
}
