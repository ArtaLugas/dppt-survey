<?php

namespace App\Services;

use App\Models\Interview;
use App\Models\InterviewSnapshot;
use DomainException;
use Illuminate\Support\Facades\Storage;

final class InterviewSnapshotService
{
    public function create(Interview $interview, int $actorId): InterviewSnapshot
    {
        if (! $interview->status->is_final) {
            throw new DomainException("Snapshot can only be created for LOCKED interview");
        }

        $payload = $this->buildPayload($interview);
        $json = json_encode($payload, JSON_PRETTY_PRINT);

        $hash = hash('sha256', $json);

        $basePath = "snapshots/interview_{$interview->id}";
        Storage::put("{$basePath}/snapshot.json", $json);

        return InterviewSnapshot::create([
            'interview_id' => $interview->id,
            'created_by' => $actorId,
            'hash' => $hash,
            'json_path' => "{$basePath}/snapshot.json",
            'pdf_path' => "",
            'created_at' => now(),
        ]);
    }

    private function buildPayload(Interview $interview): array
    {
        return [
            'interview_id' => $interview->id,
            'status' => $interview->status,
        ];
    }
}
