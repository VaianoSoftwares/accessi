\c postgres;

DROP DATABASE IF EXISTS accessi;
CREATE DATABASE accessi;
\c accessi;

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

CREATE FUNCTION dates_are_not_equal(date_in timestamp without time zone, date_out timestamp without time zone) RETURNS TEXT AS $$
BEGIN
    IF (date_trunc('day', date_in) != date_trunc('day', date_out)) THEN
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
CREATE TYPE tbadge as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE', 'VEICOLO', 'PERSONA');

CREATE TABLE IF NOT EXISTS clienti(
    name VARCHAR(64) PRIMARY KEY CHECK (name != '')
);

CREATE TABLE IF NOT EXISTS nominativi(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    assegnazione assegnazione DEFAULT 'UTENTE',
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    scadenza DATE,
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    CONSTRAINT expired_badge_is_valid CHECK (stato != 'VALIDO' OR scadenza > current_date)
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    cliente VARCHAR(64) NOT NULL REFERENCES clienti (name),
    nome VARCHAR(32) NOT NULL CHECK (nome != ''),
    cognome VARCHAR(32) NOT NULL CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    tveicolo veicolo DEFAULT 'GENERICO',
    targa1 VARCHAR(32) CHECK (targa1 != ''),
    targa2 VARCHAR(32) CHECK (targa2 != ''),
    targa3 VARCHAR(32) CHECK (targa3 != ''),
    targa4 VARCHAR(32) CHECK (targa4 != '')
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
    piano VARCHAR(16) CHECK (piano != '')
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

CREATE TABLE IF NOT EXISTS archivio_nominativi(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES nominativi (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES veicoli (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES nominativi (codice),
    chiave CHAR(9) REFERENCES chiavi (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES provvisori (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    username VARCHAR(64) NOT NULL REFERENCES users (name),
    ip VARCHAR(32) NOT NULL CHECK (ip != ''),
    nome VARCHAR(32) CHECK (nome != ''),
    cognome VARCHAR(32) CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc,
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    user_id SERIAL REFERENCES users (id) ON DELETE CASCADE,
    postazione SERIAL REFERENCES postazioni (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, postazione)
);

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

/*######################################################################################################################################################*/

-- CREATE VIEW enums AS
--     select n.nspname as enum_schema,  t.typname as enum_name,  e.enumlabel as enum_value
--     from pg_type t 
--     join pg_enum e on t.oid = e.enumtypid  
--     join pg_catalog.pg_namespace n ON n.oid = t.typnamespace;

CREATE VIEW all_badges AS
    (SELECT codice, 'PROVVISORIO' AS tipo, descrizione, stato, 'OSPITE' AS assegnazione, ubicazione, cliente, NULL AS scadenza, NULL AS nome, NULL AS cognome, NULL AS ditta, NULL AS telefono, NULL AS ndoc, NULL AS tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM provvisori)
    UNION
    (SELECT codice, 'NOMINATIVO' AS tipo, descrizione, stato, assegnazione, NULL AS ubicazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM nominativi)
    UNION
    (SELECT codice, 'CHIAVE' AS tipo, descrizione, 'VALIDO' AS stato, NULL AS assegnazione, ubicazione, cliente, NULL AS scadenza, NULL AS nome, NULL AS cognome, NULL AS ditta, NULL AS telefono, NULL AS ndoc, NULL AS tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, indirizzo, citta, edificio, piano
    FROM chiavi)
    UNION
    (SELECT codice, 'VEICOLO' AS tipo, descrizione, stato, NULL AS assegnazione, NULL AS ubicazione, cliente, NULL AS scadenza, nome, cognome, ditta, telefono, ndoc, tdoc, tveicolo, targa1, targa2, targa3, targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM veicoli);

CREATE VIEW full_archivio AS
    SELECT t.badge, t.chiave, t.cliente, t.postazione, t.data_in, t.data_out, date_in_out_diff(t.data_in, t.data_out) as intervallo, dates_are_not_equal(t.data_in, t.data_out) as notte, t.username, t.ip, t.nome, t.cognome, t.assegnazione, t.ditta, t.ndoc, t.tdoc, t.telefono, t.tveicolo, t.targa1, t.targa2, t.targa3, t.targa4, t.indirizzo, t.citta, t.edificio, t.piano  FROM
    ((SELECT n.codice AS badge, NULL AS chiave, 'NOMINATIVO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.username, a.ip, n.nome, n.cognome, n.ditta, n.telefono, n.ndoc, n.tdoc, n.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM nominativi AS n
    JOIN archivio_nominativi AS a ON n.codice = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT v1_or_v2(a.badge, a.ndoc) AS codice, NULL AS chiave, 'PROVVISORIO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.username, a.ip, a.nome, a.cognome, a.ditta, a.telefono, a.ndoc, a.tdoc, 'OSPITE' AS assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano 
    FROM archivio_provvisori AS a
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT v.codice AS badge, NULL AS chiave, 'VEICOLO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.username, a.ip, v.nome, v.cognome, v.ditta, v.telefono, v.ndoc, v.tdoc, NULL::assegnazione as assegnazione, v.tveicolo, v.targa1, v.targa2, v.targa3, v.targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano 
    FROM veicoli AS v
    JOIN archivio_veicoli AS a ON badge = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT DISTINCT b.codice AS badge, c.codice AS chiave, 'CHIAVE' AS tipo, b.cliente, b.postazione, b.data_in, b.data_out, b.username, b.ip, b.nome, b.cognome, b.ditta, b.telefono, b.ndoc, b.tdoc, b.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, c.indirizzo, c.citta, c.edificio, c.piano 
    FROM (
        SELECT a.id, a.badge, a.chiave, p.name AS postazione, a.data_in, a.data_out, a.username, a.ip, b.*
        FROM nominativi AS b
        JOIN archivio_chiavi AS a ON badge = b.codice
        JOIN postazioni AS p ON a.postazione = p.id
    ) AS b
    CROSS JOIN (
        SELECT c.*
        FROM chiavi AS c
        JOIN archivio_chiavi AS a ON c.codice = a.chiave
    ) AS c
    WHERE b.chiave = c.codice)) AS t
    WHERE data_out < date_trunc('second', CURRENT_TIMESTAMP);

CREATE VIEW in_strutt AS
    SELECT t.* FROM
    ((SELECT a.id, n.codice, n.descrizione, 'NOMINATIVO' AS tipo, p.cliente, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, n.nome, n.cognome, n.ditta, n.telefono, n.ndoc, n.tdoc, n.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4
    FROM nominativi AS n
    JOIN archivio_nominativi AS a ON n.codice = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT a.id, v1_or_v2(a.badge, a.ndoc) AS codice, NULL AS descrizione, 'PROVVISORIO' AS tipo, p.cliente, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, a.nome, a.cognome, a.ditta, a.telefono, a.ndoc, a.tdoc, 'OSPITE' AS assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4
    FROM archivio_provvisori AS a
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT a.id, v.codice, v.descrizione, 'VEICOLO' AS tipo, p.cliente, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, v.nome, v.cognome, v.ditta, v.telefono, v.ndoc, v.tdoc, NULL::assegnazione AS assegnazione, v.tveicolo, v.targa1, v.targa2, v.targa3, v.targa4
    FROM veicoli AS v
    JOIN archivio_veicoli AS a ON v.codice = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)) AS t
    WHERE is_in_strutt(data_in, data_out);

CREATE VIEW in_prestito AS
    SELECT DISTINCT c.codice AS chiave, b.codice AS badge, b.cliente, b.postazione, b.postazione_id, b.data_in, b.data_out, b.ip, c.indirizzo, c.citta, c.edificio, c.piano, c.descrizione AS descr_chiave, b.nome, b.cognome, b.ditta, b.telefono, b.ndoc, b.tdoc, b.assegnazione, b.descrizione AS descr_badge
    FROM (
        SELECT a.id, a.badge, a.chiave, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, b.*
        FROM nominativi AS b
        JOIN archivio_chiavi AS a ON badge = b.codice
        JOIN postazioni AS p ON a.postazione = p.id
    ) AS b
    CROSS JOIN (
        SELECT c.*
        FROM chiavi AS c
        JOIN archivio_chiavi AS a ON c.codice = a.chiave
    ) AS c
    WHERE b.chiave = c.codice AND data_out > date_trunc('second', CURRENT_TIMESTAMP);

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

-- INSERT INTO clienti (name) VALUES
--     ('Corte d''Appello'),
--     ('Montedomini');

-- INSERT INTO postazioni (cliente, name) VALUES
--     ('Corte d''Appello', 'Sala-controllo'),
--     ('Corte d''Appello', 'Tornelli-S.Donato'),
--     ('Corte d''Appello', 'Tornelli-Peretola'),
--     ('Corte d''Appello', 'Parcheggio-S.Donato'),
--     ('Corte d''Appello', 'Parcheggio-Peretola'),
--     ('Corte d''Appello', 'Parcheggio-3pini'),
--     ('Corte d''Appello', 'Aula-bunker'),
--     ('Corte d''Appello', 'Presidio-Pulizie'),
--     ('Corte d''Appello', 'Centralino'),
--     ('Corte d''Appello', 'Uffici'),
--     ('Montedomini', 'Desk');

-- INSERT INTO users (name, password, permessi, pages) VALUES
--     ('admin', '$2a$10$cLLMrZEMQCU44vy7Sqsb/uQJDo3vCXV/kUR5Zgm7CvaOQQw08Q6Yu', admin_flags(), admin_flags()),
--     ('gta', '$2a$10$jeaqS/p1a4vUh9PTL/PdRepyJVZWqok7VsQK/HY4xI4SAco0ZktvG', 1 | 4 | 8, 1),
--     ('GTA', '$2a$10$jeaqS/p1a4vUh9PTL/PdRepyJVZWqok7VsQK/HY4xI4SAco0ZktvG', 1 | 4 | 8, 1),
--     ('Tornelli-SD', '$2a$10$Qz5m9H2lTeSLqGZAuP0p1ewfAjh.iMNF4XdSOpX5Rm2MrzBo.yKOi',	1, 1);

-- INSERT INTO postazioni_user (user_id, postazione) VALUES
--     (2, 1),
--     (2, 2),
--     (3, 1),
--     (3, 2),
--     (3, 5),
--     (4, 2);

-- INSERT INTO nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
-- ('128209809', DEFAULT, 'VALIDO', 'PORTINERIA', 'Corte d''Appello', DEFAULT, 'ALESSANDRO', 'PESCIOTTI', 'VIVENDA', DEFAULT,  DEFAULT,  DEFAULT),
-- ('128247119',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello', DEFAULT,  'ANGELO',  'MARTONE', 'VIVENDA', DEFAULT,  DEFAULT,  DEFAULT),
-- ('128205173',	DEFAULT,	'VALIDO',	'UTENTE',  'Corte d''Appello',	DEFAULT, 'GIUSEPPE',	'TABASCO',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128290751',	DEFAULT,	'VALIDO',	'UTENTE',	'Corte d''Appello',	DEFAULT, 'ARMANDO',	'DI RUOCCO',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128280420',	DEFAULT,	'VALIDO', 'UTENTE',	'Corte d''Appello',	DEFAULT, 'ANGELO',	'IACOPINI',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128248255',	DEFAULT,	'VALIDO', 'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'SAURO',   'INNOCENTI',   'VIVENDA', DEFAULT,  DEFAULT,  DEFAULT),
-- ('128230909',	DEFAULT,	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ALESSANDRO',	'PANDOLFI',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128208032',	DEFAULT,	'VALIDO',	'FACCHINAGGIO',	'Corte d''Appello',	DEFAULT, 'DANIELE',	'GANGUZZA',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128272593',	DEFAULT,	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'MARLENY',	'EGAS',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128215425',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'EMANUELE',	'MASI',	'VIVENDA', DEFAULT, DEFAULT, DEFAULT),
-- ('128256594',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ALESSIO',	'IANNOTTA',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128209844',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'RAISSA',	'CILIBERTI',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128296731',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'GIUSEPPE',	'GRECO',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128239861',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ALESSIO',	'SILVESTRI',	'VIVENDA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128221997',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'DARIA',	'MACALUSO',	'HUMANGEST',	DEFAULT, DEFAULT, DEFAULT),
-- ('128237422',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ALDO',	'TRONCONI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128272551',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ALESSIO',	'BENUCCI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128224934',	DEFAULT, 'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'CLAUDIA',	'TARDUCCI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128203901',	'BADGE MARCATEMPO',    'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'PATRIZIO',	'PESCE',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128213111',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ANDREA',	'PUCCI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128246798',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'NICULINA',	'BUHUCEANU',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128253403',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ANTONIO',	'SAPORITO',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128288091',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'LEANDRO',	'GHELARDONI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128200861',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'GABRIELE',	'SARTI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128232481',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ANTONIO', 'BASTA',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128247436',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'LETIZIA',	'ALBANESE',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128250114',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'MATTEO',	'DAL CORTIVO',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128253592',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'CONCETTA',	'GAZANEO',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128255315',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ANDREA',	'MECHI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128298055',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'EMILJANA',	'RROKAJ',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128225393',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'MANUEL',	'SCIONI',	'OPEROSA',	DEFAULT, DEFAULT, DEFAULT),
-- ('128227568',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'ERIKA',	'GIANFELICI',	'HUMANGEST',	DEFAULT, DEFAULT, DEFAULT),
-- ('128208112',	'BADGE MARCATEMPO',	'VALIDO',	'PORTINERIA',	'Corte d''Appello',	DEFAULT, 'STEFANO',	'CANINO',	'HUMANGEST',	DEFAULT, DEFAULT, DEFAULT);

-- INSERT INTO nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
--     ('128212345', 'marco :-.)', 'VALIDO', 'UTENTE', 'Corte d''Appello', '2025-03-15', 'MARCO', 'PIERATTINI', 'GANZOSOFT', '055-420-69', 'AU0069420', 'CARTA IDENTITA'),
--     ('128212346', DEFAULT, 'VALIDO', 'PORTINERIA', 'Corte d''Appello', '2024-10-12', 'LUCA', 'CECCHI', 'GTAEXPERTSINDUSTRIES', '055-69-420', 'AU0042069', 'PATENTE'),
--     ('128212347', DEFAULT, 'SCADUTO', 'CORRIERE', 'Corte d''Appello', '2024-01-01', 'GIOVANNI', 'PANZA', DEFAULT, DEFAULT, '1020301', 'TESSERA STUDENTE'),
--     ('191712345', DEFAULT, 'VALIDO', 'PORTINERIA', 'Montedomini', '2025-07-09', DEFAULT, DEFAULT, 'GANZOSOFT', DEFAULT, 'AU006969', 'CARTA IDENTITA');

-- INSERT INTO provvisori (codice, descrizione, stato, ubicazione, cliente) VALUES
--     ('228212345', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
--     ('228212346', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
--     ('291712345', DEFAULT, DEFAULT, DEFAULT, 'Montedomini'),
--     ('291712346', DEFAULT, DEFAULT, DEFAULT, 'Montedomini');

-- INSERT INTO chiavi (codice, descrizione, ubicazione, cliente, indirizzo, citta, edificio, piano) VALUES
--     ('328212345', DEFAULT, DEFAULT, 'Corte d''Appello', 'VIA CALCINAIA 69', 'KEKISTAN', 'CAPANNONE', '0'),
--     ('391712345', DEFAULT, DEFAULT, 'Montedomini', 'PIAZZA SHREK III 88', 'SCANDICCI', 'UFFICIO', 'B2');

-- INSERT INTO veicoli (codice, descrizione, stato, cliente, tveicolo, targa1, targa2, targa3, targa4, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
--     ('428212345', DEFAULT, DEFAULT, 'Corte d''Appello', DEFAULT, 'XYZ-GTA5', '88LUKE88', DEFAULT , DEFAULT, 'GIANLUCA', 'CAUSIO', DEFAULT, DEFAULT, 'AU420420', 'PATENTE');

-- INSERT INTO archivio_nominativi (badge, postazione, data_in, data_out, ip) VALUES
--     ('128212345', 1, '2023-12-19 8:04:55', '2023-12-19 16:15:03', '192.168.1.169'),
--     ('128212345', 3, '2023-12-20 21:29:40', '2023-12-21 5:30:10', '192.168.1.170'),
--     ('128212345', 1, '2023-12-22 7:58:30', '2023-12-22 16:14:58', '192.168.1.169'),
--     ('191712345', 11, '2023-12-21 9:01:20', '2023-12-21 17:32:45', '85.67.108.11'),
--     ('128212347', 1, '2023-12-20 8:32:35', '2023-12-20 17:05:15', '192.168.1.169'),
--     ('128212345', 3, '2024-01-04 8:00:00', '2099-01-04 8:00:00', '192.168.1.170'),
--     ('128212346', 3, '2024-01-04 8:30:00', '2099-01-04 8:00:00', '192.168.1.170'),
--     ('191712345', 11, '2024-01-04 8:00:00', '2099-01-04 8:00:00', '85.67.108.11');

-- INSERT INTO archivio_provvisori (badge, postazione, data_in, data_out, ip, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
--     ('228212345', 3, '2023-12-20 21:28:50', '2023-12-21 23:16:15', '192.168.1.170', 'LUKE', 'SMITH', DEFAULT, DEFAULT, 'AU8842088', 'CARTA IDENTITA'),
--     (DEFAULT, 1, '2023-12-20 20:28:50', '2023-12-21 21:16:15', '192.168.1.169', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842088', 'TESSERA STUDENTE'),
--     ('291712345', 11, '2024-01-04 10:30:00', '2099-01-04 8:00:00', '192.168.1.170', 'LYON', 'GAMER', DEFAULT, DEFAULT, 'AU8842069', 'PATENTE'),
--     (DEFAULT, 1, '2024-01-04 11:00:00', '2099-01-04 8:00:00', '85.67.108.11', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842069', 'TESSERA STUDENTE');

-- INSERT INTO archivio_chiavi (badge, chiave, postazione, data_in, data_out, ip) VALUES
--     ('128212345', '328212345', 1, '2023-12-21 10:25:10', '2023-12-21 11:30:20', '192.168.1.169'),
--     ('128212345', '328212345', 1, '2023-12-21 10:25:10', '2023-12-21 11:45:05', '192.168.1.169'),
--     ('128212345', '328212345', 1, '2023-12-22 18:07:15', '2023-12-22 20:05:20', '192.168.1.169'),
--     ('128212345', '328212345', 3, '2023-01-04 9:30:00', '2099-01-04 8:00:00', '192.168.1.170');

-- INSERT INTO archivio_veicoli (badge, postazione, data_in, data_out, ip) VALUES
--     ('428212345', 3, '2023-12-21 7:46:12', '2023-12-21 13:03:10', '192.168.1.170');

-- INSERT INTO protocolli (date, descrizione) VALUES
--     (DEFAULT, 'prot1'),
--     ('2023-12-21 13:45:00', 'prot2'),
--     (DEFAULT, DEFAULT);

-- INSERT INTO documenti (filename, descrizione, prot_id) VALUES
--     ('fattura.pdf', 'fattura per Marco Pierattini', 1),
--     ('mail.pdf', 'mail Luca Cecchi', 1),
--     ('bilanci.xlsn', DEFAULT, 1),
--     ('bilanci.xlsn', 'bilanci scorso semestre', 3),
--     ('script.bat', 'lancio web app', 2),
--     ('documento.jpg', 'patente Aldo Fedonni', 2);

-- INSERT INTO prot_visibile_da (protocollo, postazione) VALUES
--     (1, 1),
--     (1, 2),
--     (1, 5),
--     (1, 11),
--     (2, 5),
--     (3, 5),
--     (3, 11);

/*######################################################################################################################################################*/

--
-- Data for Name: clienti; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clienti (name) VALUES ('Corte d''Appello');
INSERT INTO public.clienti (name) VALUES ('Montedomini');


--
-- Data for Name: chiavi; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: nominativi; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128203901', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'PATRIZIO', 'PESCE', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128213111', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANDREA', 'PUCCI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128246798', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'NICULINA', 'BUHUCEANU', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128253403', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANTONIO', 'SAPORITO', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128288091', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'LEANDRO', 'GHELARDONI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128232481', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANTONIO', 'BASTA', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128247436', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'LETIZIA', 'ALBANESE', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128250114', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'MATTEO', 'DAL CORTIVO', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128253592', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'CONCETTA', 'GAZANEO', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128255315', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANDREA', 'MECHI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128298055', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'EMILJANA', 'RROKAJ', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128225393', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'MANUEL', 'SCIONI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128227568', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ERIKA', 'GIANFELICI', 'HUMANGEST', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128208112', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'STEFANO', 'CANINO', 'HUMANGEST', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128200861', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'GABRIELE', 'SARTI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128209809', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALESSANDRO', 'PESCIOTTI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128247119', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANGELO', 'MARTONE', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128230909', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALESSANDRO', 'PANDOLFI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128208032', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'DANIELE', 'GANGUZZA', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128209844', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'RAISSA', 'CILIBERTI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128215425', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'EMANUELE', 'MASI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128205173', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'GIUSEPPE', 'TABASCO', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128221997', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'DARIA', 'MACALUSO', 'HUMANGEST', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128224934', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'CLAUDIA', 'TARDUCCI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128237422', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALDO', 'TRONCONI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128239861', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALESSIO', 'SILVESTRI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128248255', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'SAURO', 'INNOCENTI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128256594', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALESSIO', 'IANNOTTA', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128272551', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ALESSIO', 'BENUCCI', 'OPEROSA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128272593', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'MARLENY', 'EGAS', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128296731', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'GIUSEPPE', 'GRECO', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128280420', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ANGELO', 'IACOPINI', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128290751', 'BADGE MARCATEMPO', 'VALIDO', 'PORTINERIA', 'Corte d''Appello', NULL, 'ARMANDO', 'DI RUOCCO', 'VIVENDA', NULL, NULL, NULL);
INSERT INTO public.nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES ('128206953', 'BADGE MARCATEMPO', 'VALIDO', 'PULIZIE', 'Corte d''Appello', NULL, 'RAMONA', 'BROSO', 'VIVENDA', NULL, NULL, NULL);


--
-- Data for Name: postazioni; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.postazioni (id, cliente, name) VALUES (1, 'Corte d''Appello', 'Sala-controllo');
INSERT INTO public.postazioni (id, cliente, name) VALUES (2, 'Corte d''Appello', 'Tornelli-S.Donato');
INSERT INTO public.postazioni (id, cliente, name) VALUES (3, 'Corte d''Appello', 'Tornelli-Peretola');
INSERT INTO public.postazioni (id, cliente, name) VALUES (4, 'Corte d''Appello', 'Parcheggio-S.Donato');
INSERT INTO public.postazioni (id, cliente, name) VALUES (5, 'Corte d''Appello', 'Parcheggio-Peretola');
INSERT INTO public.postazioni (id, cliente, name) VALUES (6, 'Corte d''Appello', 'Parcheggio-3pini');
INSERT INTO public.postazioni (id, cliente, name) VALUES (7, 'Corte d''Appello', 'Aula-bunker');
INSERT INTO public.postazioni (id, cliente, name) VALUES (8, 'Corte d''Appello', 'Presidio-Pulizie');
INSERT INTO public.postazioni (id, cliente, name) VALUES (9, 'Corte d''Appello', 'Centralino');
INSERT INTO public.postazioni (id, cliente, name) VALUES (10, 'Corte d''Appello', 'Uffici');
INSERT INTO public.postazioni (id, cliente, name) VALUES (11, 'Montedomini', 'Desk');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, name, password, permessi, pages) VALUES (1, 'admin', '$2a$10$cLLMrZEMQCU44vy7Sqsb/uQJDo3vCXV/kUR5Zgm7CvaOQQw08Q6Yu', -1, -1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (2, 'gta', '$2a$10$jeaqS/p1a4vUh9PTL/PdRepyJVZWqok7VsQK/HY4xI4SAco0ZktvG', 13, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (3, 'GTA', '$2a$10$jeaqS/p1a4vUh9PTL/PdRepyJVZWqok7VsQK/HY4xI4SAco0ZktvG', 13, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (4, 'Tornelli-SD', '$2a$10$Qz5m9H2lTeSLqGZAuP0p1ewfAjh.iMNF4XdSOpX5Rm2MrzBo.yKOi', 1, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (5, 'Tornelli-CRF', '$2a$10$mVM.MBrFiO.f/dqNvcTqKOPhF82hRWcSKwqJkZhuLS/IdNx5HHn7.', 0, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (6, 'Parcheggio-SD', '$2a$10$KszV3m2v9e0b21q1n.5pvu1.NmTyc5n1Ud5X1UbcdHJXLEVZAqGSa', 0, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (7, 'Parcheggio-CRF', '$2a$10$lEBEMaOH7fn/.rnivkaCROR1SfKglXLAYU7gV5BCfHEoamNYkxQdi', 0, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (8, 'Parcheggio-3P', '$2a$10$.T1Hem7K/9snpGU17PccUeu3iAj8vc.iuOd/au4IXW2.Ik1c.MXmK', 0, 1);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (12, 'Ufficio-V', '$2a$10$dkVqdnG2FTkENOhwRMo1XOJYbZkjKRSXxvU/gC/bqvK9fw8tOmrZe', 6, 9);
INSERT INTO public.users (id, name, password, permessi, pages) VALUES (13, 'Sala-controllo', '$2a$10$2GxaNgWCYVOwjdiIBrph2.jHSYVOH45aFv99Pp6URJvGc7isJYT8q', 0, 1);


--
-- Data for Name: archivio_chiavi; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: archivio_nominativi; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.archivio_nominativi (id, badge, postazione, data_in, data_out, username, ip) VALUES (4, '128206953', 10, '2024-03-13 09:12:48', '2024-03-13 17:57:31', 'Ufficio-V', '82.54.171.167');


--
-- Data for Name: provvisori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: archivio_provvisori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: veicoli; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: archivio_veicoli; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: protocolli; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documenti; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: postazioni_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.postazioni_user (user_id, postazione) VALUES (2, 1);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (2, 2);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (3, 1);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (3, 2);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (3, 5);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (4, 2);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (5, 3);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (6, 4);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (7, 5);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (8, 6);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 1);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 2);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 3);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 4);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 5);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 6);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 7);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 8);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 9);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (12, 10);
INSERT INTO public.postazioni_user (user_id, postazione) VALUES (13, 1);


--
-- Data for Name: prot_visibile_da; Type: TABLE DATA; Schema: public; Owner: postgres
--

/*######################################################################################################################################################*/

-- queryInStrutt
-- SELECT id, codice, tipo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in
-- FROM in_strutt
-- WHERE tipo = 'NOMINATIVO' OR tipo = 'PROVVISORIO'
-- ORDER BY data_in DESC;

-- SELECT * FROM archivio_nominativi WHERE is_in_strutt(data_in, data_out);

-- SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, data_in FROM in_prestito;

-- SELECT badge, chiave, postazione, data_in, data_out, nome, cognome, indirizzo FROM full_archivio
-- WHERE data_in > '2023-12-20' AND data_in < '2023-12-22';

-- SELECT n.codice AS badge, p.cliente, p.name AS postazione, a.data_in, a.data_out, n.nome, n.cognome, n.ndoc, n.tdoc, n.assegnazione
-- FROM nominativi AS n                                                                                                                                                  
-- JOIN archivio_nominativi AS a ON badge = a.badge
-- JOIN postazioni AS p ON a.postazione = p.id 
-- WHERE data_out < date_trunc('second', CURRENT_TIMESTAMP);

-- SELECT badge,chiave,tipo,cliente,postazione,data_in,data_out,nome,cognome FROM full_archivio;

-- archivio chiavi
-- SELECT DISTINCT b.codice AS badge, c.codice AS chiave, b.postazione, b.data_in, b.data_out, b.nome, b.cognome, c.indirizzo
-- FROM (
--     SELECT a.id, a.badge, a.chiave, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.ip, b.*
--     FROM badges AS b
--     JOIN archivio_chiavi AS a ON badge = b.codice
--     JOIN postazioni AS p ON a.postazione = p.id
-- ) AS b
-- CROSS JOIN (
--     SELECT c.*
--     FROM chiavi AS c
--     JOIN archivio_chiavi AS a ON c.codice = a.chiave
-- ) AS c
-- WHERE data_out IS NOT NULL AND b.chiave = c.codice;

-- findInStrutt
-- SELECT codice, tipo, descrizione, assegnazione, cliente, postazione, nome, cognome, ditta, telefono, ndoc, tdoc, data_in
-- FROM in_strutt
-- WHERE tipo = 'NOMINATIVO' OR tipo = 'PROVVISORIO' AND postazione_id = 1 OR postazione_id = 2
-- ORDER BY data_in DESC;

-- queryInPrestito
-- SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, data_in
-- FROM in_prestito
-- ORDER BY data_in DESC;

-- findInPrestito
-- SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, telefono, ndoc, tdoc, indirizzo, citta, edificio, piano, data_in
-- FROM in_prestito
-- ORDER BY data_in DESC;

/*######################################################################################################################################################*/

\c postgres;