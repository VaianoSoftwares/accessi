import z from "zod";
import { TIPI_BADGE, STATI_BADGE, TDOCS } from "../types/badges.js";

function MISSING_ATTR_ERR_MSG(attribute: string) {
  return `Campo ${attribute} risulta mancante`;
}
function ATTR_TOO_SHORT_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere almeno ${length} caratteri`;
}
function ATTR_TOO_LONG_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere al massimo ${length} caratteri`;
}

const STR_MIN_LEN = 3;
const STR_MAX_LEN = 256;

const ID_LEN = 24;
const ID_LENGTH_ERR_MSG = `ID deve contenere esattamente ${ID_LEN} caratteri`;

const UNAME_MIN_LEN = 5;
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

const BARCODE_MIN_LEN = 3;
const BARCODE_TOO_SHORT_ERR_MSG = ATTR_TOO_SHORT_ERR_MSG(
  "Barcode",
  BARCODE_MIN_LEN
);
const BARCODE_MAX_LEN = 32;
const BARCODE_TOO_LONG_ERR_MSG = ATTR_TOO_SHORT_ERR_MSG(
  "Barcode",
  BARCODE_MAX_LEN
);

const LOGIN_SCHEMA = z.object({
  username: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Username") })
    .min(UNAME_MIN_LEN, UNAME_TOO_SHORT_ERR_MSG)
    .max(UNAME_MAX_LEN, UNAME_TOO_LONG_ERR_MSG),
  password: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Password") })
    .min(PSW_MIN_LEN, PSW_TOO_SHORT_ERR_MSG)
    .max(PSW_MAX_LEN, PSW_TOO_LONG_ERR_MSG),
});

const REGISTER_SCHEMA = z.object({
  username: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Username") })
    .min(UNAME_MIN_LEN, UNAME_TOO_SHORT_ERR_MSG)
    .max(UNAME_MAX_LEN, UNAME_TOO_LONG_ERR_MSG),
  password: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Password") })
    .min(PSW_MIN_LEN, PSW_TOO_SHORT_ERR_MSG)
    .max(PSW_MAX_LEN, PSW_TOO_LONG_ERR_MSG),
  postazioni: z.string().array().nonempty(MISSING_ATTR_ERR_MSG("Postazioni")),
  pages: z.string().array().nonempty(MISSING_ATTR_ERR_MSG("Pagine")),
  device: z.string().nullish(),
  canLogout: z.coerce.boolean().default(false),
  excel: z.coerce.boolean().default(false),
  provvisori: z.coerce.boolean().default(false),
});

const GET_USER_SCHEMA = z.object({
  id: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("ID") })
    .length(ID_LEN, ID_LENGTH_ERR_MSG),
});

const UPDATE_USER_SCHEMA = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  postazioni: z.string().array().nonempty().nullish().default(null),
  pages: z.string().array().nonempty().nullish().default(null),
  device: z.string().optional(),
  canLogout: z.boolean().optional(),
  excel: z.coerce.boolean().optional(),
  provvisori: z.coerce.boolean().optional(),
});

const FIND_BADGE_SCHEMA = z
  .object({
    barcode: z
      .string()
      .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
      .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG)
      .optional(),
    descrizione: z.string().optional(),
    tipo: z.enum(TIPI_BADGE).optional(),
    assegnazione: z.string().optional(),
    stato: z.enum(STATI_BADGE).optional(),
    ubicazione: z.string().optional(),
    cliente: z.string().optional(),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    telefono: z.string().optional(),
    ditta: z.string().optional(),
    tdoc: z.enum(TDOCS).optional(),
    ndoc: z.string().optional(),
    scadenza: z.union([z.coerce.date(), z.literal("")]).optional(),
    targa1: z.string().optional(),
    targa2: z.string().optional(),
    targa3: z.string().optional(),
    targa4: z.string().optional(),
  })
  .optional();
export type TFindBadgeReq = z.infer<typeof FIND_BADGE_SCHEMA>;

const INSERT_BADGE_SCHEMA = z.object({
  // barcode: z
  //   .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
  //   .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
  //   .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG),
  barcode: z.string().default(""),
  descrizione: z.string().default(""),
  tipo: z.enum(TIPI_BADGE).default("BADGE"),
  assegnazione: z.string().default(""),
  stato: z.enum(STATI_BADGE).default("VALIDO"),
  ubicazione: z.string().default(""),
  cliente: z.string().default(""),
  nome: z.string().default(""),
  cognome: z.string().default(""),
  telefono: z.string().default(""),
  ditta: z.string().default(""),
  tdoc: z.enum(TDOCS).default(""),
  ndoc: z.string().default(""),
  scadenza: z.union([z.string().default(""), z.coerce.date()]),
  targa1: z.string().default(""),
  targa2: z.string().default(""),
  targa3: z.string().default(""),
  targa4: z.string().default(""),
});
export type TInsertBadgeReq = z.infer<typeof INSERT_BADGE_SCHEMA>;

const UPDATE_BADGE_SCHEMA = z.object({
  barcode: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
    .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
    .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG),
  descrizione: z.string().optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  assegnazione: z.string().optional(),
  stato: z.enum(STATI_BADGE).optional(),
  ubicazione: z.string().optional(),
  cliente: z.string().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  telefono: z.string().optional(),
  ditta: z.string().optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z.string().optional(),
  scadenza: z.union([z.string().default(""), z.coerce.date()]).optional(),
  targa1: z.string().optional(),
  targa2: z.string().optional(),
  targa3: z.string().optional(),
  targa4: z.string().optional(),
});
export type TUpdateBadgeReq = z.infer<typeof UPDATE_BADGE_SCHEMA>;

const DELETE_BADGE_SCHEMA = z.object({
  barcode: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
    .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
    .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG),
});

const ASSEGNAZIONE_SCHEMA = z.object({
  badge: z.enum(TIPI_BADGE),
  name: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome per assegnazione") })
    .min(3),
});

const GET_POSTAZIONE_SCHEMA = z.object({
  _id: z.string().length(ID_LEN, ID_LENGTH_ERR_MSG).array().optional(),
  cliente: z.string().array().optional(),
});

const POST_POSTAZIONE_SCHEMA = z.object({
  cliente: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Cliente", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Cliente", STR_MAX_LEN)),
  name: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome per postazione") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Nome", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Nome", STR_MAX_LEN)),
});

const PUT_POSTAZIONE_SCHEMA = z.object({
  _id: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("ID") })
    .length(ID_LEN, ID_LENGTH_ERR_MSG),
  cliente: z
    .string()
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Cliente", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Cliente", STR_MAX_LEN))
    .optional(),
  name: z
    .string()
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Nome", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Nome", STR_MAX_LEN))
    .optional(),
});

const TIMBRA_SCHEMA = z.object({
  barcode: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Barcode") })
    .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
    .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG),
  postazioneId: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("ID") })
    .length(ID_LEN, ID_LENGTH_ERR_MSG),
});

const GET_INSTRUTT_SCHEMA = z
  .object({
    postazioniIds: z
      .string()
      .length(ID_LEN, ID_LENGTH_ERR_MSG)
      .array()
      .optional(),
    tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  })
  .optional();

const INSERT_DOCUMENTO_SCHEMA = z.object({
  codice: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Codice", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Codice", STR_MAX_LEN)),
  nome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Nome", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Nome", STR_MAX_LEN)),
  cognome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Cognome") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Cognome", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Cognome", STR_MAX_LEN)),
  azienda: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Azienda") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Azienda", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Azienda", STR_MAX_LEN)),
});

const UPDATE_DOCUMENTO_SCHEMA = z.object({
  codice: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Codice", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Codice", STR_MAX_LEN)),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  azienda: z.string().optional(),
});

const POST_CALENDARIO_SCHEMA = z.object({
  date: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Data") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Data", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Data", STR_MAX_LEN)),
});

const DELETE_CALENDARIO_SCHEMA = z.object({
  date: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Data") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Data", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Data", STR_MAX_LEN)),
  filename: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome file") })
    .min(STR_MIN_LEN, ATTR_TOO_SHORT_ERR_MSG("Nome file", STR_MIN_LEN))
    .max(STR_MAX_LEN, ATTR_TOO_LONG_ERR_MSG("Nome file", STR_MAX_LEN)),
});

const PRESTITO_CHIAVE_SCHEMA = z.object({
  barcodes: z
    .string()
    .min(BARCODE_MIN_LEN, BARCODE_TOO_SHORT_ERR_MSG)
    .max(BARCODE_MAX_LEN, BARCODE_TOO_LONG_ERR_MSG)
    .array()
    .nonempty(MISSING_ATTR_ERR_MSG("Barcodes")),
  postazioneId: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("ID") })
    .length(ID_LEN, ID_LENGTH_ERR_MSG),
});

export default class Validator {
  static login(input: unknown) {
    return LOGIN_SCHEMA.safeParse(input);
  }

  static register(input: unknown) {
    return REGISTER_SCHEMA.safeParse(input);
  }

  static logout(input: unknown) {
    return GET_USER_SCHEMA.safeParse(input);
  }

  static getUser(input: unknown) {
    return GET_USER_SCHEMA.safeParse(input);
  }

  static updateUser(input: unknown) {
    return UPDATE_USER_SCHEMA.safeParse(input);
  }

  static findBadge(input: unknown) {
    return FIND_BADGE_SCHEMA.safeParse(input);
  }

  static insertBadge(input: unknown) {
    return INSERT_BADGE_SCHEMA.safeParse(input);
  }

  static updateBadge(input: unknown) {
    return UPDATE_BADGE_SCHEMA.safeParse(input);
  }

  static deleteBadge(input: unknown) {
    return DELETE_BADGE_SCHEMA.safeParse(input);
  }

  static assegnazioni(input: unknown) {
    return ASSEGNAZIONE_SCHEMA.safeParse(input);
  }

  static getPostazioni(input: unknown) {
    return GET_POSTAZIONE_SCHEMA.safeParse(input);
  }

  static postPostazione(input: unknown) {
    return POST_POSTAZIONE_SCHEMA.safeParse(input);
  }

  static putPostazione(input: unknown) {
    return PUT_POSTAZIONE_SCHEMA.safeParse(input);
  }

  static timbra(input: unknown) {
    return TIMBRA_SCHEMA.safeParse(input);
  }

  static getInStrutt(input: unknown) {
    return GET_INSTRUTT_SCHEMA.safeParse(input);
  }

  static insertDocumento(input: unknown) {
    return INSERT_DOCUMENTO_SCHEMA.safeParse(input);
  }

  static updateDocumento(input: unknown) {
    return UPDATE_DOCUMENTO_SCHEMA.safeParse(input);
  }

  static postCalendario(input: unknown) {
    return POST_CALENDARIO_SCHEMA.safeParse(input);
  }

  static deleteCalendario(input: unknown) {
    return DELETE_CALENDARIO_SCHEMA.safeParse(input);
  }

  static prestitoChiave(input: unknown) {
    return PRESTITO_CHIAVE_SCHEMA.safeParse(input);
  }
}
