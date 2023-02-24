import dateFormat from "dateformat";
import { TInStruttResp, TArchivioResp } from "../types/Archivio";
import { TBadgeResp } from "../types/Badge";
import { BadgeFormState } from "../types/BadgeFormState";
import { TTableContent, TInStruttTableContent, TArchTableContent } from "../types/TableContentElem";

export class TableContentMapper {
  static toStrDate(date: Date | string) {
    return new Date(date).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
    });
  }

  static mapBadgesToTableContent(data: TBadgeResp[]): TTableContent[] {
    return data.map((elem: TBadgeResp) => ({
      codice: elem.barcode,
      tipo: elem.tipo,
      assegnaz: elem.assegnazione,
      nome: elem.nome,
      cognome: elem.cognome,
      ditta: elem.ditta,
    }));
  }

  static mapArchivioToInStruttTableContent(
    data: TInStruttResp[]
  ): TInStruttTableContent[] {
    return data.map((elem: TInStruttResp) => ({
      codice: elem.codice,
      cliente: elem.cliente,
      postazione: elem.postazione,
      tipo: elem.tipo,
      assegnaz: elem.assegnaz,
      nome: elem.nome,
      cognome: elem.cognome,
      ditta: elem.ditta,
      entrata: this.toStrDate(elem.entrata),
    }));
  }

  static mapArchivioToTableContent(
    data: TArchivioResp[]
  ): TArchTableContent[] {
    return data.map((elem: TArchivioResp) => ({
      ...elem,
      entrata: this.toStrDate(elem.entrata),
      uscita: this.toStrDate(elem.uscita),
    }));
  }

  static mapToAutoComplBadge(badge: TBadgeResp, postazione: string): BadgeFormState {
    return {
      ...badge,
      pfp: "",
      postazione,
      scadenza: badge.scadenza
        ? dateFormat(new Date(badge.scadenza), "yyyy-mm-dd")
        : "",
    };
  }

  static parseDate(elements: Record<string, string>[]) {
    if(elements.length === 0) return;
    
    if("prestito" in elements[0]) {
      if("reso" in elements[0]) {
        elements.forEach(element => {
          element.prestito = this.toStrDate(element.prestito);
          element.reso = this.toStrDate(element.reso);
        });
      }
      else {
        elements.forEach(element => {
          element.prestito = this.toStrDate(element.prestito);
        });
      }
    }
    else if("entrata" in elements[0]) {
      if("uscita" in elements[0]) {
        elements.forEach(element => {
          element.entrata = this.toStrDate(element.entrata);
          element.uscita = this.toStrDate(element.uscita);
        });
      }
      else {
        elements.forEach(element => {
          element.entrata = this.toStrDate(element.entrata);
        });
      }
    }
  }

  static mapToFindArchBadge(element: Record<string, string>) {
    return {
      ...element,
      barcode: element.nominativo || "",
      nome: element.nome || "",
      cognome: element.cognome || "",
    };
  }
}