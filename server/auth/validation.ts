import z from "zod";
import { TIPI_BADGE, STATI_BADGE, TDOCS } from "../types/badges.js";

const LOGIN_SCHEMA = z.object({
  username: z.string().min(6).max(32),
  password: z.string().min(6).max(256),
});

const REGISTER_SCHEMA = z.object({
  username: z.string().min(6).max(32),
  password: z.string().min(6).max(256),
  admin: z.coerce.boolean().default(false),
  clienti: z.string().array().optional(),
  postazioni: z.string().array().optional(),
});

const GUEST_SCHEMA = z.object({
  username: z.string().min(6).max(32),
  password: z.string().min(6).max(256),
  admin: z.literal(false),
  clienti: z.string().array().nonempty("Clienti non forniti"),
  postazioni: z.string().array().nonempty("Postazioni non fornite"),
});

const GET_USER_SCHEMA = z.object({
  id: z.string().length(24),
});

const FIND_BADGE_SCHEMA = z
  .object({
    barcode: z.string().min(3).max(32).optional(),
    descrizione: z.string().optional(),
    tipo: z.enum(TIPI_BADGE).optional(),
    assegnazione: z.string().optional(),
    stato: z.enum(STATI_BADGE).optional(),
    ubicazione: z.string().optional(),
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
  barcode: z.string().min(3).max(32),
  descrizione: z.string().default(""),
  tipo: z.enum(TIPI_BADGE).default("BADGE"),
  assegnazione: z.string().default(""),
  stato: z.enum(STATI_BADGE).default("VALIDO"),
  ubicazione: z.string().default(""),
  nome: z.string().default(""),
  cognome: z.string().default(""),
  telefono: z.string().default(""),
  ditta: z.string().default(""),
  tdoc: z.enum(TDOCS).default(""),
  ndoc: z.string().default(""),
  scadenza: z.union([z.coerce.date(), z.literal("")]),
  targa1: z.string().default(""),
  targa2: z.string().default(""),
  targa3: z.string().default(""),
  targa4: z.string().default(""),
});
export type TInsertBadgeReq = z.infer<typeof INSERT_BADGE_SCHEMA>;

const UPDATE_BADGE_SCHEMA = z.object({
  barcode: z.string().min(3).max(32),
  descrizione: z.string().optional(),
  tipo: z.enum(TIPI_BADGE).optional(),
  assegnazione: z.string().optional(),
  stato: z.enum(STATI_BADGE).optional(),
  ubicazione: z.string().optional(),
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
});
export type TUpdateBadgeReq = z.infer<typeof UPDATE_BADGE_SCHEMA>;

const DELETE_BADGE_SCHEMA = z.object({
  barcode: z.string().min(3).max(32),
});

const ASSEGNAZIONE_SCHEMA = z.object({
  badge: z.enum(TIPI_BADGE),
  name: z.string(),
});

const POSTAZIONE_SCHEMA = z.object({
  cliente: z.string(),
  name: z.string(),
});

const TIMBRA_SCHEMA = z.object({
  barcode: z.string().min(3).max(32),
  cliente: z.string(),
  postazione: z.string(),
});

const GET_INSTRUTT_SCHEMA = z
  .object({
    cliente: z.string().optional(),
    postazione: z.string().optional(),
  })
  .optional();

const INSERT_DOCUMENTO_SCHEMA = z.object({
  codice: z.string(),
  nome: z.string(),
  cognome: z.string(),
  azienda: z.string(),
});

const UPDATE_DOCUMENTO_SCHEMA = z.object({
  codice: z.string(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  azienda: z.string().optional(),
});

const POST_CALENDARIO_SCHEMA = z.object({
  date: z.string(),
});

const DELETE_CALENDARIO_SCHEMA = z.object({
  date: z.string(),
  filename: z.string(),
});

const PRESTITO_CHIAVE_SCHEMA = z.object({
  barcodes: z.string().min(3).max(32).array(),
  cliente: z.string(),
  postazione: z.string(),
});

export default class Validator {
  static login(input: unknown) {
    return LOGIN_SCHEMA.safeParse(input);
  }

  static register(input: unknown) {
    const parsed = REGISTER_SCHEMA.safeParse(input);
    if (parsed.success === false || parsed.data.admin === true) return parsed;

    return GUEST_SCHEMA.safeParse(parsed);
  }

  static logout(input: unknown) {
    return GET_USER_SCHEMA.safeParse(input);
  }

  static getUser(input: unknown) {
    return GET_USER_SCHEMA.safeParse(input);
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

  static postazioni(input: unknown) {
    return POSTAZIONE_SCHEMA.safeParse(input);
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
