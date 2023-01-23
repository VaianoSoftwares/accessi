import Joi from "joi";

export default class Validator {

    static login(data: unknown) {
        const schema = Joi.object({
          username: Joi.string().min(5).max(32).required(),
          password: Joi.string().min(6).required(),
        });
        
        return schema.validate(data);
    }

    static register(data: unknown) {
        const schema = Joi.object({
          username: Joi.string().min(6).max(32).required(),
          password: Joi.string().min(6).required(),
          admin: Joi.bool(),
          clienti: Joi.array(),
          postazioni: Joi.array(),
        });
    
        return schema.validate(data);
    }

    static logout(data: unknown) {
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      return schema.validate(data);
    }

    static getUser(data: unknown) {
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      return schema.validate(data);
    }
    
    static badgeDoc(data: unknown) {
        const schema = Joi.object({
          barcode: Joi.string().min(3).max(32).required(),
          descrizione: Joi.string(),
          tipo: Joi.string(),
          assegnazione: Joi.string(),
          stato: Joi.string(),
          ubicazione: Joi.string(),
          nome: Joi.string(),
          cognome: Joi.string(),
          telefono: Joi.string(),
          ditta: Joi.string(),
          tdoc: Joi.string(),
          ndoc: Joi.string(),
          scadenza: Joi.string(),
          targa1: Joi.string(),
          targa2: Joi.string(),
          targa3: Joi.string(),
          targa4: Joi.string(),
        });

        return schema.validate(data);
    }

    static enumDoc(data: unknown) {
        const scheme = Joi.object({
          badge: Joi.string().required(),
          name: Joi.string().required(),
        });

        return scheme.validate(data);
    }

    static timbra(data: unknown) {
        const scheme = Joi.object({
          barcode: Joi.string().min(3).max(32).required(),
          cliente: Joi.string().required(),
          postazione: Joi.string().required(),
          nome: Joi.string(),
          cognome: Joi.string(),
          ditta: Joi.string(),
          telefono: Joi.string(),
          tdoc: Joi.string(),
          ndoc: Joi.string(),
          targa1: Joi.string(),
          targa2: Joi.string(),
          targa3: Joi.string(),
          targa4: Joi.string(),
        });

        return scheme.validate(data);
    }

    static postDocumento(data: unknown) {
      const scheme = Joi.object({
        codice: Joi.string().required(),
        nome: Joi.string().required(),
        cognome: Joi.string().required(),
        azienda: Joi.string().required(),
      });

      return scheme.validate(data);
    }

    static putDocumento(data: unknown) {
      const scheme = Joi.object({
        codice: Joi.string().required(),
        nome: Joi.string(),
        cognome: Joi.string(),
        azienda: Joi.string(),
      });

      return scheme.validate(data);
    }

    static postCalendario(data: unknown) {
      const scheme = Joi.object({
        date: Joi.string().required()
      });

      return scheme.validate(data);
    }

    static deleteCalendario(data: unknown) {
      const scheme = Joi.object({
        date: Joi.string().required(),
        filename: Joi.string().required()
      });

      return scheme.validate(data);
    }

    static prestitoChiave(data: unknown) {
      const scheme = Joi.object({
        barcodes: Joi.array().required(),
        cliente: Joi.string().required(),
        postazione: Joi.string().required(),
      });

      return scheme.validate(data);
    }
    
}