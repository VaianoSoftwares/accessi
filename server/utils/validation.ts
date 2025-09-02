import z from "zod";
import { TDOCS, TIPI_BADGE, STATI_BADGE, BadgeState } from "../types/badges.js";
import { BarcodePrefix } from "../types/archivio.js";

function MISSING_ATTR_ERR_MSG(attribute: string) {
  return `Campo ${attribute} risulta mancante`;
}
function ATTR_TOO_SHORT_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere almeno ${length} caratteri`;
}
function ATTR_TOO_LONG_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere al massimo ${length} caratteri`;
}
function ATTR_WRONG_LEN_ERR_MSG(attribute: string, length: number) {
  return `Campo ${attribute} deve contenere esattamente ${length} caratteri`;
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
const CODICE_LEN_ERR_MSG = ATTR_WRONG_LEN_ERR_MSG("Barcode", CODICE_LEN);

const BARCODE_LEN = 10;
const BARCODE_LEN_ERR_MSG = ATTR_WRONG_LEN_ERR_MSG("Barcode", BARCODE_LEN);

const ID_STUD_LEN = 7;
const ID_STUD_LEN_ERR_MSG = ATTR_WRONG_LEN_ERR_MSG(
  "Codice Studente",
  ID_STUD_LEN
);

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

const COD_FISC_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice fiscale") })
  .length(16, ATTR_WRONG_LEN_ERR_MSG("Codice Fiscale", 16))
  .transform((val) => val.toUpperCase());

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
  postazioni_ids: z
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
    postazioni_ids: z
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
export const CODICE_MAZZO_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .startsWith(BarcodePrefix.mazzoChiavi, "Codice non valido")
  .length(CODICE_LEN, CODICE_LEN_ERR_MSG);
export const CODICE_STUDENTE_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice") })
  .regex(/^\d+$/, "Codice studente deve contenere solo cifre numeriche")
  .length(ID_STUD_LEN, ID_STUD_LEN_ERR_MSG);
export const CODICE_PROV_OR_STUD_SCHEMA = z.union([
  CODICE_PROV_SCHEMA,
  CODICE_STUDENTE_SCHEMA,
]);
export const CODICE_SCHEMA = z.union([
  CODICE_NOM_SCHEMA,
  CODICE_PROV_SCHEMA,
  CODICE_CHIAVE_SCHEMA,
  CODICE_VEICOLO_SCHEMA,
  CODICE_STUDENTE_SCHEMA,
]);

export const ZUC_COD_SCHEMA = z
  .string({ required_error: MISSING_ATTR_ERR_MSG("Codice Zucchetti") })
  .regex(/^\d+$/, "Codice Zucchetti deve contenere solo cifre numeriche")
  .length(6, ATTR_WRONG_LEN_ERR_MSG("Codice Zucchetti", 6));

export const GET_NOMINATIVI_SCHEMA = z.object({
  codice: CODICE_NOM_SCHEMA.nullish(),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cliente: z.string().nullish(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cod_fisc: COD_FISC_SCHEMA.nullish(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  scadenza: z.coerce.date().nullish(),
  zuc_cod: ZUC_COD_SCHEMA.nullish(),
});
export type FindNominativiFilter = z.infer<typeof GET_NOMINATIVI_SCHEMA>;

export const INSERT_NOMINATIVO_SCHEMA = z.object({
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z.enum(STATI_BADGE).default(BadgeState.VALIDO),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  nome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome") })
    .transform((val) => val.toUpperCase()),
  cognome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Cognome") })
    .transform((val) => val.toUpperCase()),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cod_fisc: COD_FISC_SCHEMA.nullish(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  scadenza: z.coerce.date().nullish(),
  zuc_cod: ZUC_COD_SCHEMA.nullish(),
});
export type InsertNominativoData = z.infer<typeof INSERT_NOMINATIVO_SCHEMA>;

export const UPDATE_NOMINATIVO_SCHEMA = z.object({
  codice: CODICE_NOM_SCHEMA,
  updateData: GET_NOMINATIVI_SCHEMA.omit({ codice: true }),
});
export type UpdateNominativoData = z.infer<typeof UPDATE_NOMINATIVO_SCHEMA>;

export const GET_PROVVISORI_SCHEMA = z.object({
  codice: CODICE_PROV_OR_STUD_SCHEMA.nullish(),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cliente: z.string().nullish(),
  ubicazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
});
export type FindProvvisoriFilter = z.infer<typeof GET_PROVVISORI_SCHEMA>;

export const INSERT_PROVVISORIO_SCHEMA = z.object({
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z.enum(STATI_BADGE).default(BadgeState.VALIDO),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  ubicazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
});
export type InsertProvvisorioData = z.infer<typeof INSERT_PROVVISORIO_SCHEMA>;

export const UPDATE_PROVVISORIO_SCHEMA = z.object({
  codice: CODICE_PROV_OR_STUD_SCHEMA,
  updateData: GET_PROVVISORI_SCHEMA.omit({ codice: true }),
});
export type UpdateProvvisorioData = z.infer<typeof UPDATE_PROVVISORIO_SCHEMA>;

export const GET_VEICOLI_SCHEMA = z.object({
  codice: CODICE_VEICOLO_SCHEMA.nullish(),
  targa: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  tipo: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cliente: z.string().nullish(),
  proprietario: CODICE_NOM_SCHEMA.nullish(),
});
export type FindVeicoliFilter = z.infer<typeof GET_VEICOLI_SCHEMA>;

export const INSERT_VEICOLO_SCHEMA = z.object({
  targa: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Targa") })
    .transform((val) => val.toUpperCase()),
  tipo: z
    .string()
    .transform((val) => val.toUpperCase())
    .default("GENERICO"),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z.enum(STATI_BADGE).default(BadgeState.VALIDO),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  proprietario: CODICE_NOM_SCHEMA,
});
export type InsertVeicoloData = z.infer<typeof INSERT_VEICOLO_SCHEMA>;

export const UPDATE_VEICOLO_SCHEMA = z.object({
  codice: CODICE_VEICOLO_SCHEMA,
  updateData: GET_VEICOLI_SCHEMA.omit({ codice: true }),
});
export type UpdateVeicoloData = z.infer<typeof UPDATE_VEICOLO_SCHEMA>;

export const GET_CHIAVI_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA.nullish(),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cliente: z.string().nullish(),
  proprietario: CODICE_NOM_SCHEMA.nullish(),
  indirizzo: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  edificio: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  citta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  piano: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ubicazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  mazzo: CODICE_MAZZO_SCHEMA.nullish(),
});
export type FindChiaviFilter = z.infer<typeof GET_CHIAVI_SCHEMA>;

export const INSERT_CHIAVE_SCHEMA = z.object({
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z.enum(STATI_BADGE).default(BadgeState.VALIDO),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  proprietario: CODICE_NOM_SCHEMA.nullish(),
  indirizzo: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  edificio: z
    .string()
    .transform((val) => val.toUpperCase())
    .default("GENERICO"),
  citta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  piano: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ubicazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  mazzo: CODICE_MAZZO_SCHEMA.nullish(),
});
export type InsertChiaveData = z.infer<typeof INSERT_CHIAVE_SCHEMA>;

export const UPDATE_CHIAVE_SCHEMA = z.object({
  codice: CODICE_CHIAVE_SCHEMA,
  updateData: GET_CHIAVI_SCHEMA.omit({ codice: true }),
});
export type UpdateChiaveData = z.infer<typeof UPDATE_CHIAVE_SCHEMA>;

export const GET_MAZZI_SCHEMA = z.object({
  codice: CODICE_MAZZO_SCHEMA.nullish(),
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cliente: z.string().nullish(),
});
export type FindMazziFilter = z.infer<typeof GET_MAZZI_SCHEMA>;

export const INSERT_MAZZO_SCHEMA = z.object({
  descrizione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  stato: z.enum(STATI_BADGE).default(BadgeState.VALIDO),
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
});
export type InsertMazzoData = z.infer<typeof INSERT_MAZZO_SCHEMA>;

export const UPDATE_MAZZO_SCHEMA = z.object({
  codice: CODICE_MAZZO_SCHEMA,
  updateData: GET_MAZZI_SCHEMA.omit({ codice: true }),
});
export type UpdateMazzoData = z.infer<typeof UPDATE_MAZZO_SCHEMA>;

export const GET_PEOPLE_SCHEMA = z.object({
  id: ID_SCHEMA("Persona ID").nullish(),
  cliente: z.string().nullish(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cod_fisc: COD_FISC_SCHEMA.nullish(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
});
export type FindPeopleFilter = z.infer<typeof GET_NOMINATIVI_SCHEMA>;

export const INSERT_PERSON_SCHEMA = z.object({
  cliente: z.string({ required_error: MISSING_ATTR_ERR_MSG("Cliente") }),
  nome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Nome") })
    .transform((val) => val.toUpperCase()),
  cognome: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Cognome") })
    .transform((val) => val.toUpperCase()),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  cod_fisc: COD_FISC_SCHEMA.nullish(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .nullish(),
});
export type InsertPersonData = z.infer<typeof INSERT_PERSON_SCHEMA>;

export const UPDATE_PERSON_SCHEMA = z.object({
  id: ID_SCHEMA(),
  updateData: GET_PEOPLE_SCHEMA.omit({ id: true }),
});
export type UpdatePersonData = z.infer<typeof UPDATE_PERSON_SCHEMA>;

export const GET_ARCHIVIO_SCHEMA = z.object({
  id: ID_SCHEMA().optional(),
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  targa: z.string().optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  in_out: z.string().optional(),
  pausa: z.string().optional(),
  date_min: z.coerce.date().optional(),
  date_max: z.coerce.date().optional(),
  data_out_min: z.coerce.date().optional(),
  data_out_max: z.coerce.date().optional(),
  postazione: z.string().optional(),
  post_ids: z.array(z.coerce.number()).nonempty().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  ip: z.string().optional(),
  username: z.string().optional(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cod_fisc: COD_FISC_SCHEMA.optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  scadenza: z.coerce.date().optional(),
  indirizzo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  citta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  edificio: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  piano: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tveicolo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
});
export type FindArchivioFilter = z.infer<typeof GET_ARCHIVIO_SCHEMA>;

export const GET_IN_STRUTT_BADGES_SCHEMA = z.object({
  id: ID_SCHEMA().optional(),
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  codice: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  date_min: z.coerce.date().optional(),
  date_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cliente: z.string().optional(),
  pausa: z.coerce.boolean().optional(),
});
export type FindInStruttBadgesFilter = z.infer<
  typeof GET_IN_STRUTT_BADGES_SCHEMA
>;

export const GET_IN_STRUTT_VEICOLI_SCHEMA = z.object({
  id: ID_SCHEMA().optional(),
  codice: CODICE_VEICOLO_SCHEMA.optional(),
  targa: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  veicolo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  tipi: z.enum(TIPI_BADGE).array().nonempty().optional(),
  date_min: z.coerce.date().optional(),
  date_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tveicolo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
});
export type FindInStruttVeicoliFilter = z.infer<
  typeof GET_IN_STRUTT_VEICOLI_SCHEMA
>;

export const FIND_IN_PRESTITO_SCHEMA = z.object({
  badge: z.union([CODICE_NOM_SCHEMA, CODICE_PROV_SCHEMA]).optional(),
  chiave: CODICE_CHIAVE_SCHEMA.optional(),
  date_min: z.coerce.date().optional(),
  date_max: z.coerce.date().optional(),
  post_id: ID_SCHEMA("ID Postazione").optional(),
  postazioniIds: ID_SCHEMA("ID Postazione").array().nonempty().optional(),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z.enum(TDOCS).optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  indirizzo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  citta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  edificio: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  piano: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
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

export const TIMBRA_BADGE_SCHEMA = z.object({
  badge_cod: z.union([
    BARCODE_NOM_ENTRA_SCHEMA,
    BARCODE_NOM_ESCE_SCHEMA,
    BARCODE_PROV_ENTRA_SCHEMA,
    BARCODE_PROV_ESCE_SCHEMA,
    CODICE_STUDENTE_SCHEMA,
  ]),
  created_at: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => (!v ? undefined : new Date(v))),
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

const validPrestaChiaviBadgeSchema = z
  .union([
    BARCODE_CHIAVE_ENTRA_SCHEMA,
    BARCODE_CHIAVE_ESCE_SCHEMA,
    BARCODE_NOM_ENTRA_SCHEMA,
    BARCODE_NOM_ESCE_SCHEMA,
    BARCODE_PROV_ENTRA_SCHEMA,
    BARCODE_PROV_ESCE_SCHEMA,
    CODICE_CHIAVE_SCHEMA,
    CODICE_NOM_SCHEMA,
    CODICE_MAZZO_SCHEMA,
    CODICE_PROV_SCHEMA,
  ])
  .transform((v) => (v.length === 10 ? v.substring(1) : v));

export const TIMBRA_CHIAVI_SCHEMA = z.object({
  post_id: ID_SCHEMA("Postazione ID"),
  barcodes: z.union([
    validPrestaChiaviBadgeSchema.transform((v) => [v]),
    validPrestaChiaviBadgeSchema
      .array()
      .nonempty(MISSING_ATTR_ERR_MSG("Barcodes")),
  ]),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cod_fisc: COD_FISC_SCHEMA.optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
});
export type TimbraChiaviData = z.infer<typeof TIMBRA_CHIAVI_SCHEMA>;

export const PAUSA_SCHEMA = z.object({
  badge_cod: z
    .union([
      BARCODE_NOM_ENTRA_SCHEMA,
      BARCODE_NOM_ESCE_SCHEMA,
      CODICE_NOM_SCHEMA,
    ])
    .transform((value) => (value.length === 9 ? value : value.substring(1))),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
});

export const INSERT_ARCH_BADGE_SCHEMA = z.object({
  badge_cod: z
    .union([
      BARCODE_PROV_ENTRA_SCHEMA,
      BARCODE_PROV_ESCE_SCHEMA,
      CODICE_PROV_SCHEMA,
    ])
    .transform((v) => (v.length === 10 ? v.substring(1) : v)),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .default("OSPITE"),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cod_fisc: COD_FISC_SCHEMA.optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  targa: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
});
export type InsertArchBadgeData = z.infer<typeof INSERT_ARCH_BADGE_SCHEMA>;

export const INSERT_ARCH_VEICOLO_SCHEMA = z.object({
  targa: z
    .string({ required_error: MISSING_ATTR_ERR_MSG("Targa") })
    .transform((val) => val.toUpperCase()),
  post_id: ID_SCHEMA("Postazione ID"),
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  nome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cognome: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  assegnazione: z
    .string()
    .transform((val) => val.toUpperCase())
    .default("OSPITE"),
  ditta: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  cod_fisc: COD_FISC_SCHEMA.optional(),
  telefono: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  ndoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tdoc: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),
  tveicolo: z
    .string()
    .transform((val) => val.toUpperCase())
    .default("GENERICO"),
});
export type InsertArchVeicoloData = z.infer<typeof INSERT_ARCH_VEICOLO_SCHEMA>;

export const GET_RESOCONTO_SCHEMA = z.object({
  minDate: z.coerce.date().optional(),
  maxDate: z.coerce.date().optional(),
  zuc_cod: ZUC_COD_SCHEMA.optional(),
});
export type GetResocontoFilter = z.infer<typeof GET_RESOCONTO_SCHEMA>;

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

export const UPDATE_ARCHIVIO_SCHEMA = z.object({
  id: ID_SCHEMA("Archivio ID"),
  created_at: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => (!v ? undefined : new Date(v))),
});
export type UpdateArchivioData = z.infer<typeof UPDATE_ARCHIVIO_SCHEMA>;

export const TIMBRA_NOM_UTILITY_SCHEMA = z.object({
  badge_cod: z.union([BARCODE_NOM_ENTRA_SCHEMA, BARCODE_NOM_ESCE_SCHEMA]),
  post_id: ID_SCHEMA("Postazione ID"),
  created_at: z.coerce.date({ invalid_type_error: "Data non valida" }),
});

export const TIMBRA_NOM_UTILITY_SCHEMA_ARRAY = z
  .object({
    badge_cod: z.union([BARCODE_NOM_ENTRA_SCHEMA, BARCODE_NOM_ESCE_SCHEMA]),
    post_id: ID_SCHEMA("Postazione ID"),
    created_at: z.coerce.date({ invalid_type_error: "Data non valida" }),
  })
  .array()
  .nonempty("Nessuna timbratura fornita");

export const TIMBRA_NOM_IN_WITH_DATE_SCHEMA = TIMBRA_NOM_UTILITY_SCHEMA.extend({
  ip: z.string().default("unknown"),
  username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
  badge_cod: BARCODE_NOM_ENTRA_SCHEMA,
}).transform((o) => {
  const parsed = {
    ...o,
    badge_cod: o.badge_cod.substring(1),
    created_at: o.created_at,
  };
  const { ["created_at"]: omitted, ...result } = parsed;
  return result;
});
export type TimbraNomInWithDateData = z.infer<
  typeof TIMBRA_NOM_IN_WITH_DATE_SCHEMA
>;

export const TIMBRA_NOM_OUT_WITH_DATE_SCHEMA = TIMBRA_NOM_UTILITY_SCHEMA.extend(
  {
    ip: z.string().default("unknown"),
    username: z.string({ required_error: MISSING_ATTR_ERR_MSG("Username") }),
    badge_cod: BARCODE_NOM_ESCE_SCHEMA,
  }
).transform((o) => {
  const parsed = {
    ...o,
    badge_cod: o.badge_cod.substring(1),
    data_out: o.created_at,
  };
  const { ["created_at"]: omitted, ...result } = parsed;
  return result;
});
export type TimbraNomOutWithDateData = z.infer<
  typeof TIMBRA_NOM_OUT_WITH_DATE_SCHEMA
>;

export const GET_FREE_KEYS_SCHEMA = z
  .object({
    cliente: z.string().optional(),
  })
  .nullish();
