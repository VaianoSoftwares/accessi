DROP DATABASE IF EXISTS accessi;
CREATE DATABASE accessi;
--USE accessi;
\c accessi;

CREATE FUNCTION set_bit(n INT, k INT) RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    RETURN (n | (1 << (k - 1)));

CREATE FUNCTION clear_bit(n INT, k INT) RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    RETURN (n & (~(1 << (k - 1))));

CREATE FUNCTION toggle_bit(n INT, k INT) RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    RETURN (n # (1 << (k - 1)));

CREATE FUNCTION check_bit(n INT, k INT) RETURNS BOOLEAN
    LANGUAGE SQL
    IMMUTABLE
    RETURN ((n & ~(n # (1 << (k - 1)))) >> (k - 1))::bool;

CREATE FUNCTION admin_flags() RETURNS INT
    LANGUAGE SQL
    IMMUTABLE
    RETURN -1;

CREATE TYPE tdoc AS ENUM ('carta identita', 'patente', 'tessera studente');
CREATE TYPE badge_state AS ENUM ('valido', 'scaduto', 'revocato', 'riconsegnato');
CREATE TYPE cliente AS ENUM ('Corte d''Appello', 'Montedomini');
CREATE TYPE assegnazione as ENUM ('ospite', 'utente', 'giornalista', 'manutenzione', 'associazione', 'cooperativa', 'collaboratore', 'pulizie', 'portineria', 'facchinaggio', 'corriere', 'universitario');
CREATE TYPE edificio as ENUM ('appartamento', 'villetta', 'capannone', 'fondo', 'clinica', 'ufficio');
CREATE TYPE veicolo as ENUM ('auto', 'moto', 'bicicletta', 'generico');

CREATE TABLE IF NOT EXISTS persone(
    nome VARCHAR(32),
    cognome VARCHAR(32),
    ditta VARCHAR(64),
    telefono VARCHAR(32),
    ndoc VARCHAR(32),
    tdoc tdoc DEFAULT 'carta identita',
    documento VARCHAR(128) NOT NULL,
    PRIMARY KEY (ndoc, tdoc)
);

CREATE TABLE IF NOT EXISTS badges(
    codice VARCHAR(16) PRIMARY KEY,
    descrizione TEXT,
    stato badge_state DEFAULT 'valido',
    assegnazione assegnazione DEFAULT 'utente',
    cliente cliente NOT NULL,
    pfp VARCHAR(64),
    scadenza DATE,
    privacy VARCHAR(128),
    nome VARCHAR(32),
    cognome VARCHAR(32),
    ditta VARCHAR(64),
    telefono VARCHAR(32),
    ndoc VARCHAR(32) NOT NULL,
    tdoc tdoc DEFAULT 'carta identita',
    CONSTRAINT expired_badge_is_valid CHECK (stato != 'valido' OR scadenza > current_date)
);

CREATE TABLE IF NOT EXISTS provvisori(
    codice VARCHAR(16) PRIMARY KEY,
    descrizione TEXT,
    stato badge_state DEFAULT 'valido',
    ubicazione VARCHAR(32),
    cliente cliente NOT NULL
);

CREATE TABLE IF NOT EXISTS veicoli(
    codice VARCHAR(16) PRIMARY KEY,
    descrizione TEXT,
    stato badge_state DEFAULT 'valido',
    assegnazione veicolo DEFAULT 'generico',
    cliente cliente NOT NULL,
    nome VARCHAR(32),
    cognome VARCHAR(32),
    ditta VARCHAR(64),
    telefono VARCHAR(32),
    ndoc VARCHAR(32) NOT NULL,
    tdoc tdoc DEFAULT 'carta identita',
    targa1 VARCHAR(32),
    targa2 VARCHAR(32),
    targa3 VARCHAR(32),
    targa4 VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS chiavi(
    codice VARCHAR(16) PRIMARY KEY,
    descrizione TEXT,
    ubicazione VARCHAR(32),
    indirizzo VARCHAR(128),
    citta VARCHAR(64),
    edificio edificio,
    piano VARCHAR(16),
    cliente cliente NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    permessi INT DEFAULT 0,
    pages INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS postazioni(
    cliente cliente,
    name VARCHAR(64),
    PRIMARY KEY (cliente, name)
);

CREATE TABLE IF NOT EXISTS archivio_badge(
    id SERIAL PRIMARY KEY,
    badge VARCHAR(16) REFERENCES badges (codice),
    cliente cliente,
    postazione VARCHAR(64),
    data_in TIMESTAMP NOT NULL,
    data_out TIMESTAMP,
    ip VARCHAR(32),
    FOREIGN KEY (cliente, postazione) REFERENCES postazioni (cliente, name),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_veicoli(
    id SERIAL PRIMARY KEY,
    badge VARCHAR(16) REFERENCES veicoli (codice),
    cliente cliente,
    postazione VARCHAR(64),
    data_in TIMESTAMP NOT NULL,
    data_out TIMESTAMP,
    ip VARCHAR(32),
    FOREIGN KEY (cliente, postazione) REFERENCES postazioni (cliente, name),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS archivio_chiavi(
    id SERIAL PRIMARY KEY,
    badge VARCHAR(16) REFERENCES badges (codice),
    chiave VARCHAR(16) REFERENCES chiavi (codice),
    cliente cliente,
    postazione VARCHAR(64),
    data_prestito TIMESTAMP NOT NULL,
    data_reso TIMESTAMP,
    ip VARCHAR(32),
    FOREIGN KEY (cliente, postazione) REFERENCES postazioni (cliente, name),
    CONSTRAINT data_prestito_is_bigger_than_data_reso CHECK (data_reso IS NULL OR data_reso > data_prestito)
);

CREATE TABLE IF NOT EXISTS archivio_provvisori(
    id SERIAL PRIMARY KEY,
    badge VARCHAR(16) REFERENCES provvisori (codice),
    cliente cliente,
    postazione VARCHAR(64),
    data_in TIMESTAMP,
    data_out TIMESTAMP,
    ip VARCHAR(32),
    nome VARCHAR(32),
    cognome VARCHAR(32),
    ditta VARCHAR(64),
    telefono VARCHAR(32),
    ndoc VARCHAR(32) NOT NULL,
    tdoc tdoc DEFAULT 'carta identita',
    FOREIGN KEY (cliente, postazione) REFERENCES postazioni (cliente, name),
    CONSTRAINT data_in_is_bigger_than_data_out CHECK (data_out IS NULL OR data_out > data_in)
);

CREATE TABLE IF NOT EXISTS postazioni_user(
    user_id SERIAL,
    cliente cliente,
    postazione VARCHAR(64),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (cliente, postazione) REFERENCES postazioni (cliente, name),
    PRIMARY KEY (user_id, cliente, postazione)
);

/*######################################################################################################################################################*/

-- PERMESSI
-- device       1
-- canLogout    2
-- excel        4
-- provvisori   8

-- PAGES
-- badge        1
-- chiavi       2
-- veicoli      4
-- archivio     8
-- protocollo   16
-- anagrafico   32

/*######################################################################################################################################################*/

INSERT INTO persone (nome, cognome, ditta, telefono, ndoc, tdoc, documento) VALUES 
    ('Marco', 'Pierattini', 'GanzoSoft', '055-420-69', 'AU0069420', 'carta identita', 'marco.jpeg'),
    ('Luca', 'Cecchi', 'GTAExpertIndustries', DEFAULT, 'AU0042069', 'patente', 'luca.png'),
    ('Giorgio', 'Paolo Coda', DEFAULT, '055-420-420', 'AU006969', 'carta identita', 'giorgio_coda.png'),
    (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'AU00420420', 'tessera studente', 'doc-AU00420420.jpeg');

INSERT INTO badges (codice, descrizione, stato, assegnazione, cliente, pfp, scadenza, privacy, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('0123456789', 'marco :-.)', 'valido', 'utente', 'Corte d''Appello', 'pfp-0123456789.jpeg', '2025-03-15', 'privacy-0123456789.pdf', 'Marco', 'Pierattini', 'GanzoSoft', '055-420-69', 'AU0069420', 'carta identita'),
    ('0123456790', DEFAULT, 'valido', 'portineria', 'Corte d''Appello', DEFAULT, '2024-10-12', DEFAULT, 'Luca', 'Cecchi', 'GTAExpertIndustries', '055-69-420', 'AU0042069', 'patente'),
    ('0123456791', DEFAULT, 'scaduto', 'corriere', 'Corte d''Appello', DEFAULT, '2024-01-01', 'panza.pdf', 'Giovanni', 'Panza', DEFAULT, DEFAULT, '1020301', 'tessera studente'),
    ('0123456792', DEFAULT, 'valido', 'portineria', 'Montedomini', '0123456791.jpeg', '2025-07-09', '0123456791.pdf', DEFAULT, DEFAULT, 'GanzoSoft', DEFAULT, 'AU006969', 'carta identita');

INSERT INTO provvisori (codice, descrizione, stato, ubicazione, cliente) VALUES
    ('1123456789', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
    ('1123456790', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello'),
    ('1123456791', DEFAULT, DEFAULT, DEFAULT, 'Montedomini'),
    ('1123456792', DEFAULT, DEFAULT, DEFAULT, 'Montedomini');

INSERT INTO chiavi (codice, descrizione, ubicazione, indirizzo, citta, edificio, piano, cliente) VALUES
    ('2123456789', DEFAULT, DEFAULT, 'Via Calcinaia 69', 'Kekistan', 'capannone', '0', 'Corte d''Appello'),
    ('2123456790', DEFAULT, DEFAULT, 'Piazza Shrek III 88', 'Scandicci', 'ufficio', 'B2', 'Montedomini');

INSERT INTO veicoli (codice, descrizione, stato, assegnazione, cliente, targa1, targa2, targa3, targa4, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('3123456789', DEFAULT, DEFAULT, DEFAULT, 'Corte d''Appello', 'XYZ-GTA5', '88LUKE88', DEFAULT , DEFAULT, 'Gianluca', 'Causio', DEFAULT, DEFAULT, 'AU420420', 'patente');

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

INSERT INTO postazioni_user (user_id, cliente, postazione) VALUES
    (5, 'Montedomini', 'Desk'),
    (2, 'Corte d''Appello', 'Sala-controllo'),
    (2, 'Corte d''Appello', 'Tornelli-S.Donato'),
    (3, 'Corte d''Appello', 'Parcheggio-Peretola'),
    (4, 'Corte d''Appello', 'Tornelli-S.Donato');

INSERT INTO archivio_badge (badge, cliente, postazione, data_in, data_out, ip) VALUES
    ('0123456789', 'Corte d''Appello', 'Sala-controllo', '2023-12-19 8:04:55', '2023-12-19 16:15:03', '192.168.1.169'),
    ('0123456789', 'Corte d''Appello', 'Parcheggio-Peretola', '2023-12-20 21:29:40', '2023-12-21 5:30:10', '192.168.1.170'),
    ('0123456789', 'Corte d''Appello', 'Sala-controllo', '2023-12-22 7:58:30', '2023-12-22 16:14:58', '192.168.1.169'),
    ('0123456792', 'Montedomini', 'Desk', '2023-12-21 9:01:20', '2023-12-21 17:32:45', '85.67.108.11'),
    ('0123456791', 'Corte d''Appello', 'Sala-controllo', '2023-12-20 8:32:35', '2023-12-20 17:05:15', '192.168.1.169'),
    ('0123456789', 'Corte d''Appello', 'Parcheggio-Peretola', '2024-01-04 8:00:00', DEFAULT, '192.168.1.170'),
    ('0123456790', 'Corte d''Appello', 'Parcheggio-Peretola', '2024-01-04 8:30:00', DEFAULT, '192.168.1.170'),
    ('0123456792', 'Montedomini', 'Desk', '2024-01-04 8:00:00', DEFAULT, '85.67.108.11');

INSERT INTO archivio_provvisori (badge, cliente, postazione, data_in, data_out, ip, nome, cognome, ditta, telefono, ndoc, tdoc) VALUES
    ('1123456789', 'Corte d''Appello', 'Parcheggio-Peretola', '2023-12-20 21:28:50', '2023-12-21 23:16:15', '192.168.1.170', 'Luke', 'Smith', DEFAULT, DEFAULT, 'AU8842088', 'carta identita'),
    (DEFAULT, 'Corte d''Appello', 'Sala-controllo', '2023-12-20 20:28:50', '2023-12-21 21:16:15', '192.168.1.169', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842088', 'tessera studente'),
    ('1123456789', 'Montedomini', 'Desk', '2024-01-04 10:30:00', DEFAULT, '192.168.1.170', 'Lyon', 'Gamer', DEFAULT, DEFAULT, 'AU8842069', 'patente'),
    (DEFAULT, 'Corte d''Appello', 'Sala-controllo', '2024-01-04 11:00:00', DEFAULT, '85.67.108.11', DEFAULT, DEFAULT, DEFAULT, DEFAULT, '8842069', 'tessera studente');

INSERT INTO archivio_chiavi (badge, chiave, cliente, postazione, data_prestito, data_reso, ip) VALUES
    ('0123456789', '2123456789', 'Corte d''Appello', 'Sala-controllo', '2023-12-21 10:25:10', '2023-12-21 11:30:20', '192.168.1.169'),
    ('0123456789', '2123456790', 'Corte d''Appello', 'Sala-controllo', '2023-12-21 10:25:10', '2023-12-21 11:45:05', '192.168.1.169'),
    ('0123456789', '2123456790', 'Corte d''Appello', 'Sala-controllo', '2023-12-22 18:07:15', '2023-12-22 20:05:20', '192.168.1.169'),
    ('0123456789', '2123456789', 'Corte d''Appello', 'Parcheggio-Peretola', '2023-01-04 9:30:00', DEFAULT, '192.168.1.170');

INSERT INTO archivio_veicoli (badge, cliente, postazione, data_in, data_out, ip) VALUES
    ('3123456789', 'Corte d''Appello', 'Parcheggio-Peretola', '2023-12-21 7:46:12', '2023-12-21 13:03:10', '192.168.1.170');

/*######################################################################################################################################################*/

(SELECT a.badge, a.cliente, b.assegnazione, b.nome, b.cognome, b.ditta, b.ndoc, b.tdoc, a.data_in FROM archivio_badge AS a
JOIN badges AS b ON a.badge = b.codice
WHERE a.data_out IS NULL) 
UNION
(SELECT badge, cliente, 'ospite' as assegnazione, nome, cognome, ditta, ndoc, tdoc, data_in FROM archivio_provvisori
WHERE data_out IS NULL);

(SELECT * FROM persone)
UNION
(SELECT nome, cognome, ditta, telefono, ndoc, tdoc, NULL as documento FROM badges)
UNION
(SELECT nome, cognome, ditta, telefono, ndoc, tdoc, NULL as documento FROM veicoli);

SELECT * FROM users
WHERE check_bit(permessi, 4) IS TRUE;

/*######################################################################################################################################################*/

\c owen;