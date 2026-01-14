<?

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Interview;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class InterviewService
{
    /**
     * =====================================================
     * SUBMIT INTERVIEW
     * draft -> submitted
     *
     * Allowed:
     * - Surveyor
     * - Admin
     *
     * Governance:
     * - Surveyor selesai setelah submit
     * - Admin boleh submit, tapi tetap teraudit
     * =====================================================
     */
    public function submit(Interview $interview, User $user): void
    {
        Gate::authorize('submit', $interview);

        $this->ensureNotLocked($interview);

        if ($interview->isLocked()) {
            throw new DomainException('Interview is locked.');
        }

        DB::transaction(function () use ($interview, $user) {
            $interview->update([
                'status_id' => $this->statusId('submitted'),
            ]);

            $this->audit(
                user: $user,
                interview: $interview,
                action: 'submit_interview'
            );
        });
    }

    /**
     * =====================================================
     * VERIFY INTERVIEW
     * submitted -> verified
     *
     * Allowed:
     * - Koordinator
     * - Admin
     *
     * Governance:
     * - Koordinator bertanggung jawab validasi substansi
     * - Admin boleh verify jika organisasi mengizinkan
     * =====================================================
     */
    public function verify(Interview $interview, User $user): void
    {
        Gate::authorize('verify', $interview);

        $this->ensureNotLocked($interview);

        DB::transaction(function () use ($interview, $user) {
            $interview->update([
                'status_id' => $this->statusId('verified'),
                'review_started_at' => $interview->review_started_at ?? now(),
                'reviewed_at' => now(),
                'reviewed_by' => $user->id,
            ]);

            $this->audit(
                user: $user,
                interview: $interview,
                action: 'verify_interview'
            );
        });
    }

    /**
     * =====================================================
     * LOCK INTERVIEW
     * verified -> locked
     *
     * Allowed:
     * - Admin ONLY
     *
     * Governance:
     * - LOCK = final mutlak
     * - Tidak ada edit / delete / rollback
     * =====================================================
     */
    public function lock(Interview $interview, User $user): void
    {
        Gate::authorize('lock', $interview);

        $this->ensureNotLocked($interview);
        $this->ensureReadyForLock($interview);

        DB::transaction(function () use ($interview, $user) {
            $interview->update([
                'status_id' => $this->statusId('locked'),
            ]);

            $this->audit(
                user: $user,
                interview: $interview,
                action: 'lock_interview'
            );
        });
    }

    /**
     * =====================================================
     * CHECKLIST PRA-LOCK (NON-NEGOTIABLE)
     *
     * Jika salah satu gagal → LOCK DITOLAK SISTEM
     * =====================================================
     */
    protected function ensureReadyForLock(Interview $interview): void
    {
        // 1. Status must be VERIFIED
        if ($interview->status->code !== 'verified') {
            throw new DomainException('Interview must be Verified before Lock.');
        }

        // 2. Minimum 1 respondent
        if ($interview->respondents()->count() === 0) {
            throw new DomainException('No respondent found.');
        }

        // 3. Minimum 1 land asset
        if ($interview->landAssets()->count() === 0) {
            throw new DomainException('No land asset found.');
        }

        // 4. Audit submit & verify must exist
        if (! $this->hasAudit($interview, 'submit_interview')) {
            throw new DomainException('Submit audit missing.');
        }

        if (! $this->hasAudit($interview, 'verify_interview')) {
            throw new DomainException('Verify audit missing.');
        }
    }

    /**
     * =====================================================
     * GUARD: LOCKED = READ-ONLY ABSOLUT
     * =====================================================
     */
    protected function ensureNotLocked(Interview $interview): void
    {
        if ($interview->isLocked()) {
            throw new DomainException('Interview is LOCKED and read-only.');
        }
    }

    /**
     * =====================================================
     * AUDIT LOGGER (APPEND-ONLY)
     * =====================================================
     */
    protected function audit(User $user, Interview $interview, string $action): void
    {
        AuditLog::create([
            'user_id'      => $user->id,
            'interview_id' => $interview->id,
            'action'       => $action,
            'created_at'   => now(),
        ]);
    }

    protected function hasAudit(Interview $interview, string $action): bool
    {
        return AuditLog::where('interview_id', $interview->id)
            ->where('action', $action)
            ->exists();
    }

    /**
     * =====================================================
     * STATUS ID RESOLVER
     *
     * Catatan:
     * - Status bersifat reference & immutable
     * - Cache dipakai untuk performa
     * =====================================================
     */
    protected function statusId(string $code): int
    {
        return cache()->remember(
            "interview_status_id_{$code}",
            now()->addHour(),
            fn () => DB::table('interview_statuses')
                ->where('code', $code)
                ->value('id')
        );
    }

}
