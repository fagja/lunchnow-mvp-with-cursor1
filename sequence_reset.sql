DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT
                 n.nspname AS schema,
                 c.relname AS table_name,
                 a.attname AS column_name,
                 COALESCE(pg_get_serial_sequence(n.nspname || '.' || c.relname, a.attname), NULL) AS sequence_name
             FROM
                 pg_class c
                 JOIN pg_namespace n ON n.oid = c.relnamespace
                 JOIN pg_attribute a ON a.attrelid = c.oid
                 JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
             WHERE
                 n.nspname NOT LIKE 'pg_%'
                 AND n.nspname != 'information_schema'
                 AND a.attnum > 0
                 AND NOT a.attisdropped
                 AND pg_get_expr(d.adbin, d.adrelid) LIKE 'nextval%'
                 AND c.relkind = 'r')
    LOOP
        IF r.sequence_name IS NOT NULL THEN
            EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                          r.sequence_name, r.column_name, r.schema, r.table_name);
            RAISE NOTICE 'Reset sequence % for %.%.% to next value after MAX(%I)',
                r.sequence_name, r.schema, r.table_name, r.column_name, r.column_name;
        END IF;
    END LOOP;
END $$;
