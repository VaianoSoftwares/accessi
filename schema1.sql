\c postgres;

DROP DATABASE IF EXISTS accessi1;
CREATE DATABASE accessi1;
\c accessi1;

-- CREATE FUNCTION set_bit(n INT, k INT) RETURNS INT
--     LANGUAGE SQL
--     IMMUTABLE
--     PARALLEL SAFE
--     RETURN (n | (1 << (k - 1)));

-- CREATE FUNCTION clear_bit(n INT, k INT) RETURNS INT
--     LANGUAGE SQL
--     IMMUTABLE
--     PARALLEL SAFE
--     RETURN (n & (~(1 << (k - 1))));

-- CREATE FUNCTION toggle_bit(n INT, k INT) RETURNS INT
--     LANGUAGE SQL
--     IMMUTABLE
--     PARALLEL SAFE
--     RETURN (n # (1 << (k - 1)));

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
    RETURN (date_in <= date_trunc('second', CURRENT_TIMESTAMP) AND date_out > date_trunc('second', CURRENT_TIMESTAMP));

CREATE OR REPLACE FUNCTION v1_or_v2(v1 TEXT, v2 TEXT) RETURNS TEXT AS $$
BEGIN
    IF v1 IS NULL THEN
        RETURN v2;
    ELSE
        RETURN v1;
    END IF;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION date_in_out_diff(date_in timestamp without time zone, date_out timestamp without time zone) RETURNS TEXT
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN (date_part('epoch', date_out - date_in) * INTERVAL '1 second')::TEXT;

CREATE OR REPLACE FUNCTION dates_are_not_equal(date_in TIMESTAMP, date_out TIMESTAMP) RETURNS TEXT AS $$
BEGIN
    IF (date_trunc('day', date_in) != date_trunc('day', date_out)) THEN
        RETURN 'SI';
    ELSE
        RETURN 'NO';
    END IF;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_provvisorio(barcode TEXT) RETURNS BOOLEAN AS $$
DECLARE
    row_count INT := 0;
BEGIN
    SELECT count(*) INTO row_count FROM badges 
    JOIN people ON id = proprietario
    WHERE codice = $1;
    RETURN row_count = 0;
END; $$ LANGUAGE plpgsql;

-- CREATE FUNCTION is_provvisorio(codice TEXT) RETURNS BOOLEAN AS $$
--     LANGUAGE SQL
--     IMMUTABLE
--     PARALLEL SAFE
--     RETURN ((length(codice) = 9 AND left(codice, 1) = '2') OR (length(codice) = 7) OR (length(codice) = 10 AND substring(codice, 2, 1) = '2'));

-- CREATE FUNCTION dates_are_not_equal(date_in timestamp without time zone, date_out timestamp without time zone) RETURNS TEXT AS $$
-- BEGIN
--     IF (date_trunc('day', date_in) != date_trunc('day', date_out)) THEN
--         RETURN 'SI';
--     ELSE
--         RETURN 'NO';
--     END IF;
-- END; $$ LANGUAGE plpgsql;

-- CREATE FUNCTION is_arch_row_provvisorio(persona_id BIGINT, proprietario_id BIGINT) RETURNS TEXT AS $$
-- BEGIN
--     IF (proprietario_id IS NULL OR persona_id != proprietario_id) THEN
--         RETURN 'SI';
--     ELSE
--         RETURN 'NO';
--     END IF;
-- END; $$ LANGUAGE plpgsql;

CREATE TYPE tdoc AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assegnazione as ENUM ('OSPITE', 'UTENTE', 'GIORNALISTA', 'MANUTENZIONE', 'ASSOCIAZIONE', 'COOPERATIVA', 'COLLABORATORE', 'PULIZIE', 'PORTINERIA', 'FACCHINAGGIO', 'CORRIERE', 'UNIVERSITARIO');
CREATE TYPE edificio as ENUM ('APPARTAMENTO', 'VILLETTA', 'CAPANNONE', 'FONDO', 'CLINICA', 'UFFICIO');
CREATE TYPE veicolo as ENUM ('AUTO', 'MOTO', 'BICICLETTA', 'GENERICO');
CREATE TYPE tbadge as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE');

CREATE SEQUENCE ids;

CREATE TABLE IF NOT EXISTS clienti(
    name VARCHAR(64) PRIMARY KEY CHECK (name != '')
);

CREATE TABLE IF NOT EXISTS users(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    name VARCHAR(64) UNIQUE NOT NULL CHECK (name != ''),
    password VARCHAR(64) NOT NULL CHECK (password != ''),
    permessi INT NOT NULL DEFAULT 0,
    pages INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS postazioni(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    name VARCHAR(64) NOT NULL CHECK (name != ''),
    UNIQUE (cliente, name)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    usr_id BIGINT REFERENCES users (id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (usr_id, post_id)
);

CREATE TABLE IF NOT EXISTS people(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione assegnazione NOT NULL DEFAULT 'UTENTE',
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    scadenza DATE,
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS badges(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state NOT NULL DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    proprietario BIGINT REFERENCES people (id),
    CONSTRAINT invalid_codice_badge CHECK (((left(codice, 1) = '1' AND proprietario IS NOT NULL) OR (left(codice, 1) = '2' AND proprietario IS NULL)) AND length(codice) = 9)
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state NOT NULL DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    indirizzo VARCHAR(128) CHECK (indirizzo != ''),
    citta VARCHAR(64) CHECK (citta != ''),
    edificio edificio,
    piano VARCHAR(16) CHECK (piano != ''),
    proprietario BIGINT REFERENCES people (id),
    CONSTRAINT invalid_barcode_prefix CHECK (left(codice, 1) = '3' AND length(codice) = 9)
);

CREATE TABLE IF NOT EXISTS veicoli(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    targa VARCHAR(32) UNIQUE NOT NULL CHECK (targa != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state NOT NULL DEFAULT 'VALIDO',
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    tipo veicolo NOT NULL DEFAULT 'GENERICO',
    proprietario BIGINT NOT NULL REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS archivio_badges(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    badge CHAR(9) NOT NULL REFERENCES badges (codice),
    post_id BIGINT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_badges_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    badge CHAR(9) NOT NULL REFERENCES badges (codice),
    post_id BIGINT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione assegnazione NOT NULL DEFAULT 'OSPITE',
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    vehicle_id BIGINT NOT NULL REFERENCES veicoli (id),
    post_id BIGINT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli_prov(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    targa VARCHAR(32) NOT NULL,
    post_id BIGINT NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione assegnazione NOT NULL DEFAULT 'OSPITE',
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    tveicolo veicolo,
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    badge CHAR(9) REFERENCES badges (codice),
    chiave CHAR(9) REFERENCES chiavi (codice),
    post_id BIGINT REFERENCES postazioni (id),
    data_in TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS protocolli(
    id BIGINT PRIMARY KEY DEFAULT nextval('ids'),
    date TIMESTAMP NOT NULL DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    descrizione TEXT CHECK (descrizione != '')
);

CREATE TABLE IF NOT EXISTS documenti(
    filename VARCHAR(256),
    descrizione TEXT CHECK (descrizione != ''),
    prot_id BIGINT REFERENCES protocolli (id) ON DELETE CASCADE,
    PRIMARY KEY (filename, prot_id)
);

CREATE TABLE IF NOT EXISTS prot_visibile_da(
    prot_id BIGINT REFERENCES protocolli (id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (prot_id, post_id)
);

CREATE VIEW full_archivio AS
    WITH full_archivio_badges AS (
        SELECT ba.codice AS badge, NULL AS veicolo, NULL AS chiave, 'BADGE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, pe.nome, pe.cognome, pe.assegnazione, NULL::veicolo AS tveicolo, pe.ditta, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM people AS pe
        JOIN badges AS ba ON pe.id = ba.proprietario
        JOIN archivio_badges AS a ON ba.codice = a.badge
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_badges_prov AS (
        SELECT a.badge, NULL AS veicolo, NULL AS chiave, 'BADGE' AS tipo, 'SI' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.nome, a.cognome, a.assegnazione, NULL::veicolo AS tveicolo, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM archivio_badges_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_veicoli AS (
        SELECT NULL AS badge, ve.targa AS veicolo, NULL AS chiave, 'VEICOLO' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, pe.nome, pe.cognome, pe.assegnazione, ve.tipo AS tveicolo, pe.ditta, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM people AS pe
        JOIN veicoli AS ve ON pe.id = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.id = a.vehicle_id
        JOIN postazioni AS po ON a.post_id = po.id 
    ),
    full_archivio_veicoli_prov AS (
        SELECT NULL AS badge, a.targa AS veicolo, NULL AS chiave, 'VEICOLO' AS tipo, 'SI' AS provvisorio, dates_are_not_equal(a.data_in, a.data_out) AS notte, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.nome, a.cognome, a.assegnazione, a.tveicolo, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM archivio_veicoli_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
    ),
    full_archivio_chiavi AS (
        SELECT t1.codice AS badge, NULL AS veicolo, t2.codice AS chiave, 'CHIAVE' AS tipo, 'NO' AS provvisorio, dates_are_not_equal(t1.data_in, t1.data_out) AS notte, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.username, t1.ip, t1.nome, t1.cognome, t1.assegnazione, NULL::veicolo AS tveicolo, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t1.scadenza, t2.indirizzo, t2.citta, CAST(t2.edificio AS TEXT) AS edificio, t2.piano
        FROM (
            SELECT ba.codice, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.chiave, pe.nome, pe.cognome, pe.ditta, pe.assegnazione, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza
            FROM people AS pe
            JOIN badges AS ba ON pe.id = ba.proprietario
            JOIN archivio_chiavi AS a ON ba.codice = a.badge
            JOIN postazioni AS po ON a.post_id = po.id
        ) AS t1
        JOIN (
            SELECT ch.*
            FROM chiavi AS ch
            JOIN archivio_chiavi AS a ON ch.codice = a.chiave
        ) AS t2 ON t1.chiave = t2.codice
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_badges)
        UNION
        (SELECT * FROM full_archivio_badges_prov)
        UNION
        (SELECT * FROM full_archivio_veicoli)
        UNION
        (SELECT * FROM full_archivio_veicoli_prov)
        UNION
        (SELECT * FROM full_archivio_chiavi)
    ) AS t
    WHERE data_out < date_trunc('second', CURRENT_TIMESTAMP)
    ORDER BY data_in DESC, data_out DESC;

CREATE VIEW full_in_strutt_badges AS
    WITH full_archivio_badges AS (
        SELECT a.id, ba.codice, ba.descrizione, po.cliente, po.name AS postazione, a.data_in, pe.nome, pe.cognome, pe.assegnazione, pe.ditta, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza, po.id AS post_id
        FROM people AS pe
        JOIN badges AS ba ON pe.id = ba.proprietario
        JOIN archivio_badges AS a ON ba.codice = a.badge
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    ),
    full_archivio_badges_prov AS (
        SELECT a.id, a.badge AS codice, NULL AS descrizione, po.cliente, po.name AS postazione, a.data_in, a.nome, a.cognome, a.assegnazione, a.ditta, a.ndoc, a.tdoc, a.telefono, NULL::DATE AS scadenza, po.id AS post_id
        FROM archivio_badges_prov AS a
        JOIN postazioni AS po ON a.post_id = po.id
        WHERE is_in_strutt(data_in, data_out)
    )
    SELECT t.*
    FROM (
        (SELECT * FROM full_archivio_badges)
        UNION
        (SELECT * FROM full_archivio_badges_prov)
    ) AS t
    ORDER BY data_in DESC;

CREATE VIEW full_in_strutt_veicoli AS
    WITH full_archivio_veicoli AS (
        SELECT a.id, ve.targa, ve.descrizione, ve.tipo AS tveicolo, po.cliente, po.name AS postazione, a.data_in, pe.nome, pe.cognome, pe.assegnazione, pe.ditta, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza, po.id AS post_id
        FROM people AS pe
        JOIN veicoli AS ve ON pe.id = ve.proprietario
        JOIN archivio_veicoli AS a ON ve.id = a.vehicle_id
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
        SELECT a.id, ba.codice, po.cliente, po.name AS postazione, po.id AS post_id, a.data_in, a.data_out, a.chiave, pe.nome, pe.cognome, pe.ditta, pe.assegnazione, pe.ndoc, pe.tdoc, pe.telefono, pe.scadenza
        FROM people AS pe
        JOIN badges AS ba ON pe.id = ba.proprietario
        JOIN archivio_chiavi AS a ON ba.codice = a.badge
        JOIN postazioni AS po ON a.post_id = po.id
    ) AS t1
    JOIN (
        SELECT ch.*
        FROM chiavi AS ch
        JOIN archivio_chiavi AS a ON ch.codice = a.chiave
    ) AS t2 ON t1.chiave = t2.codice
    WHERE data_out > date_trunc('second', CURRENT_TIMESTAMP)
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
    ) AS postazioni
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

CREATE VIEW assegnazioni AS SELECT unnest(enum_range(NULL::assegnazione)) AS value;
CREATE VIEW edifici AS SELECT unnest(enum_range(NULL::edificio)) AS value;
CREATE VIEW tveicoli AS SELECT unnest(enum_range(NULL::veicolo)) AS value; 

/*######################################################################################################################################################*/

/*######################################################################################################################################################*/

/*######################################################################################################################################################*/

\c postgres;