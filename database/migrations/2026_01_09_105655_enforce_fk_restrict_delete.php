<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    private function indexExists(string $table, string $index): bool
    {
        return DB::table('pg_indexes')
            ->where('tablename', $table)
            ->where('indexname', $index)
            ->exists();
    }

    public function up(): void
    {
        // interviews
        if (Schema::hasTable('interviews')) {
            if (! $this->indexExists('interviews', 'interviews_status_id_index')) {
                Schema::table('interviews', fn (Blueprint $t) => $t->index('status_id'));
            }
            if (! $this->indexExists('interviews', 'interviews_created_by_index')) {
                Schema::table('interviews', fn (Blueprint $t) => $t->index('created_by'));
            }
            if (! $this->indexExists('interviews', 'interviews_status_id_created_by_index')) {
                Schema::table('interviews', fn (Blueprint $t) => $t->index(['status_id', 'created_by']));
            }
            if (! $this->indexExists('interviews', 'interviews_created_at_index')) {
                Schema::table('interviews', fn (Blueprint $t) => $t->index('created_at'));
            }
        }

        // audit_logs
        if (Schema::hasTable('audit_logs')) {
            foreach (['interview_id', 'user_id', 'created_at'] as $col) {
                $index = "audit_logs_{$col}_index";
                if (! $this->indexExists('audit_logs', $index)) {
                    Schema::table('audit_logs', fn (Blueprint $t) => $t->index($col));
                }
            }
        }

        // child tables
        foreach (['respondents','land_assets','buildings','plants','other_objects'] as $table) {
            if (Schema::hasTable($table)) {
                $index = "{$table}_interview_id_index";
                if (! $this->indexExists($table, $index)) {
                    Schema::table($table, fn (Blueprint $t) => $t->index('interview_id'));
                }
            }
        }

        // photos
        if (Schema::hasTable('photos')) {
            if (! $this->indexExists('photos', 'photos_entity_type_id_entity_id_index')) {
                Schema::table('photos', fn (Blueprint $t) => $t->index(['entity_type_id', 'entity_id']));
            }
            if (! $this->indexExists('photos', 'photos_photo_type_id_index')) {
                Schema::table('photos', fn (Blueprint $t) => $t->index('photo_type_id'));
            }
            if (! $this->indexExists('photos', 'photos_interview_id_index')) {
                Schema::table('photos', fn (Blueprint $t) => $t->index('interview_id'));
            }
        }
    }

    public function down(): void
    {
        // intentionally left empty — hardening is one-way
    }
};
