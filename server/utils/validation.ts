import z from "zod";
import { TIPI_BADGE } from "../types/badges.js";
import { BarcodePrefix } from "../types/archivio.js";
import { TDOCS } from "../types/people.js";

function MISSING_ATTR_ERR_MSG(attribute: string) {
  return `Campo ${attribute} risulta mancante`;
}
function ATTR_TOO_SHORT_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere almeno ${length} caratteri`;
}
function ATTR_TOO_LONG_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere al massimo ${length} caratteri`;
}
function ATTR_NUM_NEGATIVE(attribute: string) {
  return `Campo ${attribute} deve essere un numero positivo`;
}

const UNAME_MIN_LEN = 3;
const UNAME_TOO_SHORT_ERR_MSG = ATTR_TOO_SHORT_ERR_MSG(
  "Username",
  UNAME_MIN_LEN
);
const UNAME_MAX_LEN = 32;
const UNAME_TOO_LONG_ERR_MSG = ATTR_TOO_LONG_ERR_MSG("Username", UNAME_MAX_LEN);
const PSW_MIN_LEN = 6;
const PSW_TOO_SHORT_ERR_MSG = ATTR_TOO_SHORT_ERR_MSG("Password", PSW_MIN_LEN);
const PSW_MAX_LEN = 256;
const PSW_TOO_LONG_ERR_MSG = ATTR_TOO_LONG_ERR_MSG("Password", PSW_MAX_LEN);

const CODICE_LEN = 9;
const CODICE_LEN_ERR_MSG = `Barcode deve contenere esattamente ${CODICE_LEN} cifre`;

const BARCODE_LEN = 10;
const BARCODE_LEN_ERR_MSG = `Barcode deve contenere esattamente ${BARCODE_LEN} cifre`;

const ID_STUD_LEN = 7;
const ID_STUD_LEN_ERR_MSG = `Codice studente deve contenere esattamente ${ID_STUD_LEN} cifre`;

export function ID_SCHEMA(attrName = "ID") {
  return z.coerce
    .number({ required_error: MISSING_ATTR_ERR_MSG(attrName) })
    .nonnegative(ATTR_NUM_NEGATIVE(attrName));
}

const USERNAME_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Username") })
  .min(UNAME_MIN_LEN, UNAME_TOO_SHORT_ERR_MSG)
  .max(UNAME_MAX_LEN, UNAME_TOO_LONG_ERR_MSG);
const PASSWORD_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Password") })
  .min(PSW_MIN_LEN, PSW_TOO_SHORT_ERR_MSG)
  .max(PSW_MAX_LEN, PSW_TOO_LONG_ERR_MSG);

export const LOGIN_SCHEMA = z.object({
  name: USERNAME_SCHEMA,
  password: PASSWORD_SCHEMA,
});

export const REGISTER_SCHEMA = z.object({
  name: USERNAME_SCHEMA,
  password: PASSWORD_SCHEMA,
  permessi: z
    .number({ required_error: MISSING_ATTR_ERR_MSG("Permessi") })
    .nonnegative(ATTR_NUM_NEGATIVE("permessi")),
  pages: z
    .number({ required_error: MISSING_ATTR_ERR_MSG("Permessi") })
    .nonnegative(ATTR_NUM_NEGATIVE("pagine")),
  postazioniIds: z
    .array(ID_SCHEMA("Postazione ID"))
    .nonempty(MISSING_ATTR_ERR_MSG("Postazioni")),
});
export type InsertUserData = z.infer<typeof REGISTER_SCHEMA>;

export const UPDATE_USER_SCHEMA = z.object({
  id: ID_SCHEMA("User ID"),
  updateValues: z.object({
    name: USERNAME_SCHEMA.optional(),
    password: PASSWORD_SCHEMA.optional(),
    permessi: z.number().nonnegative(ATTR_NUM_NEGATIVE("permessi")).optional(),
    pages: z.number().nonnegative(ATTR_NUM_NEGATIVE("pagine")).optional(),
    postazioniIds: z
      .array(
        z.object({
          checked: z.boolean(),
          post_id: ID_SCHEMA("Postazione ID"),
        })
      )
      .nonempty()
      .optional(),
  }),
});
export type UpdateUserData = z.infer<typeof UPDATE_USER_SCHEMA>;

export const UPD_POST_USR_SCHEMA = z
  .array(
    z.object({
      checked: z.boolean(),
      post_id: ID_SCHEMA("Postazione ID"),
    })
  )
  .nonempty();
export type UpdPostazioniUserData = z.infer<typeof UPD_POST_USR_SCHEMA>;

export const CODICE_NOM_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith(BarcodePrefix.nominativoGenerico, "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_PROV_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith(BarcodePrefix.provvisorioGenerico, "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_CHIAVE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith(BarcodePrefix.chiaveGenerico, "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_VEICOLO_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith(BarcodePrefix.veicoloGenerico, "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_SCHEMA = z.union([
  CODICE_NOM_SCHEMA,
  CODICE_PROV_SCHEMA,
  CODICE_CHIAVE_SCHEMA,
  CODICE_VEICOLO_SCHEMA,
]);

export const GET_PEOPLES_SCHEMA = z.object({
  id: ID_SCHEMA("Person ID").nullish(),
  nome: z.string().nullish(),
  cognome: z.string().nullish(),
  assegnazione: z.string().nullish(),
  ditta: z.string().nullish(),
  ndoc: z.string().nullish(),
  tdoc: z.string().nullish(),
  telefono: z.string().nullish(),
  scadenza: z.coerce.date().nullish(),
  cliente: z.string().nullish(),
});
export type FindPeoplesFilter = z.infer<typeof GET_PEOPLES_SCHEMA>;

export const INSERT_PERSON_SCHEMA = z.object({
  nome: z.string({ required_error: MISSING_ATTR_ERR_MSG("Nome") }),
  cognome: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cognome") }),
  assegnazione: z.string().default("UTENTE"),
  ditta: z.string().optional(),
  ndoc: z.string().optional(),
  tdoc: z.string().optional(),
  telefono: z.string().optional(),
  scadenza: z.coerce.date().optional(),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
});
export type InsertPersonData = z.infer<typeof INSERT_PERSON_SCHEMA>;

export const UPDATE_PERSON_SCHEMA = z.object({
  id: ID_SCHEMA("Person ID"),
  updateData: z.object({
    nome: z.string().optional(),
    cognome: z.string().optional(),
    assegnazione: z.string().optional(),
    ditta: z.string().optional(),
    ndoc: z.string().optional(),
    tdoc: z.string().optional(),
    telefono: z.string().optional(),
    scadenza: z.coerce.date().optional(),
    cliente: z.string().optional(),
  }),
});
export type UpdatePersonData = z.infer<typeof UPDATE_PERSON_SCHEMA>;

export const GET_BADGES_SCHEMA = z.object({
  codice: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).nullish(),
  descrizione: z.string().nullish(),
  stato: z.string().nullish(),
  cliente: z.string().nullish(),
  proprietario: ID_SCHEMA("Proprietario ID").nullish(),
  ubicazione: z.string().nullish(),
  provvisorio: z.coerce.boolean().optional(),
});
export type FindBadgesFilter = z.infer<typeof GET_BADGES_SCHEMA>;

export const INSERT_BADGE_SCHEMA = z.object({
  descrizione: z.string().optional(),
  stato: z.string().default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  proprietario: ID_SCHEMA("Proprietario ID").optional(),
  ubicazione: z.string().optional(),
  provvisorio: z.coerce.boolean().default(false),
});
export type InsertBadgeData = z.infer<typeof INSERT_BADGE_SCHEMA>;

export const UPDATE_BADGE_SCHEMA = z.object({
  codice: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]),
  updateData: z.object({
    descrizione: z.string().optional(),
    stato: z.string().optional(),
    cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
    proprietario: ID_SCHEMA("Proprietario ID").optional(),
    ubicazione: z.string().optional(),
  }),
});
export type UpdateBadgeData = z.infer<typeof UPDATE_BADGE_SCHEMA>;

export const DELETE_BADGE_SCHEMA = z.union([
  CODICE_NOM_SCHEMA,
  CODICE_PROV_SCHEMA,
]);

export const GET_VEICOLI_SCHEMA = z.object({
  id: ID_SCHEMA("Person ID").nullish(),
  targa: z.string().nullish(),
  tipo: z.string().nullish(),
  descrizione: z.string().nullish(),
  stato: z.string().nullish(),
  cliente: z.string().nullish(),
  proprietario: ID_SCHEMA("Proprietario ID").nullish(),
});
export type FindVeicoliFilter = z.infer<typeof GET_VEICOLI_SCHEMA>;

export const INSERT_VEICOLO_SCHEMA = z.object({
  targa: z.string({ required_error: MISSING_ATTR_ERR_MSG("Targa") }),
  tipo: z.string().default("GENERICO"),
  descrizione: z.string().optional(),
  stato: z.string().default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  proprietario: ID_SCHEMA("Proprietario ID"),
});
export type InsertVeicoloData = z.infer<typeof INSERT_VEICOLO_SCHEMA>;

export const UPDATE_VEICOLO_SCHEMA = z.object({
  id: ID_SCHEMA("Veicolo ID"),
  updateData: z.object({
    targa: z.string().optional(),
    tipo: z.string().optional(),
    descrizione: z.string().optional(),
    stato: z.string().optional(),
    cliente: z.string().optional(),
    proprietario: ID_SCHEMA("Proprietario ID").optional(),
  }),
});
export type UpdateVeicoloData = z.infer<typeof UPDATE_VEICOLO_SCHEMA>;

export const GET_CHIAVI_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA.nullish(),
  descrizione: z.string().nullish(),
  stato: z.string().nullish(),
  cliente: z.string().nullish(),
  proprietario: ID_SCHEMA("Proprietario ID").nullish(),
  indirizzo: z.string().nullish(),
  edificio: z.string().nullish(),
  citta: z.string().nullish(),
  piano: z.string().nullish(),
  ubicazione: z.string().nullish(),
});
export type FindChiaviFilter = z.infer<typeof GET_CHIAVI_SCHEMA>;

export const INSERT_CHIAVE_SCHEMA = z.object({
  descrizione: z.string().optional(),
  stato: z.string().default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  proprietario: ID_SCHEMA("Proprietario ID").optional(),
  indirizzo: z.string().optional(),
  edificio: z.string().optional(),
  citta: z.string().optional(),
  piano: z.string().optional(),
  ubicazione: z.string().nullish(),
});
export type InsertChiaveData = z.infer<typeof INSERT_CHIAVE_SCHEMA>;

export const UPDATE_CHIAVE_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA,
  updateData: z.object({
    descrizione: z.string().optional(),
    stato: z.string().optional(),
    cliente: z.string().optional(),
    proprietario: ID_SCHEMA("Proprietario ID").optional(),
    indirizzo: z.string().optional(),
    edificio: z.string().optional(),
    citta: z.string().optional(),
    piano: z.string().optional(),
    ubicazione: z.string().nullish(),
  }),
});
export type UpdateChiaveData = z.infer<typeof UPDATE_CHIAVE_SCHEMA>;

export const GET_ARCHIVIO_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  targa: z.string().optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  data_in_min: z.coerce.date().optional(),
  data_in_max: z.coerce.date().optional(),
  data_out_min: z.coerce.date().optional(),
  data_out_max: z.coerce.date().optional(),
  postazione: z.string().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  ip: z.string().optional(),
  username: z.string().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  scadenza: z.coerce.date().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  edificio: z.string().optional(),
  piano: z.string().optional(),
  tveicolo: z.string().optional(),
});
export type FindArchivioFilter = z.infer<typeof GET_ARCHIVIO_SCHEMA>;

export const GET_IN_STRUTT_BADGES_SCHEMA = z.object({
  id: ID_SCHEMA().optional(),
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  codice: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  data_in_min: z.coerce.date().optional(),
  data_in_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
});
export type FindInStruttBadgesFilter = z.infer<
  typeof GET_IN_STRUTT_BADGES_SCHEMA
>;

export const GET_IN_STRUTT_VEICOLI_SCHEMA = z.object({
  id: ID_SCHEMA().optional(),
  targa: z.string().optional(),
  veicolo: z.string().optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  data_in_min: z.coerce.date().optional(),
  data_in_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  tveicolo: z.string().optional(),
});
export type FindInStruttVeicoliFilter = z.infer<
  typeof GET_IN_STRUTT_VEICOLI_SCHEMA
>;

export const FIND_IN_PRESTITO_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  data_in_min: z.coerce.date().optional(),
  data_in_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  edificio: z.string().optional(),
  piano: z.string().optional(),
});
export type FindInPrestitoFilter = z.infer<typeof FIND_IN_PRESTITO_SCHEMA>;

const BARCODE_NOM_ENTRA_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.nominativoIn, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const BARCODE_NOM_ESCE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.nominativoOut, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const BARCODE_PROV_ENTRA_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.provvisorioIn, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const BARCODE_PROV_ESCE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.provvisorioOut, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const BARCODE_CHIAVE_ENTRA_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.chiaveIn, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const BARCODE_CHIAVE_ESCE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .startsWith(BarcodePrefix.chiaveOut, "Barcode non valido")
  .regex(/^\d+$/, "Barcode deve contenere solo cifre numeriche")
  .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG);
const CODICE_STUDENTE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  .regex(/^\d+$/, "Codice studente deve contenere solo cifre numeriche")
  .length(ID_STUD_LEN, ID_STUD_LEN_ERR_MSG);

export const TIMBRA_BADGE_SCHEMA = z.object({
  badge: z.union([
    BARCODE_NOM_ENTRA_SCHEMA,
    BARCODE_NOM_ESCE_SCHEMA,
    BARCODE_PROV_ENTRA_SCHEMA,
    BARCODE_PROV_ESCE_SCHEMA,
    CODICE_STUDENTE_SCHEMA,
  ]),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
});
export type TimbraBadgeData = z.infer<typeof TIMBRA_BADGE_SCHEMA>;

export const TIMBRA_VEICOLO_SCHEMA = z.object({
  targa: z.string({ required_error: MISSING_ATTR_ERR_MSG("Targa") }),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
});
export type TimbraVeicoloData = z.infer<typeof TIMBRA_VEICOLO_SCHEMA>;

export const TIMBRA_CHIAVI_SCHEMA = z.object({
  post_id: ID_SCHEMA("Postazione ID"),
  barcodes: z
    .union([
      BARCODE_CHIAVE_ENTRA_SCHEMA,
      BARCODE_CHIAVE_ESCE_SCHEMA,
      BARCODE_NOM_ENTRA_SCHEMA,
      BARCODE_NOM_ESCE_SCHEMA,
      CODICE_CHIAVE_SCHEMA,
      CODICE_NOM_SCHEMA,
    ])
    .array()
    .nonempty(MISSING_ATTR_ERR_MSG("Barcodes")),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
});
// export type TimbraChiaviData = z.infer<typeof TIMBRA_CHIAVI_SCHEMA>;

export const INSERT_ARCH_BADGE_SCHEMA = z.object({
  badge: z.union([
    BARCODE_PROV_ENTRA_SCHEMA,
    BARCODE_PROV_ESCE_SCHEMA,
    CODICE_PROV_SCHEMA,
  ]),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  assegnazione: z.string().default("OSPITE"),
  ditta: z.string().optional(),
  telefono: z.string().optional(),
  ndoc: z.string().optional(),
  tdoc: z.string().optional(),
});
export type InsertArchBadgeData = z.infer<typeof INSERT_ARCH_BADGE_SCHEMA>;

export const INSERT_ARCH_VEICOLO_SCHEMA = z.object({
  targa: z.string({ required_error: MISSING_ATTR_ERR_MSG("Targa") }),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  assegnazione: z.string().default("OSPITE"),
  ditta: z.string().optional(),
  telefono: z.string().optional(),
  ndoc: z.string().optional(),
  tdoc: z.string().optional(),
  tveicolo: z.string().default("GENERICO"),
});
export type InsertArchVeicoloData = z.infer<typeof INSERT_ARCH_VEICOLO_SCHEMA>;

export const GET_PROTOCOLLI_SCHEMA = z.object({
  id: ID_SCHEMA("Prot ID").optional(),
  prot_descrizione: z.string().optional(),
  doc_descrizione: z.string().optional(),
  filename: z.string().optional(),
  dataInizio: z.coerce.date().optional(),
  dataFine: z.coerce.date().optional(),
  post_id: ID_SCHEMA("User ID").optional(),
  postazioneName: z.string().optional(),
});
export type GetProtocolliFilter = z.infer<typeof GET_PROTOCOLLI_SCHEMA>;

export const INSERT_PROTOCOLLO_SCHEMA = z.object({
  descrizione: z.string().optional(),
  visibileDa: ID_SCHEMA("Prot ID")
    .array()
    .nonempty(MISSING_ATTR_ERR_MSG("visibileDa")),
});
export type InsertProtocolloData = z.infer<typeof INSERT_PROTOCOLLO_SCHEMA>;

export const INSERT_CLIENTE_SCHEMA = z.object({
  name: z.string({ required_error: MISSING_ATTR_ERR_MSG("cliente") }),
});

export const FIND_POSTAZIONI_SCHEMA = z.object({
  ids: ID_SCHEMA("Postazione ID")
    .array()
    .nonempty(MISSING_ATTR_ERR_MSG("Postazioni"))
    .optional(),
  cliente: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("cliente") })
    .optional(),
  name: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("postazione") })
    .optional(),
});
export type FindPostazioniData = z.infer<typeof FIND_POSTAZIONI_SCHEMA>;

export const INSERT_POSTAZIONE_SCHEMA = z.object({
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("cliente") }),
  name: z.string({ required_error: MISSING_ATTR_ERR_MSG("postazione") }),
});

export const UPDATE_POSTAZIONE_SCHEMA = z.object({
  id: ID_SCHEMA("Postazione ID"),
  updateData: z.object({
    cliente: z.string().optional(),
    postazione: z.string().optional(),
  }),
});
