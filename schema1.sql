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

CREATE FUNCTION check_bit(n INT, k INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN ((n & ~(n # (1 << (k - 1)))) >> (k - 1))::bool;

CREATE FUNCTION admin_flags() RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN -1;

CREATE FUNCTION is_in_strutt(date_in TIMESTAMP, date_out TIMESTAMP) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN (date_in <= date_trunc('second', CURRENT_TIMESTAMP) AND date_out > date_trunc('second', CURRENT_TIMESTAMP));

CREATE FUNCTION v1_or_v2(v1 TEXT, v2 TEXT) RETURNS TEXT AS $$
BEGIN
    IF v1 IS NULL THEN
        RETURN v2;
    ELSE
        RETURN v1;
    END IF;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION date_in_out_diff(date_in timestamp without time zone, date_out timestamp without time zone) RETURNS TEXT
    LANGUAGE SQL
    IMMUTABLE
    PARALLEL SAFE
    RETURN (date_part('epoch', date_out - date_in) * INTERVAL '1 second')::TEXT;

CREATE FUNCTION dates_are_not_equal(date_in TIMESTAMP, date_out TIMESTAMP) RETURNS TEXT AS $$
BEGIN
    IF (date_trunc('day', date_in) != date_trunc('day', date_out)) THEN
        RETURN 'SI';
    ELSE
        RETURN 'NO';
    END IF;
END; $$ LANGUAGE plpgsql;

-- CREATE FUNCTION dates_are_not_equal(date_in timestamp without time zone, date_out timestamp without time zone) RETURNS TEXT AS $$
-- BEGIN
--     IF (date_trunc('day', date_in) != date_trunc('day', date_out)) THEN
--         RETURN 'SI';
--     ELSE
--         RETURN 'NO';
--     END IF;
-- END; $$ LANGUAGE plpgsql;

CREATE FUNCTION is_arch_row_provvisorio(persona_id INT, proprietario_id INT) RETURNS TEXT AS $$
BEGIN
    IF (proprietario_id IS NULL OR persona_id != proprietario_id) THEN
        RETURN 'SI';
    ELSE
        RETURN 'NO';
    END IF;
END; $$ LANGUAGE plpgsql;

CREATE TYPE tdoc AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assegnazione as ENUM ('OSPITE', 'UTENTE', 'GIORNALISTA', 'MANUTENZIONE', 'ASSOCIAZIONE', 'COOPERATIVA', 'COLLABORATORE', 'PULIZIE', 'PORTINERIA', 'FACCHINAGGIO', 'CORRIERE', 'UNIVERSITARIO');
CREATE TYPE edificio as ENUM ('APPARTAMENTO', 'VILLETTA', 'CAPANNONE', 'FONDO', 'CLINICA', 'UFFICIO');
CREATE TYPE veicolo as ENUM ('AUTO', 'MOTO', 'BICICLETTA', 'GENERICO');
CREATE TYPE tbadge as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE');

CREATE TABLE IF NOT EXISTS clienti(
    name VARCHAR(64) PRIMARY KEY CHECK (name != '')
);

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL CHECK (name != ''),
    password VARCHAR(64) NOT NULL CHECK (password != ''),
    permessi INT DEFAULT 0,
    pages INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS postazioni(
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    name VARCHAR(64) NOT NULL CHECK (name != ''),
    UNIQUE (cliente, name)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    user_id SERIAL REFERENCES users (id) ON DELETE CASCADE,
    postazione SERIAL REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, postazione)
);

CREATE TABLE IF NOT EXISTS peoples(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    assegnazione assegnazione DEFAULT 'UTENTE',
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
    stato badge_state DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    proprietario SERIAL REFERENCES peoples (id),
    CONSTRAINT invalid_badge CHECK (((left(codice, 1) = '1' AND proprietario IS NOT NULL) OR (left(codice, 1) = '2' AND proprietario IS NULL)) AND length(codice) = 9)
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    indirizzo VARCHAR(128) CHECK (indirizzo != ''),
    citta VARCHAR(64) CHECK (citta != ''),
    edificio edificio,
    piano VARCHAR(16) CHECK (piano != ''),
    proprietario SERIAL REFERENCES peoples (id),
    CONSTRAINT invalid_barcode_prefix CHECK (left(codice, 1) = '3' AND length(codice) = 9)
);

CREATE TABLE IF NOT EXISTS veicoli(
    id SERIAL PRIMARY KEY,
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    tipo veicolo DEFAULT 'GENERICO',
    targa VARCHAR(32) UNIQUE NOT NULL CHECK (targa != ''),
    proprietario SERIAL REFERENCES peoples (id)
);

CREATE TABLE IF NOT EXISTS archivio_badges(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) NOT NULL REFERENCES badges (codice),
    persona SERIAL NOT NULL REFERENCES peoples (id),
    postazione SERIAL NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id SERIAL PRIMARY KEY,
    veicolo SERIAL NOT NULL REFERENCES veicoli (id),
    persona SERIAL NOT NULL REFERENCES peoples (id),
    postazione SERIAL NOT NULL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES badges (codice),
    chiave CHAR(9) REFERENCES chiavi (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio();

CREATE TABLE IF NOT EXISTS protocolli(
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    descrizione TEXT CHECK (descrizione != '')
);

CREATE TABLE IF NOT EXISTS documenti(
    filename VARCHAR(256),
    descrizione TEXT CHECK (descrizione != ''),
    prot_id SERIAL REFERENCES protocolli (id) ON DELETE CASCADE,
    PRIMARY KEY (filename, prot_id)
);

CREATE TABLE IF NOT EXISTS prot_visibile_da(
    protocollo SERIAL REFERENCES protocolli (id) ON DELETE CASCADE,
    postazione SERIAL REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (protocollo, postazione)
);

CREATE VIEW full_archivio AS
    WITH full_archivio_badges AS (
        SELECT t1.badge, NULL AS veicolo, NULL AS chiave, 'BADGE' AS tipo, is_arch_row_provvisorio(t1.persona, t1.proprietario) AS provvisorio, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.username, t1.ip, t2.nome, t2.cognome, t2.assegnazione, NULL::veicolo AS tveicolo, t2.ditta, t2.ndoc, t2.tdoc, t2.telefono, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM (
            SELECT ba.codice AS badge, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, ba.proprietario, a.persona
            FROM badges AS ba
            JOIN archivio_badges AS a ON ba.codice = a.badge
            JOIN postazioni AS po ON a.postazione = po.id
        ) AS t1
        JOIN (
            SELECT pe.*
            FROM peoples AS pe
            JOIN archivio_badges AS a ON pe.id = a.persona
        ) AS t2 ON t1.persona = t2.id
    ),
    full_archivio_veicoli AS (
        SELECT NULL AS badge, t1.veicolo, NULL AS chiave, 'VEICOLO' AS tipo, is_arch_row_provvisorio(t1.persona, t1.proprietario) AS provvisorio, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.username, t1.ip, t2.nome, t2.cognome, t2.assegnazione, t1.tveicolo, t2.ditta, t2.ndoc, t2.tdoc, t2.telefono, NULL AS indirizzo, NULL AS edificio, NULL AS citta, NULL AS piano
        FROM (
            SELECT ve.targa AS veicolo, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, ve.tipo AS tveicolo, ve.proprietario, a.persona
            FROM veicoli AS ve
            JOIN archivio_veicoli AS a ON ve.id = a.veicolo
            JOIN postazioni AS po ON a.postazione = po.id) AS t1
        JOIN (
            SELECT pe.*
            FROM peoples AS pe
            JOIN archivio_badges AS a ON pe.id = a.persona
        ) AS t2 ON t1.persona = t2.id
    ),
    full_archivio_chiavi AS (
        SELECT t1.codice AS badge, NULL AS veicolo, t2.codice AS chiave, 'CHIAVE' AS tipo, NULL AS provvisorio, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.username, t1.ip, t1.nome, t1.cognome, t1.assegnazione, NULL::veicolo AS tveicolo, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t2.indirizzo, t2.citta, CAST(t2.edificio AS TEXT) AS edificio, t2.piano
        FROM (
            SELECT ba.codice, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.chiave, pe.nome, pe.cognome, pe.ditta, pe.assegnazione, pe.ndoc, pe.tdoc, pe.telefono
            FROM peoples AS pe
            JOIN badges AS ba ON pe.id = ba.proprietario
            JOIN archivio_chiavi AS a ON ba.codice = a.badge
            JOIN postazioni AS po ON a.postazione = po.id
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
        (SELECT * FROM full_archivio_veicoli)
        UNION
        (SELECT * FROM full_archivio_chiavi)
    ) AS t
    WHERE data_out < date_trunc('second', CURRENT_TIMESTAMP)
    ORDER BY data_in DESC, data_out DESC;

CREATE VIEW in_strutt_badges AS
    SELECT t1.badge, t1.descrizione, t1.cliente, t1.postazione, t1.data_in, t2.nome, t2.cognome, t2.assegnazione, t2.ditta, t2.ndoc, t2.tdoc, t2.telefono
    FROM (
        SELECT ba.codice AS badge, ba.descrizione, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.persona
        FROM badges AS ba
        JOIN archivio_badges AS a ON ba.codice = a.badge
        JOIN postazioni AS po ON a.postazione = po.id) AS t1
    JOIN (
        SELECT pe.*
        FROM peoples AS pe
        JOIN archivio_badges AS a ON pe.id = a.persona
    ) AS t2 ON t1.persona = t2.id
    WHERE is_in_strutt(data_in, data_out)
    ORDER BY data_in DESC, data_out DESC;

CREATE VIEW in_strutt_veicoli AS
    SELECT t1.targa, t1.descrizione, t1.tveicolo, t1.cliente, t1.postazione, t1.data_in, t2.nome, t2.cognome, t2.assegnazione, t2.ditta, t2.ndoc, t2.tdoc, t2.telefono
    FROM (
        SELECT ve.targa, ve.descrizione, ve.tipo AS tveicolo, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.persona
        FROM veicoli AS ve
        JOIN archivio_veicoli AS a ON ve.id = a.veicolo
        JOIN postazioni AS po ON a.postazione = po.id) AS t1
    JOIN (
        SELECT pe.*
        FROM peoples AS pe
        JOIN archivio_badges AS a ON pe.id = a.persona
    ) AS t2 ON t1.persona = t2.id
    WHERE is_in_strutt(data_in, data_out)
    ORDER BY data_in DESC, data_out DESC;

CREATE VIEW in_prestito AS
    SELECT t1.codice AS badge, t2.codice AS chiave, t1.cliente, t1.postazione, t1.data_in, t1.data_out, t1.nome, t1.cognome, t1.assegnazione, t1.ditta, t1.ndoc, t1.tdoc, t1.telefono, t2.indirizzo, t2.citta, t2.edificio, t2.piano
    FROM (
        SELECT ba.codice, po.cliente, po.name AS postazione, a.data_in, a.data_out, a.chiave, pe.nome, pe.cognome, pe.ditta, pe.assegnazione, pe.ndoc, pe.tdoc, pe.telefono
        FROM peoples AS pe
        JOIN badges AS ba ON pe.id = ba.proprietario
        JOIN archivio_chiavi AS a ON ba.codice = a.badge
        JOIN postazioni AS po ON a.postazione = po.id
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
        LEFT JOIN postazioni_user AS pu ON p.id = pu.postazione
        WHERE u.id = pu.user_id OR u.permessi = admin_flags()
    ) AS clienti,
    ARRAY(
        SELECT DISTINCT p.id FROM postazioni AS p
        LEFT JOIN postazioni_user AS pu ON p.id = pu.postazione
        WHERE u.id = pu.user_id OR u.permessi = admin_flags()
    ) AS postazioni
    FROM users AS u;

CREATE VIEW full_protocolli AS
    SELECT pr.id, pr.date, pr.descrizione AS prot_descrizione, d.filename, d.descrizione AS doc_descrizione,
    ARRAY(
        SELECT DISTINCT po.id FROM postazioni AS po JOIN prot_visibile_da AS v ON po.id = v.postazione AND v.protocollo = pr.id
    ) AS visibile_da_id, 
    ARRAY(
        SELECT DISTINCT po.name FROM postazioni AS po JOIN prot_visibile_da AS v ON po.id = v.postazione AND v.protocollo = pr.id
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