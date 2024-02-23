import z from "zod";
import { STATI_BADGE, TDOCS, TIPI_BADGE } from "../_types/badges.js";

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
const CODICE_LEN_ERR_MSG = `Barcode deve contenere esattamente ${CODICE_LEN} caratteri`;

const BARCODE_LEN = 10;
const BARCODE_LEN_ERR_MSG = `Barcode deve contenere esattamente ${BARCODE_LEN} caratteri`;

function ID_SCHEMA(attrName = "ID") {
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
  postazioni: z
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
  }),
});
export type UpdateUserData = z.infer<typeof UPDATE_USER_SCHEMA>;

export const UPD_POST_USR_SCHEMA = z
  .array(
    z.object({
      checked: z.boolean(),
      postazione: ID_SCHEMA("Postazione ID"),
    })
  )
  .nonempty();
export type UpdPostazioniUserData = z.infer<typeof UPD_POST_USR_SCHEMA>;

export const CODICE_NOM_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith("0", "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_PROV_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith("1", "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_CHIAVE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith("2", "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_VEICOLO_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith("3", "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_SCHEMA = z.union([
  CODICE_NOM_SCHEMA,
  CODICE_PROV_SCHEMA,
  CODICE_CHIAVE_SCHEMA,
  CODICE_VEICOLO_SCHEMA,
]);

export const FIND_BADGES_SCHEMA = z.object({
  codice: CODICE_NOM_SCHEMA.optional(),
  descrizione: z.string().optional(),
  assegnazione: z.string().optional(),
  stato: z.enum(STATI_BADGE).optional(),
  cliente: z.string().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  ubicazione: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  edificio: z.string().optional(),
  piano: z.string().optional(),
  tveicolo: z.string().optional(),
  targa1: z.string().optional(),
  targa2: z.string().optional(),
  targa3: z.string().optional(),
  targa4: z.string().optional(),
});
export type FindBadgesFilter = z.infer<typeof FIND_BADGES_SCHEMA>;

export const INSERT_NOM_SCHEMA = z.object({
  codice: CODICE_NOM_SCHEMA.nullish(),
  descrizione: z.string().nullish(),
  assegnazione: z.string().nullish(),
  stato: z.enum(STATI_BADGE).default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  nome: z.string().nullish(),
  cognome: z.string().nullish(),
  telefono: z.string().nullish(),
  ditta: z.string().nullish(),
  tdoc: z.enum(TDOCS),
  ndoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Numero Documento") }),
  scadenza: z.union([z.string(), z.coerce.date()]).nullish(),
});

export const UPDATE_NOM_SCHEMA = z.object({
  codice: CODICE_NOM_SCHEMA,
  updateData: z.object({
    codice: CODICE_NOM_SCHEMA.optional(),
    descrizione: z.string().optional(),
    assegnazione: z.string().optional(),
    stato: z.enum(STATI_BADGE).optional(),
    cliente: z.string().optional(),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    telefono: z.string().optional(),
    ditta: z.string().optional(),
    tdoc: z.enum(TDOCS).optional(),
    ndoc: z.string().optional(),
    scadenza: z.union([z.string(), z.coerce.date()]).optional(),
  }),
});

export const INSERT_PROVV_SCHEMA = z.object({
  codice: CODICE_PROV_SCHEMA.nullish(),
  descrizione: z.string().nullish(),
  stato: z.enum(STATI_BADGE).default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  ubicazione: z.string().nullish(),
});

export const UPDATE_PROVV_SCHEMA = z.object({
  codice: CODICE_PROV_SCHEMA,
  updateData: z.object({
    codice: CODICE_PROV_SCHEMA.optional(),
    descrizione: z.string().optional(),
    stato: z.enum(STATI_BADGE).optional(),
    cliente: z.string().optional(),
    ubicazione: z.string().optional(),
  }),
});

export const INSERT_CHIAVE_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA.nullish(),
  descrizione: z.string().nullish(),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  ubicazione: z.string().nullish(),
  indirizzo: z.string().nullish(),
  citta: z.string().nullish(),
  edificio: z.string().nullish(),
  piano: z.string().nullish(),
});

export const UPDATE_CHIAVE_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA,
  updateData: z.object({
    codice: CODICE_CHIAVE_SCHEMA.optional(),
    descrizione: z.string().optional(),
    cliente: z.string().optional(),
    ubicazione: z.string().optional(),
    indirizzo: z.string().optional(),
    citta: z.string().optional(),
    edificio: z.string().optional(),
    piano: z.string().optional(),
  }),
});

export const INSERT_VEICOLO_SCHEMA = z.object({
  codice: CODICE_VEICOLO_SCHEMA.nullish(),
  descrizione: z.string().nullish(),
  assegnazione: z.string().nullish(),
  stato: z.enum(STATI_BADGE).default("VALIDO"),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  nome: z.string().nullish(),
  cognome: z.string().nullish(),
  telefono: z.string().nullish(),
  ditta: z.string().nullish(),
  tdoc: z.enum(TDOCS),
  ndoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Numero Documento") }),
  tveicolo: z.string().default("GENERICO"),
  targa1: z.string().nullish(),
  targa2: z.string().nullish(),
  targa3: z.string().nullish(),
  targa4: z.string().nullish(),
});

export const UPDATE_VEICOLO_SCHEMA = z.object({
  codice: CODICE_VEICOLO_SCHEMA,
  updateData: z.object({
    codice: CODICE_VEICOLO_SCHEMA.optional(),
    descrizione: z.string().optional(),
    assegnazione: z.string().optional(),
    stato: z.enum(STATI_BADGE).optional(),
    cliente: z.string().optional(),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    telefono: z.string().optional(),
    ditta: z.string().optional(),
    tdoc: z.enum(TDOCS).optional(),
    ndoc: z.string().optional(),
    tveicolo: z.string().optional(),
    targa1: z.string().optional(),
    targa2: z.string().optional(),
    targa3: z.string().optional(),
    targa4: z.string().optional(),
  }),
});

export const FIND_PERSONE_SCHEMA = z.object({
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
});
export type FindPersoneFilter = z.infer<typeof FIND_PERSONE_SCHEMA>;

export const INSERT_PERSONA_SCHEMA = z.object({
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS),
  ndoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Numero Documento") }),
});

export const PERSONA_DOC_SCHEMA = z.object({
  ndoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Numero Documento") }),
  tdoc: z.enum(TDOCS),
});

export const UPDATE_PERSONA_SCHEMA = z.object({
  docInfo: PERSONA_DOC_SCHEMA,
  updateData: z.object({
    nome: z.string().optional(),
    cognome: z.string().optional(),
    telefono: z.string().optional(),
    ditta: z.string().optional(),
    tdoc: z.enum(TDOCS).optional(),
    ndoc: z.string().optional(),
  }),
});

export const FIND_ARCHIVIO_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  data_in_min: z.union([z.string(), z.coerce.date()]).optional(),
  data_in_max: z.union([z.string(), z.coerce.date()]).optional(),
  data_out_min: z.union([z.string(), z.coerce.date()]).optional(),
  data_out_max: z.union([z.string(), z.coerce.date()]).optional(),
  postazione: ID_SCHEMA("ID Postazione").optional(),
  ip: z.string().optional(),
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
  targa1: z.string().optional(),
  targa2: z.string().optional(),
  targa3: z.string().optional(),
  targa4: z.string().optional(),
  tveicolo: z.string().optional(),
});
export type FindArchivioFilter = z.infer<typeof FIND_ARCHIVIO_SCHEMA>;

export const FIND_IN_STRUTT_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  data_in_min: z.union([z.string(), z.coerce.date()]).optional(),
  data_in_max: z.union([z.string(), z.coerce.date()]).optional(),
  postazione: ID_SCHEMA("ID Postazione").optional(),
  postazioni: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  targa1: z.string().optional(),
  targa2: z.string().optional(),
  targa3: z.string().optional(),
  targa4: z.string().optional(),
  tveicolo: z.string().optional(),
});
export type FindInStruttFilter = z.infer<typeof FIND_IN_STRUTT_SCHEMA>;

export const FIND_IN_PRESTITO_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  data_in_min: z.union([z.string(), z.coerce.date()]).optional(),
  data_in_max: z.union([z.string(), z.coerce.date()]).optional(),
  postazione: ID_SCHEMA("ID Postazione").optional(),
  postazioni: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
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

export const TIMBRA_BADGE_SCHEMA = z.object({
  badge: z.union([
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("00", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("10", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("01", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("11", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("03", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("13", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
  ]),
  postazione: ID_SCHEMA("Postazione ID"),
});

export const TIMBRA_CHIAVI_SCHEMA = z.object({
  badge: z.union([
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Badge") })
      .startsWith("00", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Badge") })
      .startsWith("10", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
  ]),
  postazione: ID_SCHEMA("Postazione ID"),
  chiavi: z
    .union([
      z
        .string()
        .startsWith("02", "Chiave non valida")
        .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
      z
        .string()
        .startsWith("12", "Chiave non valida")
        .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    ])
    .array()
    .nonempty(MISSING_ATTR_ERR_MSG("Chiavi")),
});

export const INSERT_ARCH_PROV_SCHEMA = z.object({
  badge: z.union([
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("00", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
    z
      .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
      .startsWith("10", "Barcode non valido")
      .length(BARCODE_LEN, BARCODE_LEN_ERR_MSG),
  ]),
  postazione: ID_SCHEMA("Postazione ID"),
  nome: z.string().nullish(),
  cognome: z.string().nullish(),
  ditta: z.string().nullish(),
  telefono: z.string().nullish(),
  ndoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Numero Documento") }),
  tdoc: z.string({ required_error: MISSING_ATTR_ERR_MSG("Tipo Documento") }),
  ip: z.string(),
});
export type InsertArchProvData = z.infer<typeof INSERT_ARCH_PROV_SCHEMA>;

export const GET_PROTOCOLLI_SCHEMA = z.object({
  id: ID_SCHEMA("Prot ID").optional(),
  prot_descrizione: z.string().optional(),
  doc_descrizione: z.string().optional(),
  filename: z.string().optional(),
  dataInizio: z.union([z.string(), z.coerce.date()]).optional(),
  dataFine: z.union([z.string(), z.coerce.date()]).optional(),
  userId: ID_SCHEMA("User ID").optional(),
  username: z.string().optional(),
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
  ids: z
    .array(ID_SCHEMA("Postazione ID"))
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
