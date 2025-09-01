\c postgres;

DROP DATABASE IF EXISTS accessi1;
CREATE DATABASE accessi1;
\c accessi1;

CREATE TYPE barcode_prefix AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE doc_type AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE', 'PASSAPORTO', 'TESSERINO PROFESSIONALE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assign_type as ENUM ('OSPITE', 'UTENTE', 'GIORNALISTA', 'MANUTENZIONE', 'ASSOCIAZIONE', 'COOPERATIVA', 'COLLABORATORE',
                                'PULIZIE', 'PORTINERIA', 'FACCHINAGGIO', 'CORRIERE', 'UNIVERSITARIO', 'AMMINISTRAZIONE', 
                                'PARENTE DEGENTE');
CREATE TYPE building_type as ENUM ('APPARTAMENTO', 'VILLETTA', 'CAPANNONE', 'FONDO', 'CLINICA', 'UFFICIO', 'ARCHIVIO', 'LOCALE TECNICO',
                                    'CAVEDIO', 'SCALE', 'REI', 'BIBLIOTECA', 'AUDITORIUM', 'FORESTERIA', 'COLLEGAMENTO', 'INFERMERIA',
                                    'WC', 'AULA', 'CORRIDOIO', 'BAR', 'ASILO', 'TERRAZZO', 'CELLA', 'GENERICO');
CREATE TYPE veh_type as ENUM ('AUTO', 'MOTO', 'BICICLETTA', 'GENERICO');
-- CREATE TYPE badge_type as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE');
CREATE TYPE mark_type AS ENUM ('I', 'O', 'PI', 'PO', 'KI', 'KO');

CREATE SEQUENCE arch_ids;
CREATE SEQUENCE barcode_ids;

CREATE FUNCTION abs(interval) RETURNS interval AS
  $$ select case when ($1<interval '0') then -$1 else $1 end; $$
LANGUAGE sql immutable;

CREATE OR REPLACE FUNCTION is_typeof(val TEXT, type_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('SELECT %L::%s', val, type_name);
    RETURN TRUE;
EXCEPTION
    WHEN others THEN
        RETURN FALSE;
END; $$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION check_bit(n INT, k INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN ((n & ~(n # (1 << (k - 1)))) >> (k - 1))::bool;

CREATE OR REPLACE FUNCTION admin_flags() RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN -1;

CREATE OR REPLACE FUNCTION is_in_strutt(tbl regclass, record_id BIGINT) 
RETURNS BOOLEAN AS $$
DECLARE
    rec_created TIMESTAMP;
    rec_badge TEXT;
    rec_mark TEXT;
    max_created TIMESTAMP;
BEGIN
    EXECUTE format('SELECT created_at, badge_cod, mark_type FROM %s WHERE id = $1', tbl)
    INTO rec_created, rec_badge, rec_mark
    USING record_id;

    IF rec_created IS NULL OR (rec_mark != 'I' AND rec_mark != 'PI' AND rec_mark != 'PO' AND rec_mark != 'KI') THEN
        RETURN FALSE;
    END IF;

    EXECUTE format('SELECT MAX(created_at) FROM %s WHERE badge_cod = $1', tbl)
    INTO max_created
    USING rec_badge;

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

CREATE OR REPLACE FUNCTION is_pause(TEXT) RETURNS TEXT AS $$
    SELECT CASE WHEN ($1 = 'PI')
        THEN 'SI'
        ELSE 'NO' 
    END;
$$ LANGUAGE SQL immutable;

CREATE TABLE IF NOT EXISTS clienti(
    name VARCHAR(64) PRIMARY KEY CHECK (name != '')
);

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL CHECK (name != ''),
    password VARCHAR(64) NOT NULL CHECK (password != ''),
    permessi INT NOT NULL DEFAULT 0,
    pages INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS postazioni(
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    name VARCHAR(64) NOT NULL CHECK (name != ''),
    UNIQUE (cliente, name)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    usr_id INT REFERENCES users (id) ON DELETE CASCADE,
    post_id INT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (usr_id, post_id)
);

CREATE TABLE IF NOT EXISTS mazzi_chiavi(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('5'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'public.badge_state')),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    CONSTRAINT invalid_mazzo_barcode CHECK (left(codice, 1) = '5' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS people(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'OSPITE' CHECK (is_typeof(assegnazione, 'public.assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    cod_fisc VARCHAR(16) CHECK (length(cod_fisc) = 16),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (is_typeof(tdoc, 'public.doc_type')),
    targa VARCHAR(32) CHECK (targa != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    UNIQUE(ndoc, tdoc)
);

CREATE TABLE IF NOT EXISTS nominativi(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('1'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'public.badge_state')),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'UTENTE' CHECK (is_typeof(assegnazione, 'public.assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    cod_fisc VARCHAR(16) CHECK (length(cod_fisc) = 16),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (is_typeof(tdoc, 'public.doc_type')),
    scadenza DATE,
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    zuc_cod VARCHAR(6) UNIQUE CHECK (length(zuc_cod) = 6 AND (zuc_cod ~ '^[0-9]+$')),
    CONSTRAINT invalid_nom_barcode CHECK (left(codice, 1) = '1' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('2'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'public.badge_state')),
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    CONSTRAINT invalid_prov_barcode CHECK (((left(codice, 1) = '2' AND length(codice) = 9) OR length(codice) = 7) AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('3'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'public.badge_state')),
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    indirizzo VARCHAR(128) CHECK (indirizzo != ''),
    citta VARCHAR(64) CHECK (citta != ''),
    edificio VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(edificio, 'public.building_type')),
    piano TEXT CHECK (piano != ''),
    mazzo VARCHAR(9) REFERENCES mazzi_chiavi (codice),
    CONSTRAINT invalid_chiave_barcode CHECK (left(codice, 1) = '3' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('4'),
    targa VARCHAR(32) UNIQUE NOT NULL CHECK (targa != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'public.badge_state')),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    tipo VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(tipo, 'public.veh_type')),
    proprietario VARCHAR(9) NOT NULL REFERENCES nominativi (codice),
    CONSTRAINT invalid_veicolo_barcode CHECK (left(codice, 1) = '4' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS archivio_nominativi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) NOT NULL REFERENCES nominativi (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    UNIQUE (badge_cod, created_at, mark_type)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) NOT NULL REFERENCES provvisori (codice),
    person_id INT NOT NULL REFERENCES people (id),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP,
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    UNIQUE (badge_cod, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa VARCHAR(32) NOT NULL REFERENCES veicoli (targa),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    UNIQUE (targa, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa VARCHAR(32) NOT NULL,
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP,
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'OSPITE' CHECK (is_typeof(assegnazione, 'public.assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    cod_fisc VARCHAR(16) CHECK (length(cod_fisc) = 16),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (is_typeof(tdoc, 'public.doc_type')),
    tveicolo VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(tveicolo, 'public.veh_type')),
    UNIQUE (targa, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) NOT NULL REFERENCES nominativi (codice),
    chiave_cod VARCHAR(9) NOT NULL REFERENCES chiavi (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP(0)),
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    UNIQUE (chiave_cod, created_at)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) REFERENCES provvisori (codice),
    chiave_cod VARCHAR(9) NOT NULL REFERENCES chiavi (codice),
    person_id INT NOT NULL REFERENCES people (id),
    post_id INT NOT NULL REFERENCES postazioni (id),
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP(0)),
    mark_type VARCHAR(2) NOT NULL CHECK (is_typeof(mark_type, 'mark_type')),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    UNIQUE (chiave_cod, created_at)
);

CREATE TABLE IF NOT EXISTS protocolli(
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    descrizione TEXT CHECK (descrizione != '')
);

CREATE TABLE IF NOT EXISTS documenti(
    filename VARCHAR(256),
    descrizione TEXT CHECK (descrizione != ''),
    prot_id INT REFERENCES protocolli (id) ON DELETE CASCADE,
    PRIMARY KEY (filename, prot_id)
);

CREATE TABLE IF NOT EXISTS prot_visibile_da(
    prot_id INT REFERENCES protocolli (id) ON DELETE CASCADE,
    post_id INT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (prot_id, post_id)
);

-- CREATE TABLE IF NOT EXISTS archivio_dump(
--     id BIGINT,
--     badge TEXT,
--     targa TEXT,
--     chiave TEXT,
--     tipo TEXT,
--     provvisorio TEXT,
--     notte TEXT,
--     durata_turno TEXT,
--     cliente TEXT,
--     postazione TEXT,
--     data_in TIMESTAMP,
--     data_out TIMESTAMP,
--     username TEXT,
--     ip TEXT,
--     nome TEXT,
--     cognome TEXT,
--     assegnazione TEXT,
--     tveicolo TEXT,
--     ditta TEXT,
--     ndoc TEXT,
--     piano TEXT
-- );

CREATE OR REPLACE FUNCTION get_in_out_times(record_id BIGINT, is_pause BOOLEAN) 
RETURNS TABLE (ts_in TIMESTAMP, ts_out TIMESTAMP) AS $$
    WITH out_row AS (
        SELECT created_at, badge_cod
        FROM archivio_nominativi
        WHERE id = record_id AND mark_type = CASE WHEN is_pause THEN 'PO' ELSE 'O' END
    ),
    in_row AS (
        SELECT a.created_at
        FROM archivio_nominativi a
        JOIN out_row o ON a.badge_cod = o.badge_cod
        WHERE a.mark_type = CASE WHEN is_pause THEN 'PI' ELSE 'I' END AND a.created_at < o.created_at
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
        a.mark_type, 'BADGE' AS tipo, 'NO' AS provvisorio,
        po.cliente, po.name AS postazione, po.id AS post_id, a.created_at,
        get_worked_time(a.id, true) AS durata_turno,
        is_night_shift(a.id, true) AS notte,
        NULL AS tveicolo, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS citta, NULL AS edificio,
        NULL AS piano, a.username, a.ip, NULL AS documento
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_provvisori AS (
        SELECT a.id, a.badge_cod AS badge, pe.nome, pe.cognome, pe.assegnazione, pe.targa,  NULL AS chiave,
        a.mark_type, 'BADGE' AS tipo, 'SI' AS provvisorio,
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
        a.mark_type, 'VEICOLO' AS tipo, 'NO' AS provvisorio,
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
        a.mark_type, 'VEICOLO' AS tipo, 'SI' AS provvisorio,
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
        t1.mark_type, 'CHIAVE' AS tipo, 'NO' AS provvisorio,
        t1.cliente, t1.postazione, t1.post_id, t1.created_at,
        NULL AS durata_turno,
        NULL AS notte,
        NULL AS tveicolo, t1.ditta, t1.cod_fisc, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta,
        CAST(t2.edificio AS TEXT) AS edificio, t2.piano, t1.username, t1.ip, NULL AS documento
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
        t1.mark_type, 'CHIAVE' AS tipo, 'SI' AS provvisorio,
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
    CASE
        WHEN a.mark_type = 'I' THEN 'I'
        WHEN a.mark_type = 'O' THEN 'U'
        ELSE NULL
    END AS mark_type
    FROM archivio_nominativi AS a
    JOIN nominativi AS n ON a.badge_cod = n.codice
    WHERE zuc_cod IS NOT NULL;

CREATE VIEW full_in_strutt_badges AS
    WITH full_archivio_nominativi AS (
        SELECT a.id, n.codice, n.descrizione, is_pause(a.mark_type) AS pausa, po.cliente, po.name AS postazione, a.created_at, 
        n.nome, n.cognome, n.assegnazione, n.ditta, n.cod_fisc, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id, a.mark_type
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt('archivio_nominativi', a.id)
    ),
    full_archivio_provvisori AS (
        SELECT a.id, a.badge_cod AS codice, NULL AS descrizione, 'NO' AS pausa, po.cliente, po.name AS postazione, 
        a.created_at, pe.nome, pe.cognome, pe.assegnazione, pe.ditta, pe.cod_fisc, pe.ndoc, pe.tdoc, pe.telefono, 
        NULL::DATE AS scadenza, po.id AS post_id, a.mark_type
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
    SELECT id, codice, descrizione, assegnazione, cliente, postazione, nome, cognome, ditta, created_at FROM full_in_strutt_badges;

CREATE VIEW in_strutt_veicoli AS
    SELECT id, targa, descrizione, tveicolo, assegnazione, cliente, postazione, nome, cognome, ditta, created_at FROM full_in_strutt_veicoli;

CREATE VIEW in_prestito AS
    SELECT id, badge, nome, cognome, ditta, cliente, postazione, chiave, created_at FROM full_in_prestito;

CREATE VIEW full_users AS 
    SELECT u.*,
    ARRAY(
        SELECT DISTINCT p.cliente FROM postazioni AS p
        LEFT JOIN postazioni_user AS pu ON p.id = pu.post_id
        WHERE u.id = pu.usr_id OR u.permessi = admin_flags()
    ) AS clienti,
    ARRAY(
        SELECT DISTINCT p.id FROM postazioni AS p
        LEFT JOIN postazioni_user AS pu ON p.id = pu.post_id
        WHERE u.id = pu.usr_id OR u.permessi = admin_flags()
    ) AS postazioni_ids
    FROM users AS u;

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

-- CREATE OR REPLACE PROCEDURE mark_out(arch_id BIGINT, arch_tname regclass) AS $$
-- DECLARE
--     tmp_id BIGINT;
-- BEGIN
--     INSERT INTO archivio_dump (SELECT * FROM alt_archivio WHERE id = arch_id) RETURNING id INTO tmp_id;
--     IF tmp_id IS NULL THEN
--         RAISE EXCEPTION 'Impossibile inserire badge 
--         RAISE EXCEPTION 'Impossibile rimuovere badge in struttura';
--     END IF;
-- END; $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE PROCEDURE mark_out_many(arch_ids BIGINT[], arch_tname regclass) AS $$
-- DECLARE
--     tmp_ids BIGINT[];
--     n_ids INT = cardinality(arch_ids);
-- BEGIN
--     INSERT INTO archivio_dump (SELECT * FROM alt_archivio WHERE id = ANY(arch_ids)) RETURNING id INTO tmp_ids;
--     IF tmp_ids IS NULL OR cardinality(tmp_ids) != n_ids THEN
--         RAISE EXCEPTION 'Impossibile inserire uno o più badge in archivio';
--     END IF;
--     EXECUTE format('DELETE FROM %I WHERE id = ANY(%L) RETURNING id', arch_tname, arch_ids) INTO tmp_ids;
--     IF tmp_ids IS NULL OR cardinality(tmp_ids) != n_ids THEN
--         RAISE EXCEPTION 'Impossibile rimuovere uno o più badge in struttura';
--     END IF;
-- END; $$ LANGUAGE plpgsql;

/*######################################################################################################################################################*/

/*######################################################################################################################################################*/

/*######################################################################################################################################################*/

\c postgres;