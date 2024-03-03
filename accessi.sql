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

CREATE TYPE tdoc AS ENUM ('CARTA IDENTITA', 'PATENTE', 'TESSERA STUDENTE');
CREATE TYPE badge_state AS ENUM ('VALIDO', 'SCADUTO', 'REVOCATO', 'RICONSEGNATO');
CREATE TYPE assegnazione as ENUM ('ospite', 'utente', 'giornalista', 'manutenzione', 'associazione', 'cooperativa', 'collaboratore', 'pulizie', 'portineria', 'facchinaggio', 'corriere', 'universitario');
CREATE TYPE edificio as ENUM ('appartamento', 'villetta', 'capannone', 'fondo', 'clinica', 'ufficio');
CREATE TYPE veicolo as ENUM ('auto', 'moto', 'bicicletta', 'generico');
CREATE TYPE tbadge as ENUM ('NOMINATIVO', 'PROVVISORIO', 'CHIAVE', 'VEICOLO', 'PERSONA');

CREATE TABLE IF NOT EXISTS clienti(
    name VARCHAR(64) PRIMARY KEY CHECK (name != '')
);

CREATE TABLE IF NOT EXISTS persone(
    nome VARCHAR(32) CHECK (nome != ''),
    cognome VARCHAR(32) CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) CHECK (ndoc != ''),
    tdoc tdoc DEFAULT 'CARTA IDENTITA',
    cliente VARCHAR(64) NOT NULL,
    FOREIGN KEY (cliente) REFERENCES clienti (name),
    PRIMARY KEY (ndoc, tdoc)
);

CREATE TABLE IF NOT EXISTS nominativi(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    assegnazione assegnazione DEFAULT 'utente',
    cliente VARCHAR(64) NOT NULL,
    scadenza DATE,
    nome VARCHAR(32) CHECK (nome != ''),
    cognome VARCHAR(32) CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) NOT NULL CHECK (ndoc != ''),
    tdoc tdoc DEFAULT 'CARTA IDENTITA',
    FOREIGN KEY (cliente) REFERENCES clienti (name),
    CONSTRAINT expired_badge_is_valid CHECK (stato != 'VALIDO' OR scadenza > current_date)
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL,
    FOREIGN KEY (cliente) REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    stato badge_state DEFAULT 'VALIDO',
    cliente VARCHAR(64) NOT NULL,
    nome VARCHAR(32) CHECK (nome != ''),
    cognome VARCHAR(32) CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) NOT NULL CHECK (ndoc != ''),
    tdoc tdoc DEFAULT 'CARTA IDENTITA',
    tveicolo veicolo DEFAULT 'generico',
    targa1 VARCHAR(32) CHECK (targa1 != ''),
    targa2 VARCHAR(32) CHECK (targa2 != ''),
    targa3 VARCHAR(32) CHECK (targa3 != ''),
    targa4 VARCHAR(32) CHECK (targa4 != ''),
    FOREIGN KEY (cliente) REFERENCES clienti (name)
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice CHAR(9) PRIMARY KEY CHECK (codice != ''),
    descrizione TEXT CHECK (descrizione != ''),
    ubicazione VARCHAR(32) CHECK (ubicazione != ''),
    cliente VARCHAR(64) NOT NULL,
    indirizzo VARCHAR(128) CHECK (indirizzo != ''),
    citta VARCHAR(64) CHECK (citta != ''),
    edificio edificio,
    piano VARCHAR(16) CHECK (piano != ''),
    FOREIGN KEY (cliente) REFERENCES clienti (name)
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
    cliente VARCHAR(64),
    name VARCHAR(64) CHECK (name != ''),
    FOREIGN KEY (cliente) REFERENCES clienti (name),
    UNIQUE (cliente, name)
);

CREATE TABLE IF NOT EXISTS archivio_nominativi(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES nominativi (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    ip VARCHAR(32) CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES veicoli (codice),
    postazione SERIAL REFERENCES postazioni (id),
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    ip VARCHAR(32) CHECK (ip != ''),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES nominativi (codice),
    chiave CHAR(9) REFERENCES chiavi (codice),
    postazione SERIAL,
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    ip VARCHAR(32) CHECK (ip != ''),
    FOREIGN KEY (postazione) REFERENCES postazioni (id),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id SERIAL PRIMARY KEY,
    badge CHAR(9) REFERENCES provvisori (codice),
    postazione SERIAL,
    data_in TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '23 hours 59 minutes'),
    data_out TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP + interval '24 hours'),
    ip VARCHAR(32) CHECK (ip != ''),
    nome VARCHAR(32) CHECK (nome != ''),
    cognome VARCHAR(32) CHECK (cognome != ''),
    ditta VARCHAR(64) CHECK (ditta != ''),
    telefono VARCHAR(32) CHECK (telefono != ''),
    ndoc VARCHAR(32) NOT NULL CHECK (ndoc != ''),
    tdoc tdoc DEFAULT 'CARTA IDENTITA',
    FOREIGN KEY (postazione) REFERENCES postazioni (id),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    user_id SERIAL,
    postazione SERIAL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (postazione) REFERENCES postazioni (id),
    PRIMARY KEY (user_id, postazione)
);

CREATE TABLE IF NOT EXISTS protocolli(
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT date_trunc('second', CURRENT_TIMESTAMP),
    descrizione TEXT CHECK (descrizione != '')
);

CREATE TABLE IF NOT EXISTS documenti(
    filename VARCHAR(256),
    descrizione TEXT,
    prot_id SERIAL,
    FOREIGN KEY (prot_id) REFERENCES protocolli (id),
    PRIMARY KEY (filename, prot_id)
);

CREATE TABLE IF NOT EXISTS prot_visibile_da(
    protocollo SERIAL,
    postazione SERIAL,
    FOREIGN KEY (protocollo) REFERENCES protocolli (id),
    FOREIGN KEY (postazione) REFERENCES postazioni (id),
    PRIMARY KEY (protocollo, postazione)
);

/*######################################################################################################################################################*/

INSERT INTO clienti (name) VALUES
    ('Corte d''Appello'),
    ('Montedomini');


INSERT INTO persone (nome, cognome, ditta, telefono, ndoc, tdoc, cliente) VALUES 
    ('Marco', 'Pierattini', 'GanzoSoft', '055-420-69', 'AU0069420', 'CARTA IDENTITA', 'Corte d''Appello'),
    ('Luca', 'Cecchi', 'GTAExpertIndustries', DEFAULT, 'AU0042069', 'PATENTE', 'Corte d''Appello'),
    ('Giorgio', 'Paolo Coda', DEFAULT, '055-420-420', 'AU006969', 'CARTA IDENTITA', 'Montedomini'),
    (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'AU00420420', 'TESSERA STUDENTE', 'Corte d''Appello');

INSERT INTO nominativi (codice, descrizione, stato, assegnazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('028212345', 'marco :-.)', 'VALIDO', 'utente', 'Corte d''Appello', '2025-03-15', 'Marco', 'Pierattini', 'GanzoSoft', '055-420-69', 'AU0069420', 'CARTA IDENTITA'),
    ('028212346', DEFAULT, 'VALIDO', 'portineria', 'Corte d''Appello', '2024-10-12', 'Luca', 'Cecchi', 'GTAExpertIndustries', '055-69-420', 'AU0042069', 'PATENTE'),
    ('028212347', DEFAULT, 'SCADUTO', 'corriere', 'Corte d''Appello', '2024-01-01', 'Giovanni', 'Panza', DEFAULT, DEFAULT, '1020301', 'TESSERA STUDENTE'),
    ('091712345', DEFAULT, 'VALIDO', 'portineria', 'Montedomini', '2025-07-09', DEFAULT, DEFAULT, 'GanzoSoft', DEFAULT, 'AU006969', 'CARTA IDENTITA');

INSERT INTO provvisori (codice, descrizione, stato, ubicazione, cliente) VALUES
    ('128212345', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
    ('128212346', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
    ('191712345', DEFAULT, DEFAULT, DEFAULT, 'Montedomini'),
    ('191712346', DEFAULT, DEFAULT, DEFAULT, 'Montedomini');

INSERT INTO chiavi (codice, descrizione, ubicazione, cliente, indirizzo, citta, edificio, piano) VALUES
    ('228212345', DEFAULT, DEFAULT, 'Corte d''Appello', 'Via Calcinaia 69', 'Kekistan', 'capannone', '0'),
    ('291712345', DEFAULT, DEFAULT, 'Montedomini', 'Piazza Shrek III 88', 'Scandicci', 'ufficio', 'B2');

INSERT INTO veicoli (codice, descrizione, stato, cliente, tveicolo, targa1, targa2, targa3, targa4, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('328212345', DEFAULT, DEFAULT, 'Corte d''Appello', DEFAULT, 'XYZ-GTA5', '88LUKE88', DEFAULT , DEFAULT, 'Gianluca', 'Causio', DEFAULT, DEFAULT, 'AU420420', 'PATENTE');

INSERT INTO users (name, password, permessi, pages) VALUES
    ('admin', '$2a$10$cLLMrZEMQCU44vy7Sqsb/uQJDo3vCXV/kUR5Zgm7CvaOQQw08Q6Yu', admin_flags(), admin_flags()),
    ('gta', '$2a$10$jeaqS/p1a4vUh9PTL/PdRepyJVZWqok7VsQK/HY4xI4SAco0ZktvG', 1 | 4 | 8, 1),
    ('DESKTOP-MH0JGEV', '$2a$10$IaMYS1vGSUMSRurXloRqE.vDLDRCjfUYCgzqh3fdo3iigCbUqrX/W', 1, 1),
    ('HPG8-CND1183BN8', '$2a$10$i/.7GEZTx.HFub1d.7d7IOLoifGua7X2OTc0jtzuEsvo/6cfBQmJO', 1 | 8, 1 | 16 | 32),
    ('Montedomini', '$2a$10$Bcf0PZjC2GSzoeY2M8Vmn.b40KQVGIycsXIfLUsKu3ClAnGkk21Aq', 1 | 2 | 4 | 8, 1);

INSERT INTO postazioni (cliente, name) VALUES
    ('Corte d''Appello', 'Sala-controllo'),
    ('Corte d''Appello', 'Tornelli-S.Donato'),
    ('Corte d''Appello', 'Tornelli-Peretola'),
    ('Corte d''Appello', 'Parcheggio-S.Donato'),
    ('Corte d''Appello', 'Parcheggio-Peretola'),
    ('Corte d''Appello', 'Parcheggio-3pini'),
    ('Corte d''Appello', 'Aula-bunker'),
    ('Corte d''Appello', 'Presidio-pulizie'),
    ('Corte d''Appello', 'Centralino'),
    ('Corte d''Appello', 'Uffici'),
    ('Montedomini', 'Desk');

INSERT INTO postazioni_user (user_id, postazione) VALUES
    (5, 11),
    (2, 1),
    (2, 2),
    (3, 5),
    (4, 2);

INSERT INTO archivio_nominativi (badge, postazione, data_in, data_out, ip) VALUES
    ('028212345', 1, '2023-12-19 8:04:55', '2023-12-19 16:15:03', '192.168.1.169'),
    ('028212345', 3, '2023-12-20 21:29:40', '2023-12-21 5:30:10', '192.168.1.170'),
    ('028212345', 1, '2023-12-22 7:58:30', '2023-12-22 16:14:58', '192.168.1.169'),
    ('091712345', 11, '2023-12-21 9:01:20', '2023-12-21 17:32:45', '85.67.108.11'),
    ('028212347', 1, '2023-12-20 8:32:35', '2023-12-20 17:05:15', '192.168.1.169'),
    ('028212345', 3, '2024-01-04 8:00:00', '2099-01-04 8:00:00', '192.168.1.170'),
    ('028212346', 3, '2024-01-04 8:30:00', '2099-01-04 8:00:00', '192.168.1.170'),
    ('091712345', 11, '2024-01-04 8:00:00', '2099-01-04 8:00:00', '85.67.108.11');

INSERT INTO archivio_provvisori (badge, postazione, data_in, data_out, ip, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('128212345', 3, '2023-12-20 21:28:50', '2023-12-21 23:16:15', '192.168.1.170', 'Luke', 'Smith', DEFAULT, DEFAULT, 'AU8842088', 'CARTA IDENTITA'),
    (DEFAULT, 1, '2023-12-20 20:28:50', '2023-12-21 21:16:15', '192.168.1.169', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842088', 'TESSERA STUDENTE'),
    ('191712345', 11, '2024-01-04 10:30:00', '2099-01-04 8:00:00', '192.168.1.170', 'Lyon', 'Gamer', DEFAULT, DEFAULT, 'AU8842069', 'PATENTE'),
    (DEFAULT, 1, '2024-01-04 11:00:00', '2099-01-04 8:00:00', '85.67.108.11', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842069', 'TESSERA STUDENTE');

INSERT INTO archivio_chiavi (badge, chiave, postazione, data_in, data_out, ip) VALUES
    ('028212345', '228212345', 1, '2023-12-21 10:25:10', '2023-12-21 11:30:20', '192.168.1.169'),
    ('028212345', '228212345', 1, '2023-12-21 10:25:10', '2023-12-21 11:45:05', '192.168.1.169'),
    ('028212345', '228212345', 1, '2023-12-22 18:07:15', '2023-12-22 20:05:20', '192.168.1.169'),
    ('028212345', '228212345', 3, '2023-01-04 9:30:00', '2099-01-04 8:00:00', '192.168.1.170');

INSERT INTO archivio_veicoli (badge, postazione, data_in, data_out, ip) VALUES
    ('328212345', 3, '2023-12-21 7:46:12', '2023-12-21 13:03:10', '192.168.1.170');

INSERT INTO protocolli (date, descrizione) VALUES
    (DEFAULT, 'prot1'),
    ('2023-12-21 13:45:00', 'prot2'),
    (DEFAULT, DEFAULT);

INSERT INTO documenti (filename, descrizione, prot_id) VALUES
    ('fattura.pdf', 'fattura per Marco Pierattini', 1),
    ('mail.pdf', 'mail Luca Cecchi', 1),
    ('bilanci.xlsn', DEFAULT, 1),
    ('bilanci.xlsn', 'bilanci scorso semestre', 3),
    ('script.bat', 'lancio web app', 2),
    ('documento.jpg', 'patente Aldo Fedonni', 2);

INSERT INTO prot_visibile_da (protocollo, postazione) VALUES
    (1, 1),
    (1, 2),
    (1, 5),
    (1, 11),
    (2, 5),
    (3, 5),
    (3, 11);

/*######################################################################################################################################################*/

-- CREATE VIEW enums AS
--     select n.nspname as enum_schema,  t.typname as enum_name,  e.enumlabel as enum_value
--     from pg_type t 
--     join pg_enum e on t.oid = e.enumtypid  
--     join pg_catalog.pg_namespace n ON n.oid = t.typnamespace;

CREATE VIEW all_badges AS
    (SELECT codice, 'PROVVISORIO' AS tipo, descrizione, stato, 'ospite' AS assegnazione, ubicazione, cliente, NULL AS scadenza, NULL AS nome, NULL AS cognome, NULL AS ditta, NULL AS telefono, NULL AS ndoc, NULL AS tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM provvisori)
    UNION
    (SELECT codice, 'NOMINATIVO' AS tipo, descrizione, stato, assegnazione, NULL AS ubicazione, cliente, scadenza, nome, cognome, ditta, telefono, ndoc, tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM nominativi)
    UNION
    (SELECT codice, 'CHIAVE' AS tipo, descrizione, 'VALIDO' AS stato, NULL AS assegnazione, ubicazione, cliente, NULL AS scadenza, NULL AS nome, NULL AS cognome, NULL AS ditta, NULL AS telefono, NULL AS ndoc, NULL AS tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, indirizzo, citta, edificio, piano
    FROM chiavi)
    UNION
    (SELECT codice, 'VEICOLO' AS tipo, descrizione, stato, NULL AS assegnazione, NULL AS ubicazione, cliente, NULL AS scadenza, nome, cognome, ditta, telefono, ndoc, tdoc, tveicolo, targa1, targa2, targa3, targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM veicoli)
    UNION
    (SELECT NULL AS codice, 'PERSONA' AS tipo, NULL AS descrizione, 'VALIDO' AS stato, NULL AS assegnazione, NULL AS ubicazione, cliente, NULL AS scadenza, nome, cognome, ditta, telefono, ndoc, tdoc, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM persone);

CREATE VIEW full_archivio AS
    SELECT t.* FROM
    ((SELECT b.codice AS badge, NULL AS chiave, 'NOMINATIVO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.ip, b.nome, b.cognome, b.ditta, b.telefono, b.ndoc, b.tdoc, b.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano
    FROM nominativi AS b
    JOIN archivio_nominativi AS a ON badge = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT v1_or_v2(a.badge, a.ndoc) AS codice, NULL AS chiave, 'PROVVISORIO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.ip, a.nome, a.cognome, a.ditta, a.telefono, a.ndoc, a.tdoc, 'ospite' AS assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano 
    FROM archivio_provvisori AS a
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT v.codice AS badge, NULL AS chiave, 'VEICOLO' AS tipo, p.cliente, p.name AS postazione, a.data_in, a.data_out, a.ip, v.nome, v.cognome, v.ditta, v.telefono, v.ndoc, v.tdoc, NULL::assegnazione as assegnazione, v.tveicolo, v.targa1, v.targa2, v.targa3, v.targa4, NULL AS indirizzo, NULL AS citta, NULL::edificio AS edificio, NULL AS piano 
    FROM veicoli AS v
    JOIN archivio_veicoli AS a ON badge = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT DISTINCT b.codice AS badge, c.codice AS chiave, 'CHIAVE' AS tipo, b.cliente, b.postazione, b.data_in, b.data_out, b.ip, b.nome, b.cognome, b.ditta, b.telefono, b.ndoc, b.tdoc, b.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4, c.indirizzo, c.citta, c.edificio, c.piano 
    FROM (
        SELECT a.id, a.badge, a.chiave, p.name AS postazione, a.data_in, a.data_out, a.ip, b.*
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
    ((SELECT a.id, b.codice, b.descrizione, 'NOMINATIVO' AS tipo, p.cliente, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, b.nome, b.cognome, b.ditta, b.telefono, b.ndoc, b.tdoc, b.assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4
    FROM nominativi AS b
    JOIN archivio_nominativi AS a ON b.codice = a.badge
    JOIN postazioni AS p ON a.postazione = p.id)
    UNION
    (SELECT a.id, v1_or_v2(a.badge, a.ndoc) AS codice, NULL AS descrizione, 'PROVVISORIO' AS tipo, p.cliente, p.name AS postazione, p.id AS postazione_id, a.data_in, a.data_out, a.ip, a.nome, a.cognome, a.ditta, a.telefono, a.ndoc, a.tdoc, 'ospite' AS assegnazione, NULL::veicolo AS tveicolo, NULL AS targa1, NULL AS targa2, NULL AS targa3, NULL AS targa4
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

-- (SELECT * FROM persone)
-- UNION
-- (SELECT nome, cognome, ditta, telefono, ndoc, tdoc FROM badges)
-- UNION
-- (SELECT nome, cognome, ditta, telefono, ndoc, tdoc FROM veicoli);

-- SELECT * FROM users
-- WHERE check_bit(permessi, 4) IS TRUE;

-- SELECT * FROM all_badges
-- WHERE cliente = 'Corte d''Appello' AND stato = 'VALIDO';

-- SELECT * FROM full_archivio
-- WHERE data_in > '2023-12-20' AND data_in < '2023-12-22';

-- SELECT * FROM enums WHERE enum_name = 'cliente';

-- SELECT * FROM full_users;

SELECT * FROM full_protocolli;

SELECT * FROM full_protocolli WHERE 11 = ANY(visibile_da_id);

-- queryInStrutt
SELECT id, codice, tipo, assegnazione, cliente, postazione, nome, cognome, ditta, data_in
FROM in_strutt
WHERE tipo = 'NOMINATIVO' OR tipo = 'PROVVISORIO'
ORDER BY data_in DESC;

SELECT * FROM archivio_nominativi WHERE is_in_strutt(data_in, data_out);

-- SELECT badge, chiave, cliente, postazione, assegnazione, nome, cognome, ditta, indirizzo, citta, edificio, piano, data_in FROM in_prestito;

SELECT badge, chiave, postazione, data_in, data_out, nome, cognome, indirizzo FROM full_archivio
WHERE data_in > '2023-12-20' AND data_in < '2023-12-22';

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