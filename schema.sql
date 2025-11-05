\c postgres;

DROP DATABASE IF EXISTS accessi1;
CREATE DATABASE accessi1;
\c accessi1;

CREATE DOMAIN non_empty_text AS TEXT
CHECK (VALUE != '');
CREATE DOMAIN non_empty_text32 AS TEXT
CHECK (VALUE != '' AND length(VALUE) <= 32);
CREATE DOMAIN non_empty_text64 AS TEXT
CHECK (VALUE != '' AND length(VALUE) <= 64);
CREATE DOMAIN non_empty_text128 AS TEXT
CHECK (VALUE != '' AND length(VALUE) <= 128);
CREATE DOMAIN non_empty_text256 AS TEXT
CHECK (VALUE != '' AND length(VALUE) <= 256);

CREATE DOMAIN badge_code AS TEXT
CHECK (left(VALUE, 1) = '1' AND length(VALUE) = 9 AND (VALUE ~ '^[0-9]+$'));
CREATE DOMAIN provv_code AS TEXT
CHECK (((left(VALUE, 1) = '2' AND length(VALUE) = 9) OR length(VALUE) = 7) AND (VALUE ~ '^[0-9]+$'));
CREATE DOMAIN chiave_code AS TEXT
CHECK (left(VALUE, 1) = '3' AND length(VALUE) = 9 AND (VALUE ~ '^[0-9]+$'));
CREATE DOMAIN veh_code AS TEXT
CHECK (left(VALUE, 1) = '4' AND length(VALUE) = 9 AND (VALUE ~ '^[0-9]+$'));
CREATE DOMAIN mazzo_code AS TEXT
CHECK (left(VALUE, 1) = '5' AND length(VALUE) = 9 AND (VALUE ~ '^[0-9]+$'));

CREATE DOMAIN zuc_code AS TEXT
CHECK (length(VALUE) = 6 AND (VALUE ~ '^[0-9]+$'));

CREATE DOMAIN cod_fisc AS TEXT
CHECK (length(VALUE) = 16);

CREATE TYPE doc_type AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE', 'PASSAPORTO', 'TESSERINO PROFESSIONALE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assign_type as ENUM ('OSPITE', 'UTENTE', 'GIORNALISTA', 'MANUTENZIONE', 'ASSOCIAZIONE', 'COOPERATIVA', 'COLLABORATORE',
                                'PULIZIE', 'PORTINERIA', 'FACCHINAGGIO', 'CORRIERE', 'UNIVERSITARIO', 'AMMINISTRAZIONE', 
                                'PARENTE DEGENTE');
CREATE TYPE building_type as ENUM ('APPARTAMENTO', 'VILLETTA', 'CAPANNONE', 'FONDO', 'CLINICA', 'UFFICIO', 'ARCHIVIO', 'LOCALE TECNICO',
                                    'CAVEDIO', 'SCALE', 'REI', 'BIBLIOTECA', 'AUDITORIUM', 'FORESTERIA', 'COLLEGAMENTO', 'INFERMERIA',
                                    'WC', 'AULA', 'CORRIDOIO', 'BAR', 'ASILO', 'TERRAZZO', 'CELLA', 'GENERICO');
CREATE TYPE veh_type as ENUM ('AUTO', 'MOTO', 'BICICLETTA', 'GENERICO');
CREATE TYPE barcode_prefix AS ENUM ('1', '2', '3', '4', '5');
-- CREATE TYPE badge_type as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE');
-- CREATE TYPE mark_type AS ENUM ('I', 'O', 'PI', 'PO', 'KI', 'KO');

CREATE SEQUENCE arch_ids;
CREATE SEQUENCE barcode_ids;

CREATE OR REPLACE FUNCTION is_typeof(val TEXT, type_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('SELECT %L::%s', val, type_name);
    RETURN TRUE;
EXCEPTION
    WHEN others THEN
        RETURN FALSE;
END; $$ LANGUAGE PLPGSQL;

CREATE DOMAIN doc_type_txt AS TEXT
CHECK (is_typeof(VALUE, 'public.doc_type'));
CREATE DOMAIN badge_state_txt AS TEXT
CHECK (is_typeof(VALUE, 'public.badge_state'));
CREATE DOMAIN assign_type_txt AS TEXT
CHECK (is_typeof(VALUE, 'public.assign_type'));
CREATE DOMAIN building_type_txt AS TEXT
CHECK (is_typeof(VALUE, 'public.building_type'));
CREATE DOMAIN veh_type_txt AS TEXT
CHECK (is_typeof(VALUE, 'public.veh_type'));

CREATE FUNCTION abs(interval) RETURNS interval AS
  $$ select case when ($1<interval '0') then -$1 else $1 end; $$
LANGUAGE sql immutable;

CREATE OR REPLACE FUNCTION get_bit(n INT, k INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN ((n & ~(n # (1 << (k - 1)))) >> (k - 1))::bool;

CREATE OR REPLACE FUNCTION is_admin(INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN $1 = -1;

CREATE OR REPLACE FUNCTION in_out_flag(INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN get_bit($1, 1);

CREATE OR REPLACE FUNCTION pause_flag(INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN get_bit($1, 2);

CREATE OR REPLACE FUNCTION is_in_pause(INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN pause_flag($1) AND NOT in_out_flag($1);

CREATE OR REPLACE FUNCTION is_in_strutt(tbl regclass, record_id BIGINT) 
RETURNS BOOLEAN AS $$
DECLARE
    rec_created TIMESTAMP;
    rec_badge TEXT;
    rec_mark INT;
    max_created TIMESTAMP;
BEGIN
    EXECUTE format('SELECT created_at, badge_cod, mark_type FROM %s WHERE id = $1', tbl)
    INTO rec_created, rec_badge, rec_mark
    USING record_id;

    IF rec_created IS NULL OR in_out_flag(rec_mark) THEN
        RETURN FALSE;
    END IF;

    EXECUTE format('SELECT MAX(created_at) FROM %s WHERE badge_cod = $1 AND pause_flag(mark_type) = pause_flag($2)', tbl)
    INTO max_created
    USING rec_badge, rec_mark;

    RETURN max_created = rec_created;
END $$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION format_diff_time(ts_start TIMESTAMP, ts_end TIMESTAMP) RETURNS TEXT AS $$
DECLARE
    diff INTERVAL;
    hours INT;
    minutes INT;
    result TEXT;
BEGIN
    diff := abs(ts_start - ts_end);

    hours := EXTRACT(HOURS FROM diff);
    minutes := EXTRACT(MINUTES FROM diff);

    IF EXTRACT(EPOCH FROM diff) < 3600 THEN
        result := minutes || ' MINUTI';
    ELSIF minutes = 0 THEN
        result := hours || ' ORE';
    ELSE
        result := hours || ' ORE' || minutes || ' MINUTI';
    END IF;

    RETURN result;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION next_barcode(barcode_prefix) RETURNS TEXT AS $$
    SELECT $1||lpad(abs(('x'||substr(md5(nextval('barcode_ids')::TEXT),1,8))::BIT(32)::INT)::TEXT,8,'0');
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION now_or_24h_later(TIMESTAMP = CURRENT_TIMESTAMP) RETURNS TIMESTAMP AS $$
    SELECT CASE WHEN (($1 + INTERVAL '24 hours') < CURRENT_TIMESTAMP) 
    THEN date_trunc('second', $1 + INTERVAL '24 hours') 
    ELSE date_trunc('second', CURRENT_TIMESTAMP) END;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_tracciato_date(TIMESTAMP) RETURNS TEXT AS $$
    SELECT lpad(extract(day from $1)::text,2,'0')||'/'||lpad(extract(month from $1)::text,2,'0')||'/'||substring(extract(year from $1)::text, 3, 2)||' '||lpad(extract(hours from $1)::text,2,'0')||':'||lpad(extract(minutes from $1)::text,2,'0');
$$ LANGUAGE SQL;

CREATE TABLE IF NOT EXISTS clienti(
    name non_empty_text64 PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name non_empty_text64 UNIQUE NOT NULL,
    password non_empty_text64 NOT NULL,
    permessi INT NOT NULL DEFAULT 0,
    pages INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS postazioni(
    id SERIAL PRIMARY KEY,
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name),
    name non_empty_text64 NOT NULL,
    UNIQUE (cliente, name)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    usr_id INT REFERENCES users (id) ON DELETE CASCADE,
    post_id INT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (usr_id, post_id)
);

CREATE TABLE IF NOT EXISTS mazzi_chiavi(
    codice mazzo_code PRIMARY KEY DEFAULT next_barcode('5'),
    descrizione non_empty_text256,
    stato badge_state_txt NOT NULL DEFAULT 'VALIDO',
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS people(
    id SERIAL PRIMARY KEY,
    nome non_empty_text32 NOT NULL,
    cognome non_empty_text32 NOT NULL,
    assegnazione assign_type_txt NOT NULL DEFAULT 'OSPITE',
    ditta non_empty_text64,
    cod_fisc cod_fisc,
    telefono non_empty_text32,
    ndoc non_empty_text32,
    tdoc doc_type_txt,
    targa non_empty_text32,
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name),
    UNIQUE(ndoc, tdoc)
);

CREATE TABLE IF NOT EXISTS nominativi(
    codice badge_code PRIMARY KEY DEFAULT next_barcode('1'),
    descrizione non_empty_text256,
    stato badge_state NOT NULL DEFAULT 'VALIDO',
    nome non_empty_text32 NOT NULL,
    cognome non_empty_text32 NOT NULL,
    assegnazione assign_type_txt NOT NULL DEFAULT 'UTENTE',
    ditta non_empty_text64,
    cod_fisc cod_fisc,
    telefono non_empty_text32,
    ndoc non_empty_text32,
    tdoc doc_type_txt,
    scadenza DATE,
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name),
    zuc_cod zuc_code UNIQUE
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice provv_code PRIMARY KEY DEFAULT next_barcode('2'),
    descrizione non_empty_text256,
    stato badge_state_txt NOT NULL DEFAULT 'VALIDO',
    ubicazione non_empty_text32,
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice chiave_code PRIMARY KEY DEFAULT next_barcode('3'),
    descrizione non_empty_text256,
    stato badge_state_txt NOT NULL DEFAULT 'VALIDO',
    ubicazione non_empty_text32,
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name),
    indirizzo non_empty_text128,
    citta non_empty_text64,
    edificio building_type_txt NOT NULL DEFAULT 'GENERICO',
    piano non_empty_text,
    mazzo mazzo_code REFERENCES mazzi_chiavi (codice)
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice veh_code PRIMARY KEY DEFAULT next_barcode('4'),
    targa non_empty_text32 UNIQUE NOT NULL,
    descrizione non_empty_text256,
    stato badge_state_txt NOT NULL DEFAULT 'VALIDO',
    cliente non_empty_text64 NOT NULL REFERENCES clienti (name),
    tipo veh_type_txt NOT NULL DEFAULT 'GENERICO',
    proprietario badge_code NOT NULL REFERENCES nominativi (codice)
);

CREATE TABLE IF NOT EXISTS archivio_nominativi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod badge_code NOT NULL REFERENCES nominativi (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    UNIQUE (badge_cod, created_at, mark_type)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod provv_code NOT NULL REFERENCES provvisori (codice),
    person_id INT NOT NULL REFERENCES people (id),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP,
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    UNIQUE (badge_cod, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa non_empty_text32 NOT NULL REFERENCES veicoli (targa),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    UNIQUE (targa, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa non_empty_text32 NOT NULL,
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP,
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    nome non_empty_text32 NOT NULL,
    cognome non_empty_text32 NOT NULL,
    assegnazione assign_type_txt NOT NULL DEFAULT 'OSPITE',
    ditta non_empty_text64,
    cod_fisc cod_fisc,
    telefono non_empty_text32,
    ndoc non_empty_text32,
    tdoc doc_type_txt,
    tveicolo veh_type_txt NOT NULL DEFAULT 'GENERICO',
    UNIQUE (targa, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod badge_code NOT NULL REFERENCES nominativi (codice),
    chiave_cod chiave_code NOT NULL REFERENCES chiavi (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP(0)),
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    UNIQUE (chiave_cod, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod badge_code REFERENCES provvisori (codice),
    chiave_cod chiave_code NOT NULL REFERENCES chiavi (codice),
    person_id INT NOT NULL REFERENCES people (id),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP(0)),
    mark_type INT NOT NULL DEFAULT 0,
    username non_empty_text64 NOT NULL REFERENCES users (name),
    ip non_empty_text32 NOT NULL,
    UNIQUE (chiave_cod, created_at)
);

CREATE TABLE IF NOT EXISTS protocolli(
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    descrizione non_empty_text256
);

CREATE TABLE IF NOT EXISTS documenti(
    filename VARCHAR(256),
    descrizione non_empty_text256,
    prot_id INT REFERENCES protocolli (id) ON DELETE CASCADE,
    PRIMARY KEY (filename, prot_id)
);

CREATE TABLE IF NOT EXISTS prot_visibile_da(
    prot_id INT REFERENCES protocolli (id) ON DELETE CASCADE,
    post_id INT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (prot_id, post_id)
);

CREATE OR REPLACE FUNCTION get_in_out_times(record_id BIGINT, is_pause BOOLEAN) 
RETURNS TABLE (ts_in TIMESTAMP, ts_out TIMESTAMP) AS $$
    WITH out_row AS (
        SELECT created_at, badge_cod
        FROM archivio_nominativi
        WHERE id = record_id 
        AND in_out_flag(mark_type) 
        AND pause_flag(mark_type) = is_pause
    ),
    in_row AS (
        SELECT a.created_at
        FROM archivio_nominativi a
        JOIN out_row o ON a.badge_cod = o.badge_cod
        WHERE NOT in_out_flag(a.mark_type)
        AND pause_flag(a.mark_type) = is_pause
        AND a.created_at < o.created_at
        ORDER BY a.created_at DESC 
        LIMIT 1
    )
    SELECT i.created_at AS ts_in, o.created_at AS ts_out
    FROM out_row o
    LEFT JOIN in_row i ON true;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_worked_time(record_id BIGINT, is_pause BOOLEAN)
RETURNS TEXT AS $$
    SELECT CASE
            WHEN ts_in IS NULL OR ts_out IS NULL
                THEN NULL
            ELSE format_diff_time(ts_in, ts_out)
        END
    FROM get_in_out_times(record_id, is_pause);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_night_shift(record_id BIGINT, is_pause BOOLEAN)
RETURNS TEXT AS $$
    SELECT CASE
            WHEN ts_in IS NULL OR ts_out IS NULL
                THEN NULL
            WHEN ts_out::date = ts_in::date 
                THEN 'NO'
            ELSE 'SI'
        END
    FROM get_in_out_times(record_id, is_pause);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_work_info(record_id BIGINT, is_pause BOOLEAN)
RETURNS TABLE (durata_turno TEXT, notte TEXT) AS $$
    SELECT 
        CASE
            WHEN ts_in IS NULL OR ts_out IS NULL
                THEN NULL
            ELSE format_diff_time(ts_in, ts_out)
        END AS durata_turno,
        CASE
            WHEN ts_in IS NULL OR ts_out IS NULL
                THEN NULL
            WHEN ts_out::date = ts_in::date 
                THEN 'NO'
            ELSE 'SI'
        END AS notte
    FROM get_in_out_times(record_id, is_pause);
$$ LANGUAGE sql STABLE;

CREATE VIEW full_archivio AS
    WITH full_archivio_nominativi AS (
        SELECT a.id, n.codice AS badge, n.nome, n.cognome, n.assegnazione, NULL AS targa, NULL AS chiave,
        a.mark_type, 
        CASE WHEN in_out_flag(a.mark_type) THEN 'O' ELSE 'I' END AS in_out, 
        'BADGE' AS tipo, 'NO' AS provvisorio,
        CASE WHEN pause_flag(a.mark_type) THEN 'SI' ELSE 'NO' END AS pausa,
        po.cliente, po.name AS postazione, po.id AS post_id, a.created_at,
        get_worked_time(a.id, pause_flag(a.mark_type)) AS durata_turno,
        is_night_shift(a.id, pause_flag(a.mark_type)) AS notte,
        NULL AS tveicolo, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS citta, NULL AS edificio,
        NULL AS piano, a.username, a.ip, NULL AS documento
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_provvisori AS (
        SELECT a.id, a.badge_cod AS badge, pe.nome, pe.cognome, pe.assegnazione, pe.targa,  NULL AS chiave,
        a.mark_type, 
        CASE WHEN in_out_flag(a.mark_type) THEN 'O' ELSE 'I' END AS in_out, 
        'BADGE' AS tipo, 'SI' AS provvisorio,
        'NO' AS pausa,
        po.cliente, po.name AS postazione, po.id AS post_id, a.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        NULL AS tveicolo, pe.ditta, pe.cod_fisc, pe.ndoc, pe.tdoc, pe.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS citta,
        NULL AS edificio, NULL AS piano, a.username, a.ip, 'DOCP_'||a.id||'.pdf' AS documento
        FROM people AS pe
        JOIN archivio_provvisori AS a ON pe.id = a.person_id 
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_veicoli AS (
        SELECT a.id, NULL AS badge, n.nome, n.cognome, n.assegnazione, ve.targa, NULL AS chiave, 
        a.mark_type, 
        CASE WHEN in_out_flag(a.mark_type) THEN 'O' ELSE 'I' END AS in_out,
        'VEICOLO' AS tipo, 'NO' AS provvisorio,
        'NO' AS pausa,
        po.cliente, po.name AS postazione, po.id AS post_id, a.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        ve.tipo AS tveicolo, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS citta,
        NULL AS edificio, NULL AS piano, a.username, a.ip, NULL AS documento
        FROM nominativi AS n
        JOIN veicoli AS ve ON n.codice = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.targa = a.targa
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_veicoli_prov AS (
        SELECT a.id, NULL AS badge, a.nome, a.cognome, a.assegnazione, a.targa, NULL AS chiave, 
        a.mark_type, 
        CASE WHEN in_out_flag(a.mark_type) THEN 'O' ELSE 'I' END AS in_out,
        'VEICOLO' AS tipo, 'SI' AS provvisorio,
        'NO' AS pausa,
        po.cliente, po.name AS postazione, po.id AS post_id, a.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        a.tveicolo, a.ditta, a.cod_fisc, a.ndoc, a.tdoc, a.telefono,
        NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS citta, NULL AS edificio, NULL AS piano, a.username, a.ip, NULL AS documento
        FROM archivio_veicoli_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_chiavi AS (
        SELECT t1.id, t1.codice AS badge, t1.nome, t1.cognome, t1.assegnazione, NULL AS targa, t2.codice AS chiave, 
        t1.mark_type, 
        CASE WHEN in_out_flag(t1.mark_type) THEN 'O' ELSE 'I' END AS in_out,
        'CHIAVE' AS tipo, 'NO' AS provvisorio,
        'NO' AS pausa,
        t1.cliente, t1.postazione, t1.post_id, t1.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        NULL AS tveicolo, t1.ditta, t1.cod_fisc, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta,
        t2.edificio, t2.piano, t1.username, t1.ip, NULL AS documento
        FROM (
            SELECT a.id, n.codice, po.cliente, po.name AS postazione, po.id AS post_id, a.created_at, a.mark_type, a.username, a.ip, a.chiave_cod,
            n.nome, n.cognome, n.ditta, n.cod_fisc, n.assegnazione, n.ndoc, n.tdoc, n.telefono, n.scadenza
            FROM nominativi AS n
            JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
        ) AS t2 ON t1.chiave_cod = t2.codice
    ),
    full_archivio_chiavi_prov AS (
        SELECT t1.id, t1.badge_cod, t1.nome, t1.cognome, t1.assegnazione, NULL AS targa, t2.codice AS chiave, 
        t1.mark_type, 
        CASE WHEN in_out_flag(t1.mark_type) THEN 'O' ELSE 'I' END AS in_out,
        'CHIAVE' AS tipo, 'SI' AS provvisorio,
        'NO' AS pausa,
        t1.cliente, t1.postazione, t1.post_id, t1.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        NULL AS tveicolo, t1.ditta, t1.cod_fisc, t1.ndoc, t1.tdoc, t1.telefono, NULL::DATE AS scadenza, t2.indirizzo, t2.citta,
        CAST(t2.edificio AS TEXT) AS edificio, t2.piano, t1.username, t1.ip, NULL AS documento
        FROM (
            SELECT a.id, a.badge_cod, po.cliente, po.name AS postazione, po.id AS post_id, a.created_at, a.mark_type, a.username, a.ip, a.chiave_cod, 
            pe.nome, pe.cognome, pe.ditta, pe.cod_fisc, pe.assegnazione, pe.ndoc, pe.tdoc, pe.telefono
            FROM people AS pe
            JOIN archivio_chiavi_prov AS a ON pe.id = a.person_id
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi_prov AS a ON ch.codice = a.chiave_cod
        ) AS t2 ON t1.chiave_cod = t2.codice
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_nominativi)
        UNION
        (SELECT * FROM full_archivio_provvisori)
        UNION
        (SELECT * FROM full_archivio_veicoli)
        UNION
        (SELECT * FROM full_archivio_veicoli_prov)
        UNION
        (SELECT * FROM full_archivio_chiavi)
        UNION
        (SELECT * FROM full_archivio_chiavi_prov)
    ) AS t
    ORDER BY created_at;

CREATE VIEW tracciati AS
    SELECT n.zuc_cod, a.created_at, 
    get_tracciato_date(a.created_at) AS formatted_date,
    CASE WHEN in_out_flag(a.mark_type) THEN 'U' ELSE 'I' END AS mark_type
    FROM archivio_nominativi AS a
    JOIN nominativi AS n ON a.badge_cod = n.codice
    WHERE zuc_cod IS NOT NULL AND NOT pause_flag(a.mark_type);

CREATE VIEW full_in_strutt_badges AS
    WITH full_archivio_nominativi AS (
        SELECT a.id, n.codice, n.descrizione, 
        CASE WHEN is_in_pause(a.mark_type) THEN 'SI' ELSE 'NO' END AS pausa, 
        po.cliente, po.name AS postazione, a.created_at, 
        n.nome, n.cognome, n.assegnazione, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id, a.mark_type, NULL::INT AS person_id
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt('archivio_nominativi', a.id)
    ),
    full_archivio_provvisori AS (
        SELECT a.id, a.badge_cod AS codice, NULL AS descrizione, 'NO' AS pausa, po.cliente, po.name AS postazione, 
        a.created_at, pe.nome, pe.cognome, pe.assegnazione, pe.ditta, pe.cod_fisc, pe.ndoc, pe.tdoc, pe.telefono, 
        NULL::DATE AS scadenza, po.id AS post_id, a.mark_type, a.person_id
        FROM people AS pe
        JOIN archivio_provvisori AS a ON pe.id = a.person_id
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt('archivio_provvisori', a.id)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_nominativi)
        UNION
        (SELECT * FROM full_archivio_provvisori)
    ) AS t
    ORDER BY created_at DESC;

CREATE VIEW full_in_strutt_veicoli AS
    WITH full_archivio_veicoli AS (
        SELECT a.id, ve.targa, ve.descrizione, ve.tipo AS tveicolo, po.cliente, po.name AS postazione, a.created_at, 
        n.nome, n.cognome, n.assegnazione, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id
        FROM nominativi AS n
        JOIN veicoli AS ve ON n.codice = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.targa = a.targa
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt('archivio_veicoli', a.id)
    ),
    full_archivio_veicoli_prov AS (
        SELECT a.id, a.targa, NULL AS descrizione, a.tveicolo, po.cliente, po.name AS postazione, a.created_at, 
        a.nome, a.cognome, a.assegnazione, a.ditta, a.cod_fisc, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
        FROM archivio_veicoli_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt('archivio_veicoli_prov', a.id)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_veicoli)
        UNION
        (SELECT * FROM full_archivio_veicoli_prov)
    ) AS t
    ORDER BY created_at DESC;

CREATE VIEW full_in_prestito AS
    WITH full_archivio_chiavi AS (
        SELECT DISTINCT t1.id, t1.codice AS badge, t2.codice AS chiave, t1.cliente, t1.postazione, t1.created_at, t1.nome, t1.cognome,
        t1.assegnazione, t1.ditta, t1.cod_fisc, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, t2.edificio, t2.piano,
        t1.post_id, NULL::INT AS person_id
        FROM (
            SELECT a.id, n.codice, po.cliente, po.name AS postazione, po.id AS post_id, a.created_at, a.chiave_cod,
            n.nome, n.cognome, n.ditta, n.assegnazione, n.ndoc, n.tdoc, n.cod_fisc, n.telefono, n.scadenza
            FROM nominativi AS n
            JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
        ) AS t2 ON t1.chiave_cod = t2.codice
        WHERE is_in_strutt('archivio_chiavi', t1.id)
    ),
    full_archivio_chiavi_prov AS (
        SELECT DISTINCT t1.id, t1.badge_cod AS badge, t2.codice AS chiave, t1.cliente, t1.postazione, t1.created_at, t1.nome, t1.cognome,
        t1.assegnazione, t1.ditta, t1.cod_fisc, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, t2.edificio, t2.piano,
        t1.post_id, t1.person_id
        FROM (
            SELECT a.id, a.badge_cod, po.cliente, po.name AS postazione, po.id AS post_id, a.created_at, a.chiave_cod,
            pe.nome, pe.cognome, pe.ditta, pe.assegnazione, pe.ndoc, pe.tdoc, pe.cod_fisc, pe.telefono, NULL::DATE AS scadenza, a.person_id
            FROM people AS pe
            JOIN archivio_chiavi_prov AS a ON pe.id = a.person_id
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi_prov AS a ON ch.codice = a.chiave_cod
        ) AS t2 ON t1.chiave_cod = t2.codice
        WHERE is_in_strutt('archivio_chiavi_prov', t1.id)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_chiavi)
        UNION
        (SELECT * FROM full_archivio_chiavi_prov)
    ) AS t
    ORDER BY created_at DESC;

CREATE VIEW in_strutt_badges AS
    SELECT id, codice, descrizione, assegnazione, cliente, postazione, nome, cognome, ditta, created_at
    FROM full_in_strutt_badges;

CREATE VIEW in_strutt_veicoli AS
    SELECT id, targa, descrizione, tveicolo, assegnazione, cliente, postazione, nome, cognome, ditta, created_at 
    FROM full_in_strutt_veicoli;

CREATE VIEW in_prestito AS
    SELECT id, badge, nome, cognome, ditta, cliente, postazione, chiave, created_at FROM full_in_prestito;

CREATE VIEW full_users AS
    SELECT
        u.*,
        COALESCE(
            json_agg(DISTINCT to_jsonb(p)) FILTER (WHERE p.id IS NOT NULL),
            '[]'::json
        ) AS postazioni
    FROM users u
    LEFT JOIN postazioni_user pu ON pu.usr_id = u.id
    LEFT JOIN postazioni p ON p.id = pu.post_id OR is_admin(u.permessi)
    GROUP BY u.id;

CREATE VIEW full_protocolli AS
    SELECT pr.id, pr.date, pr.descrizione AS prot_descrizione, d.filename, d.descrizione AS doc_descrizione,
    ARRAY(
        SELECT DISTINCT po.id FROM postazioni AS po JOIN prot_visibile_da AS v ON po.id = v.post_id AND v.prot_id = pr.id
    ) AS visibile_da_id, 
    ARRAY(
        SELECT DISTINCT po.name FROM postazioni AS po JOIN prot_visibile_da AS v ON po.id = v.post_id AND v.prot_id = pr.id
    ) AS visibile_da_name 
    FROM protocolli AS pr
    JOIN documenti AS d ON pr.id = d.prot_id;

CREATE VIEW assegnazioni AS SELECT unnest(enum_range(NULL::assign_type))::TEXT AS value ORDER BY value;
CREATE VIEW edifici AS SELECT unnest(enum_range(NULL::building_type))::TEXT AS value ORDER BY value;
CREATE VIEW tveicoli AS SELECT unnest(enum_range(NULL::veh_type))::TEXT AS value ORDER BY value;

CREATE VIEW nominativi_w_docs AS
    SELECT *, 'PRIVACY_'||codice||'.pdf' AS privacy, 'DOC_'||codice||'.pdf' AS documento FROM nominativi;

CREATE VIEW chiavi_w_mazzo_descr AS
    SELECT c.*, m.descrizione AS descr_mazzo FROM chiavi c LEFT JOIN mazzi_chiavi m ON c.mazzo = m.codice;

CREATE VIEW mazzi_w_key_count AS
    SELECT m.*, (
        SELECT COUNT(c.codice) FROM chiavi c WHERE c.mazzo = m.codice
    ) AS n_chiavi FROM mazzi_chiavi m;

\c postgres;