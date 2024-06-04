\c postgres;

DROP DATABASE IF EXISTS accessi1;
CREATE DATABASE accessi1;
\c accessi1;

CREATE TYPE barcode_prefix AS ENUM ('1', '2', '3', '4');
CREATE TYPE doc_type AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assign_type as ENUM ('OSPITE', 'UTENTE', 'GIORNALISTA', 'MANUTENZIONE', 'ASSOCIAZIONE', 'COOPERATIVA', 'COLLABORATORE', 'PULIZIE', 'PORTINERIA', 'FACCHINAGGIO', 'CORRIERE', 'UNIVERSITARIO');
CREATE TYPE building_type as ENUM ('APPARTAMENTO', 'VILLETTA', 'CAPANNONE', 'FONDO', 'CLINICA', 'UFFICIO', 'GENERICO');
CREATE TYPE veh_type as ENUM ('AUTO', 'MOTO', 'BICICLETTA', 'GENERICO');
-- CREATE TYPE badge_type as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE');
-- CREATE TYPE mark_type AS ENUM ('I', 'U');

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

CREATE OR REPLACE FUNCTION is_in_strutt(date_in TIMESTAMP, date_out TIMESTAMP) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN (date_in <= CURRENT_TIMESTAMP AND date_out > CURRENT_TIMESTAMP);

CREATE OR REPLACE FUNCTION date_in_out_diff(date_in timestamp without time zone, date_out timestamp without time zone = CURRENT_TIMESTAMP) RETURNS TEXT
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN (date_part('epoch', date_out - date_in) * INTERVAL '1 second')::TEXT;

CREATE OR REPLACE FUNCTION dates_are_not_equal(TIMESTAMP, TIMESTAMP = CURRENT_TIMESTAMP) RETURNS TEXT AS $$
    SELECT CASE WHEN (date_trunc('day', $1) != date_trunc('day', $2)) THEN 'SI' ELSE 'NO' END;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION next_barcode(barcode_prefix) RETURNS TEXT AS $$
    SELECT $1||lpad(abs(('x'||substr(md5(nextval('barcode_ids')::TEXT),1,8))::BIT(32)::INT)::TEXT,8,'0');
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION now_or_24h_later(TIMESTAMP = CURRENT_TIMESTAMP) RETURNS TIMESTAMP AS $$
    SELECT CASE WHEN (($1 + INTERVAL '24 hours') < CURRENT_TIMESTAMP) 
    THEN date_trunc('second', $1 + INTERVAL '24 hours') 
    ELSE date_trunc('second', CURRENT_TIMESTAMP) END;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_tracciato_date(TIMESTAMP) RETURNS TEXT AS $$
    SELECT lpad(extract(day from $1)::text,2,'0')||'/'||lpad(extract(month from $1)::text,2,'0')||'/'||extract(year from $1)::text||' '||$1::timestamp::time;
$$ LANGUAGE SQL;

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

CREATE TABLE IF NOT EXISTS nominativi(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('1'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'badge_state')),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'UTENTE' CHECK (is_typeof(assegnazione, 'assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (is_typeof(tdoc, 'doc_type')),
    scadenza DATE,
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    zuc_cod VARCHAR(6) UNIQUE CHECK (length(zuc_cod) = 6 AND (zuc_cod ~ '^[0-9]+$')),
    CONSTRAINT invalid_nom_barcode CHECK (left(codice, 1) = '1' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('2'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'badge_state')),
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    CONSTRAINT invalid_prov_barcode CHECK (((left(codice, 1) = '2' AND length(codice) = 9) OR length(codice) = 7) AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('3'),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'badge_state')),
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    indirizzo VARCHAR(128) CHECK (indirizzo != ''),
    citta VARCHAR(64) CHECK (citta != ''),
    edificio VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(edificio, 'building_type')),
    piano TEXT CHECK (piano != ''),
    proprietario VARCHAR(9) REFERENCES nominativi (codice),
    CONSTRAINT invalid_chiave_barcode CHECK (left(codice, 1) = '3' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice VARCHAR(9) PRIMARY KEY DEFAULT next_barcode('4'),
    targa VARCHAR(32) UNIQUE NOT NULL CHECK (targa != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato VARCHAR(32) NOT NULL DEFAULT 'VALIDO' CHECK (is_typeof(stato, 'badge_state')),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    tipo VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(tipo, 'veh_type')),
    proprietario VARCHAR(9) NOT NULL REFERENCES nominativi (codice),
    CONSTRAINT invalid_veicolo_barcode CHECK (left(codice, 1) = '4' AND length(codice) = 9 AND (codice ~ '^[0-9]+$'))
);

CREATE TABLE IF NOT EXISTS archivio_nominativi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) NOT NULL REFERENCES nominativi (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_ge_data_out CHECK (data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) NOT NULL REFERENCES provvisori (codice),
    post_id INT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'OSPITE' CHECK (is_typeof(assegnazione, 'assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (is_typeof(tdoc, 'doc_type')),
    CONSTRAINT data_in_ge_data_out CHECK (data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa VARCHAR(32) NOT NULL REFERENCES veicoli (targa),
    post_id INT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_ge_data_out CHECK (data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    targa VARCHAR(32) NOT NULL,
    post_id INT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione VARCHAR(32) NOT NULL DEFAULT 'OSPITE' CHECK (is_typeof(assegnazione, 'assign_type')),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc VARCHAR(32) CHECK (tdoc = 'CARTA IDENTITA' OR tdoc = 'PATENTE' OR tdoc = 'TESSERA STUDENTE'),
    tveicolo VARCHAR(32) NOT NULL DEFAULT 'GENERICO' CHECK (is_typeof(tveicolo, 'veh_type')),
    CONSTRAINT data_in_ge_data_out CHECK (data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id BIGINT PRIMARY KEY DEFAULT nextval('arch_ids'),
    badge_cod VARCHAR(9) REFERENCES nominativi (codice),
    chiave_cod VARCHAR(9) REFERENCES chiavi (codice),
    post_id INT REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_ge_data_out CHECK (data_out > data_in)
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
--     tempo_in_strutt TEXT,
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
--     ndoc TEXT,ctualCliente
--     piano TEXT
-- );

-- CREATE VIEW alt_archivio AS
--     WITH alt_archivio_nominativi AS (
--         SELECT a.id, n.codice AS badge, NULL AS targa, NULL AS chiave, 'BADGE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in) AS notte, date_in_out_diff(a.data_in) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, now_or_24h_later(a.data_in) AS data_out, a.username, a.ip, n.nome, n.cognome, n.assegnazione AS assengazione, NULL AS tveicolo, n.ditta, n.ndoc, n.tdoc AS tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
--         FROM nominativi AS n
--         JOIN archivio_nominativictualCliente
--     alt_archivio_veicoli AS (
--         SELECT a.id, NULL AS badge, ve.targa, NULL AS chiave, 'VEICOLO' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in) AS notte, date_in_out_diff(a.data_in) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, now_or_24h_later(a.data_in) AS data_out, a.username, a.ip, n.nome, n.cognome, n.assegnazione AS assegnazione, ve.tipo AS tveicolo, n.ditta, n.ndoc, n.tdoc AS tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
--         FROM nominativi AS n
--         JOIN veicoli AS ve ON n.codice = ve.proprietario
--         JOIN archivio_veicoli AS a ON ve.targa = a.targa
--         JOIN postazioni AS po ON a.post_id = po.id 
--     ),
--     alt_archivio_veicoli_prov AS (
--         SELECT a.id, NULL AS badge, a.targa, NULL AS chiave, 'VEICOLO' AS tipo, 'SI' AS provvisorio, dates_are_not_equal(a.data_in) AS notte, date_in_out_diff(a.data_in) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, now_or_24h_later(a.data_in) AS data_out, a.username, a.ip, a.nome, a.cognome, a.assegnazione AS assegnazione, a.tveicolo AS tveicolo, a.ditta, a.ndoc, a.tdoc AS tdoc, a.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
--         FROM archivio_veicoli_prov AS a
--         JOIN postazioni AS po ON a.post_id = po.id
--     ),
--     alt_archivio_chiavi AS (
--         SELECT t1.id, t1.codice AS badge, NULL AS targa, t2.codice AS chiave, 'CHIAVE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(t1.data_in) AS notte, date_in_out_diff(t1.data_in) AS tempo_in_strutt, t1.cliente, t1.postazione, t1.data_in, now_or_24h_later(t1.data_in) AS data_out, t1.username, t1.ip, t1.nome, t1.cognome, t1.assegnazione AS assegnazione, NULL AS tveicolo, t1.ditta, t1.ndoc, t1.tdoc AS tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, t2.edificio AS edificio, t2.piano
--         FROM (
--             SELECT a.id, n.codice, po.cliente, po.name AS postazione, a.data_in, a.username, a.ip, a.chiave_cod, n.nome, n.cognome, n.ditta, n.assegnazione, n.ndoc, n.tdoc, n.telefono, n.scadenza
--             FROM nominativi AS n
--             JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
--             JOIN postazioni AS po ON a.post_id = po.id
--         ) AS t1
--         JOIN (
--             SELECT ch.*
--             FROM chiavi AS ch
--             JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
--         ) AS t2 ON t1.chiave_cod = t2.codice
--     )
--     SELECT t.*
--     FROM (
--         (SELECT * FROM alt_archivio_nominativi)
--         UNION
--         (SELECT * FROM alt_archivio_provvisori)
--         UNION
--         (SELECT * FROM alt_archivio_veicoli)
--         UNION
--         (SELECT * FROM alt_archivio_veicoli_prov)
--         UNION
--         (SELECT * FROM alt_archivio_chiavi)
--     ) AS t
--     ORDER BY data_in DESC, data_out DESC;

-- CREATE VIEW full_in_strutt_badges AS
--     WITH full_archivio_nominativi AS (
--         SELECT a.id, n.codice, n.descrizione, po.cliente, po.name AS postazione, a.data_in, n.nome, n.cognome, n.assegnazione, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id
--         FROM nominativi AS n
--         JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
--         JOIN postazioni AS po ON a.post_id = po.id
--     ),
--     full_archivio_provvisori AS (
--         SELECT a.id, a.badge_cod AS codice, NULL AS descrizione, po.cliente, po.name AS postazione, a.data_in, a.nome, a.cognome, a.assegnazione, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
--         FROM archivio_provvisori AS a
--         JOIN postazioni AS po ON a.post_id = po.id
--     )
--     SELECT t.*
--     FROM (
--         (SELECT * FROM full_archivio_nominativi)
--         UNION
--         (SELECT * FROM full_archivio_provvisori)
--     ) AS t
--     ORDER BY data_in DESC;

-- CREATE VIEW full_in_strutt_veicoli AS
--     WITH full_archivio_veicoli AS (
--         SELECT a.id, ve.targa, ve.descrizione, ve.tipo AS tveicolo, po.cliente, po.name AS postazione, a.data_in, n.nome, n.cognome, n.assegnazione, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id
--         FROM nominativi AS n
--         JOIN veicoli AS ve ON n.codice = ve.proprietario
--         JOIN archivio_veicoli AS a ON ve.targa = a.targa
--         JOIN postazioni AS po ON a.post_id = po.id
--     ),
--     full_archivio_veicoli_prov AS (
--         SELECT a.id, a.targa, NULL AS descrizione, a.tveicolo, po.cliente, po.name AS postazione, a.data_in, a.nome, a.cognome, a.assegnazione, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
--         FROM archivio_veicoli_prov AS a
--         JOIN postazioni AS po ON a.post_id = po.id
--     )
--     SELECT t.*
--     FROM (
--         (SELECT * FROM full_archivio_veicoli)
--         UNION
--         (SELECT * FROM full_archivio_veicoli_prov)
--     ) AS t
--     WHERE data_in IS NOT NULL
--     ORDER BY data_in DESC;

-- CREATE VIEW in_prestito AS
--     SELECT t1.id, t1.codice AS badge, t2.codice AS chiave, t1.cliente, t1.postazione, t1.data_in, t1.nome, t1.cognome, t1.assegnazione, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, t2.edificio, t2.piano, t1.post_id
--     FROM (
--         SELECT a.id, n.codice, po.cliente, po.name AS postazione, po.id AS post_id, a.data_in, a.chiave_cod, n.nome, n.cognome, n.ditta, n.assegnazione, n.ndoc, n.tdoc, n.telefono, n.scadenza
--         FROM nominativi AS n
--         JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
--         JOIN postazioni AS po ON a.post_id = po.id
--     ) AS t1
--     JOIN (
--         SELECT ch.*
--         FROM chiavi AS ch
--         JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
--     ) AS t2 ON t1.chiave_cod = t2.codice
--     ORDER BY data_in DESC;

CREATE VIEW full_archivio AS
    WITH full_archivio_nominativi AS (
        SELECT n.codice AS badge, n.nome, n.cognome, n.assegnazione, NULL AS targa, NULL AS chiave, 'BADGE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, date_in_out_diff(a.data_in, a.data_out) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, a.data_out, NULL AS tveicolo, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano, a.username, a.ip, NULL AS documento
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_provvisori AS (
        SELECT a.badge_cod AS badge, a.nome, a.cognome, a.assegnazione, NULL AS targa, NULL AS chiave, 'BADGE' AS tipo, 'SI' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, date_in_out_diff(a.data_in, a.data_out) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, a.data_out, NULL AS tveicolo, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano, a.username, a.ip, 'DOCP_'||a.badge_cod||'.pdf' AS documento
        FROM archivio_provvisori AS a
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_veicoli AS (
        SELECT NULL AS badge, n.nome, n.cognome, n.assegnazione, ve.targa, NULL AS chiave, 'VEICOLO' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, date_in_out_diff(a.data_in, a.data_out) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, a.data_out, ve.tipo AS tveicolo, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano, a.username, a.ip, NULL AS documento
        FROM nominativi AS n
        JOIN veicoli AS ve ON n.codice = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.targa = a.targa
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_veicoli_prov AS (
        SELECT NULL AS badge, a.nome, a.cognome, a.assegnazione, a.targa, NULL AS chiave, 'VEICOLO' AS tipo, 'SI' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, date_in_out_diff(a.data_in, a.data_out) AS tempo_in_strutt, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.tveicolo, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano, a.username, a.ip, NULL AS documento
        FROM archivio_veicoli_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_chiavi AS (
        SELECT t1.codice AS badge, t1.nome, t1.cognome, t1.assegnazione, NULL AS targa, t2.codice AS chiave, 'CHIAVE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(t1.data_in, t1.data_out) AS notte, date_in_out_diff(t1.data_in, t1.data_out) AS tempo_in_strutt, t1.cliente, t1.postazione, t1.data_in, t1.data_out, NULL AS tveicolo, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, CAST(t2.edificio AS TEXT) AS edificio, t2.piano, t1.username, t1.ip, NULL AS documento
        FROM (
            SELECT n.codice, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.chiave_cod, n.nome, n.cognome, n.ditta, n.assegnazione, n.ndoc, n.tdoc, n.telefono, n.scadenza
            FROM nominativi AS n
            JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
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
    ) AS t
    WHERE data_out < CURRENT_TIMESTAMP
    ORDER BY data_in DESC, data_out DESC;

CREATE VIEW tracciati AS
    SELECT n.zuc_cod, get_tracciato_date(a.data_in) AS formatted_data_in, get_tracciato_date(a.data_out) AS formatted_data_out, data_in, data_out
    FROM archivio_nominativi AS a
    JOIN nominativi AS n ON a.badge_cod = n.codice
    WHERE zuc_cod IS NOT NULL AND data_out < CURRENT_TIMESTAMP;

CREATE VIEW full_in_strutt_badges AS
    WITH full_archivio_nominativi AS (
        SELECT a.id, n.codice, n.descrizione, po.cliente, po.name AS postazione, a.data_in, n.nome, n.cognome, n.assegnazione, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id
        FROM nominativi AS n
        JOIN archivio_nominativi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    ),
    full_archivio_provvisori AS (
        SELECT a.id, a.badge_cod AS codice, NULL AS descrizione, po.cliente, po.name AS postazione, a.data_in, a.nome, a.cognome, a.assegnazione, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
        FROM archivio_provvisori AS a
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_nominativi)
        UNION
        (SELECT * FROM full_archivio_provvisori)
    ) AS t
    ORDER BY data_in DESC;

CREATE VIEW full_in_strutt_veicoli AS
    WITH full_archivio_veicoli AS (
        SELECT a.id, ve.targa, ve.descrizione, ve.tipo AS tveicolo, po.cliente, po.name AS postazione, a.data_in, n.nome, n.cognome, n.assegnazione, n.ditta, n.ndoc, n.tdoc, n.telefono, n.scadenza, po.id AS post_id
        FROM nominativi AS n
        JOIN veicoli AS ve ON n.codice = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.targa = a.targa
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    ),
    full_archivio_veicoli_prov AS (
        SELECT a.id, a.targa, NULL AS descrizione, a.tveicolo, po.cliente, po.name AS postazione, a.data_in, a.nome, a.cognome, a.assegnazione, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
        FROM archivio_veicoli_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_veicoli)
        UNION
        (SELECT * FROM full_archivio_veicoli_prov)
    ) AS t
    ORDER BY data_in DESC;

CREATE VIEW in_strutt_badges AS
    SELECT id, codice, descrizione, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM full_in_strutt_badges;

CREATE VIEW in_strutt_veicoli AS
    SELECT id, targa, descrizione, tveicolo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in FROM full_in_strutt_veicoli;

CREATE VIEW in_prestito AS
    SELECT t1.id, t1.codice AS badge, t2.codice AS chiave, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.nome, t1.cognome, t1.assegnazione, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, t2.edificio, t2.piano, t1.post_id
    FROM (
        SELECT a.id, n.codice, po.cliente, po.name AS postazione, po.id AS post_id, a.data_in, a.data_out, a.chiave_cod, n.nome, n.cognome, n.ditta, n.assegnazione, n.ndoc, n.tdoc, n.telefono, n.scadenza
        FROM nominativi AS n
        JOIN archivio_chiavi AS a ON n.codice = a.badge_cod
        JOIN postazioni AS po ON a.post_id = po.id
    ) AS t1
    JOIN (
        SELECT ch.*
        FROM chiavi AS ch
        JOIN archivio_chiavi AS a ON ch.codice = a.chiave_cod
    ) AS t2 ON t1.chiave_cod = t2.codice
    WHERE data_out > CURRENT_TIMESTAMP
    ORDER BY data_in DESC, data_out DESC;

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

CREATE VIEW assegnazioni AS SELECT unnest(enum_range(NULL::assign_type)) AS value;
CREATE VIEW edifici AS SELECT unnest(enum_range(NULL::building_type)) AS value;
CREATE VIEW tveicoli AS SELECT unnest(enum_range(NULL::veh_type)) AS value;

CREATE VIEW nominativi_w_docs AS 
    SELECT *, 'PRIVACY_'||codice||'.pdf' AS privacy, 'DOC_'||codice||'.pdf' AS documento FROM nominativi;

-- CREATE OR REPLACE PROCEDURE mark_out(arch_id BIGINT, arch_tname regclass) AS $$
-- DECLARE
--     tmp_id BIGINT;
-- BEGIN
--     INSERT INTO archivio_dump (SELECT * FROM alt_archivio WHERE id = arch_id) RETURNING id INTO tmp_id;
--     IF tmp_id IS NULL THEN
--         RAISE EXCEPTION 'Impossibile inserire badge in archivio';
--     END IF;
--     EXECUTE format('DELETE FROM %I WHERE id = %L RETURNING id', arch_tname, arch_id) INTO tmp_id;
--     IF tmp_id IS NULL THEN
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