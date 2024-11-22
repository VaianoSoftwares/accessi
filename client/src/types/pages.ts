import { MAX_UINT32 } from ".";

export enum TPages {
  admin = MAX_UINT32,
  badge = 1,
  chiavi = 2,
  veicoli = 4,
  archivio = 8,
  protocollo = 16,
  anagrafico = 32,
  postazioni = 64,
  clienti = 128,
  register = 256,
  users = 512,
  assegnazioni = 1024,
}

export interface IPageInfo {
  readonly pathname: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly admin: boolean;
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
      admin: false,
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
      admin: false,
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
      admin: false,
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
      admin: false,
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
      admin: false,
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
      admin: false,
      imagePath: "/id_icon_128.png",
    },
  ],
  [
    TPages.register,
    {
      pathname: "/admin/register",
      name: "Registra",
      title: "Registra Account",
      description: "Registrazione nuovo account",
      admin: true,
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TPages.users,
    {
      pathname: "/admin/users",
      name: "Modifica Utenti",
      title: "Modifica Utenti",
      description: "Modifica account utenti",
      admin: true,
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TPages.assegnazioni,
    {
      pathname: "/admin/assegnazioni",
      name: "Assegnazioni",
      title: "Modifica Assegnazioni",
      description: "Gestione delle assegnazioni",
      admin: true,
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TPages.postazioni,
    {
      pathname: "/admin/postazioni",
      name: "Postazioni",
      title: "Modifica Postazioni",
      description: "Gestione delle postazioni",
      admin: true,
      imagePath: "/user_icon_128.png",
    },
  ],
  [
    TPages.clienti,
    {
      pathname: "/admin/clienti",
      name: "Clienti",
      title: "Modifica Clienti",
      description: "Gestione dei clienti",
      admin: true,
      imagePath: "/user_icon_128.png",
    },
  ],
]);
