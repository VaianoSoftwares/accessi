import { MAX_UINT32 } from ".";

export enum TPages {
  admin = MAX_UINT32,
  badge = 1,
  chiavi = 2,
  veicoli = 4,
  archivio = 8,
  protocollo = 16,
  anagrafico = 32,
}

export enum TAdminPages {
  register = 1_000_000,
  users,
  assegnazioni,
  postazioni,
  clienti,
}

export interface IPageInfo {
  readonly pathname: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly imagePath?: string;
}

export const PAGES_INFO: ReadonlyMap<TPages, IPageInfo> = new Map([
  [
    TPages.badge,
    {
      pathname: "/badge",
      name: "Badge",
      title: "Gestione Badge",
      description: "Pagina di gestione badge",
      imagePath: "/badge_icon_128.png",
    },
  ],
  [
    TPages.chiavi,
    {
      pathname: "/chiavi",
      name: "Chiavi",
      title: "Gestione Chiavi",
      description: "Pagina di gestione chiavi",
      imagePath: "/key_icon_128.png",
    },
  ],
  [
    TPages.veicoli,
    {
      pathname: "/veicoli",
      name: "Veicoli",
      title: "Gestione Veicoli",
      description: "Pagina di gestione veicoli",
      imagePath: "/car_icon_128.png",
    },
  ],
  [
    TPages.archivio,
    {
      pathname: "/archivio",
      name: "Archivio",
      title: "Archivio",
      description: "Monitoraggio archivio resoconti",
      imagePath: "/archive_icon_128.png",
    },
  ],
  [
    TPages.protocollo,
    {
      pathname: "/protocollo",
      name: "Protocollo",
      title: "Protocollo Elettronico",
      description: "Pagina per condivisione documenti",
      imagePath: "/document_icon_128.png",
    },
  ],
  [
    TPages.anagrafico,
    {
      pathname: "/anagrafico",
      name: "Anagrafico",
      title: "Anagrafico",
      description: "Gestione personale e badge",
      imagePath: "/id_icon_128.png",
    },
  ],
]);

export const ADMIN_PAGES_INFO: ReadonlyMap<TAdminPages, IPageInfo> = new Map([
  [
    TAdminPages.register,
    {
      pathname: "/admin/register",
      name: "Registra",
      title: "Registra Account",
      description: "Registrazione nuovo account",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TAdminPages.users,
    {
      pathname: "/admin/users",
      name: "Modifica Utenti",
      title: "Modifica Utenti",
      description: "Modifica account utenti",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TAdminPages.assegnazioni,
    {
      pathname: "/admin/assegnazioni",
      name: "Assegnazioni",
      title: "Modifica Assegnazioni",
      description: "Gestione delle assegnazioni",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TAdminPages.postazioni,
    {
      pathname: "/admin/postazioni",
      name: "Postazioni",
      title: "Modifica Postazioni",
      description: "Gestione delle postazioni",
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TAdminPages.clienti,
    {
      pathname: "/admin/clienti",
      name: "Clienti",
      title: "Modifica Clienti",
      description: "Gestione dei clienti",
      imagePath: "/user_icon_128.png",
    },
  ],
]);

export type TGenericPage = TPages | TAdminPages;
