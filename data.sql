--
-- PostgreSQL database dump
--

-- Dumped from database version 14.5
-- Dumped by pg_dump version 14.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

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



--
-- Name: archivio_chiavi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_chiavi_id_seq', 1, false);


--
-- Name: archivio_chiavi_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_chiavi_postazione_seq', 1, false);


--
-- Name: archivio_nominativi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_nominativi_id_seq', 4, true);


--
-- Name: archivio_nominativi_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_nominativi_postazione_seq', 1, false);


--
-- Name: archivio_provvisori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_provvisori_id_seq', 1, true);


--
-- Name: archivio_provvisori_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_provvisori_postazione_seq', 1, false);


--
-- Name: archivio_veicoli_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_veicoli_id_seq', 1, false);


--
-- Name: archivio_veicoli_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivio_veicoli_postazione_seq', 1, false);


--
-- Name: documenti_prot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documenti_prot_id_seq', 1, false);


--
-- Name: postazioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postazioni_id_seq', 11, true);


--
-- Name: postazioni_user_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postazioni_user_postazione_seq', 1, false);


--
-- Name: postazioni_user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postazioni_user_user_id_seq', 1, false);


--
-- Name: prot_visibile_da_postazione_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prot_visibile_da_postazione_seq', 1, false);


--
-- Name: prot_visibile_da_protocollo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prot_visibile_da_protocollo_seq', 1, false);


--
-- Name: protocolli_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.protocolli_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- PostgreSQL database dump complete
--
