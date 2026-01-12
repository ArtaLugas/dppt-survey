<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::unprepared("
            CREATE OR REPLACE FUNCTION prevent_reference_mutation()
            RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'Reference tables are immutable';
            END;
            $$ LANGUAGE plpgsql;
        ");

        foreach ([
            'user_roles',
            'interview_statuses',
            'respondent_roles',
            'gender_types',
            'land_statuses',
            'document_types',
            'photo_entity_types',
            'photo_types'
        ] as $table) {
            DB::unprepared("
                CREATE TRIGGER {$table}_immutable
                BEFORE UPDATE OR DELETE ON {$table}
                FOR EACH ROW
                EXECUTE FUNCTION prevent_reference_mutation();
            ");
        }
    }

    public function down(): void
    {
        // DO NOT rollback immutability lightly
    }
};
